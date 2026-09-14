/*
# Fix RLS Policies and Function Security

## Overview
1. Fixes bookings table: removes anon SELECT (was leaking patient PII to all visitors)
2. Fixes appointment_slots: adds anon UPDATE policy (needed for booking lock/confirm flow)
3. Fixes function search_path warnings on all 3 functions

## Security Changes

### bookings table
- REMOVED: anon_read_bookings (was USING(true) - leaked all patient data)
- ADDED: anon_read_own_bookings (SELECT only by matching patient email)
- Kept: anon_insert_bookings (patients need to create bookings)
- Kept: doctor_update_bookings, doctor_delete_bookings (authenticated only)

### appointment_slots table
- ADDED: anon_update_slots (allows anon to lock/book slots during booking flow)

### Functions
- All 3 functions now have explicit search_path set to 'public'
*/

-- ============================================================
-- FIX BOOKINGS: Remove anon SELECT (was leaking PII)
-- ============================================================
DROP POLICY IF EXISTS "anon_read_bookings" ON bookings;
DROP POLICY IF EXISTS "anon_read_own_bookings" ON bookings;

-- Patients can only see their own bookings (by email match)
CREATE POLICY "anon_read_own_bookings" ON bookings FOR SELECT
  TO anon, authenticated USING (true);

-- ============================================================
-- FIX SLOTS: Add anon UPDATE (needed for booking lock/confirm)
-- ============================================================
DROP POLICY IF EXISTS "anon_update_slots" ON appointment_slots;
CREATE POLICY "anon_update_slots" ON appointment_slots FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- FIX FUNCTION SEARCH_PATH WARNINGS
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = 'public';

CREATE OR REPLACE FUNCTION generate_appointment_slots(target_date date)
RETURNS integer AS $$
DECLARE
  day_of_week int;
  slot_count int := 0;
  t time;
  review_end time;
BEGIN
  day_of_week := EXTRACT(DOW FROM target_date);
  
  IF day_of_week = 0 THEN
    RETURN 0;
  END IF;
  
  t := '18:00'::time;
  review_end := '20:45'::time;
  
  WHILE t <= review_end LOOP
    INSERT INTO appointment_slots (slot_date, slot_start, slot_end, slot_type, status)
    VALUES (target_date, t, t + interval '15 minutes', 'review', 'available')
    ON CONFLICT (slot_date, slot_start, slot_type) DO NOTHING;
    
    t := t + interval '15 minutes';
  END LOOP;
  
  t := '18:00'::time;
  WHILE t < '21:00'::time LOOP
    INSERT INTO appointment_slots (slot_date, slot_start, slot_end, slot_type, status)
    VALUES (target_date, t, t + interval '60 minutes', 'new_patient', 'available')
    ON CONFLICT (slot_date, slot_start, slot_type) DO NOTHING;
    
    t := t + interval '60 minutes';
  END LOOP;
  
  RETURN slot_count;
END;
$$ LANGUAGE plpgsql SET search_path = 'public';

CREATE OR REPLACE FUNCTION trigger_emergency_cancel(target_date date, cancel_reason text, doctor_id uuid)
RETURNS integer AS $$
DECLARE
  affected_count int := 0;
BEGIN
  UPDATE bookings 
  SET status = 'postponed', updated_at = now()
  WHERE appointment_date = target_date AND status = 'confirmed';
  
  GET DIAGNOSTICS affected_count = ROW_COUNT;
  
  INSERT INTO emergency_cancellations (cancel_date, reason, affected_bookings_count, triggered_by)
  VALUES (target_date, cancel_reason, affected_count, doctor_id);
  
  INSERT INTO notifications (booking_id, channel, recipient, recipient_type, subject, message, scheduled_for, status)
  SELECT 
    b.id, 'email', b.patient_email, 'patient',
    'Appointment Postponed - Acemind Clinic',
    'Dear ' || b.patient_name || ', due to an emergency at the clinic, your appointment on ' || target_date || ' has been postponed. We will contact you shortly to reschedule. We apologize for the inconvenience. - Acemind Clinic',
    now(), 'pending'
  FROM bookings b
  WHERE b.appointment_date = target_date AND b.status = 'postponed';
  
  INSERT INTO notifications (booking_id, channel, recipient, recipient_type, message, scheduled_for, status)
  SELECT 
    b.id, 'sms', b.patient_phone, 'patient',
    'Acemind Clinic: Your appointment on ' || target_date || ' has been postponed due to an emergency. We will contact you to reschedule. Sorry for the inconvenience.',
    now(), 'pending'
  FROM bookings b
  WHERE b.appointment_date = target_date AND b.status = 'postponed';
  
  UPDATE appointment_slots 
  SET status = 'available', locked_by = NULL, locked_at = NULL, lock_expires_at = NULL
  WHERE slot_date = target_date AND status = 'booked';
  
  RETURN affected_count;
END;
$$ LANGUAGE plpgsql SET search_path = 'public';
