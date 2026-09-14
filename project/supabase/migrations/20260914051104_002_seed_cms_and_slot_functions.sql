/*
# Seed CMS Content and Slot Generation Function

1. Seeds cms_content with default website content (home, services, about, FAQ, contact, footer, booking, intake)
2. Creates generate_appointment_slots() function for creating time slots
3. Generates slots for the next 30 days
4. Creates trigger_emergency_cancel() function for emergency cancellation workflow
*/

-- ============================================================
-- SEED CMS CONTENT
-- ============================================================
INSERT INTO cms_content (section, key, value, is_visible, sort_order) VALUES
('home', 'hero_title', 'Your Mind Deserves Expert Care', true, 1),
('home', 'hero_subtitle', 'Compassionate psychiatric and counselling services for individuals, couples, and families', true, 2),
('home', 'hero_cta_primary', 'Book an Appointment', true, 3),
('home', 'hero_cta_secondary', 'Explore Services', true, 4),
('home', 'hero_badge', 'Accepting new patients', true, 5),
('about', 'title', 'About the Practitioner', true, 1),
('about', 'name', 'Prof. Dr. R. Arul Saravanan', true, 2),
('about', 'credentials', 'MD, DPM (Consultant Psychiatrist)', true, 3),
('about', 'bio', 'Prof. Dr. R. Arul Saravanan is a distinguished Consultant Psychiatrist with decades of experience in mental health care. With a deep commitment to compassionate, evidence-based treatment, Dr. Saravanan has helped countless individuals navigate anxiety, depression, relationship challenges, and complex psychiatric conditions. His approach blends clinical expertise with genuine human warmth, ensuring every patient feels heard, understood, and supported on their journey to wellness.', true, 4),
('about', 'philosophy_title', 'Our Philosophy', true, 5),
('about', 'philosophy_text', 'We believe mental health care should be accessible, dignified, and tailored to each individual. Every person who walks through our doors receives personalized attention in a calm, confidential, and judgment-free environment.', true, 6),
('about', 'achievement_1', '30+ years of clinical experience in psychiatry', true, 7),
('about', 'achievement_2', 'Former Professor of Psychiatry at leading medical institutions', true, 8),
('about', 'achievement_3', 'Published researcher in mood disorders and cognitive therapy', true, 9),
('about', 'achievement_4', 'Active member of national and international psychiatric associations', true, 10),
('services', 'title', 'Our Services', true, 1),
('services', 'subtitle', 'Comprehensive mental health care tailored to your needs', true, 2),
('services', 'service_1_title', 'Counselling Services', true, 3),
('services', 'service_1_desc', 'Individual, couples, and family counselling sessions in a safe, confidential setting. Our therapeutic approach helps you navigate life challenges, relationship difficulties, and emotional distress with professional guidance.', true, 4),
('services', 'service_1_icon', 'heart', true, 5),
('services', 'service_2_title', 'Outpatient Services', true, 6),
('services', 'service_2_desc', 'Comprehensive psychiatric consultations strictly by appointment. New patient consultations are thorough and unhurried, while review consultations are focused and efficient. Every visit is tailored to your specific needs.', true, 7),
('services', 'service_2_icon', 'stethoscope', true, 8),
('services', 'service_3_title', 'Online Counselling', true, 9),
('services', 'service_3_desc', 'Anonymised online counselling sessions available on an exception basis. Connect with us from the comfort and privacy of your home. Please note: no digital prescriptions are provided through online consultations.', true, 10),
('services', 'service_3_icon', 'video', true, 11),
('faq', 'title', 'Frequently Asked Questions', true, 1),
('faq', 'q1', 'How do I book an appointment?', true, 2),
('faq', 'a1', 'You can book an appointment directly through our website. Choose between a 15-minute review consultation or a 1-hour new patient consultation, select an available time slot, and confirm your booking instantly. All appointments are strictly on an appointment basis.', true, 3),
('faq', 'q2', 'What are the clinic operating hours?', true, 4),
('faq', 'a2', 'The clinic operates from 6:00 PM to 9:00 PM, Monday through Saturday. We are closed on Sundays.', true, 5),
('faq', 'q3', 'What is the difference between a review and new patient consultation?', true, 6),
('faq', 'a3', 'A review consultation is a 15-minute follow-up for existing patients to assess progress and adjust treatment. A new patient consultation is a comprehensive 1-hour session that includes a thorough assessment of your history, symptoms, and treatment goals.', true, 7),
('faq', 'q4', 'Do you offer online counselling?', true, 8),
('faq', 'a4', 'Yes, we offer anonymised online counselling on an exception basis. This is ideal for patients who cannot visit in person. Please note that no digital prescriptions are provided through online consultations.', true, 9),
('faq', 'q5', 'Is my information kept confidential?', true, 10),
('faq', 'a5', 'Absolutely. Patient confidentiality is our highest priority. All consultations, records, and intake information are stored securely and accessible only to the treating physician. We adhere to the strictest medical privacy standards.', true, 11),
('faq', 'q6', 'What should I bring to my first appointment?', true, 12),
('faq', 'a6', 'For your first appointment, please complete the online patient intake form beforehand. Bring any previous medical records, a list of current medications, and your insurance information if applicable. Arrive 10 minutes early to settle in.', true, 13),
('contact', 'title', 'Get in Touch', true, 1),
('contact', 'subtitle', 'We are here to help. Reach out to schedule your visit.', true, 2),
('contact', 'address', '23, Vivekanandha Nagar, Potheri, Kattankulathur', true, 3),
('contact', 'hours', '6:00 PM to 9:00 PM, Monday to Saturday', true, 4),
('contact', 'phone', '+91 98765 43210', true, 5),
('contact', 'email', 'care@acemindclinic.com', true, 6),
('contact', 'closed_note', 'Sundays: Closed', true, 7),
('footer', 'copyright', '© 2026 Acemind Clinic. All rights reserved.', true, 1),
('footer', 'tagline', 'Compassionate mental health care you can trust.', true, 2),
('booking', 'title', 'Book Your Appointment', true, 1),
('booking', 'subtitle', 'Select a time that works for you. Confirm in seconds.', true, 2),
('booking', 'review_desc', '15-minute follow-up consultation for existing patients', true, 3),
('booking', 'new_patient_desc', '60-minute comprehensive consultation for new patients', true, 4),
('intake', 'title', 'Patient Intake Form', true, 1),
('intake', 'subtitle', 'Please complete this form before your first appointment. All information is kept strictly confidential.', true, 2)
ON CONFLICT (section, key) DO NOTHING;

-- ============================================================
-- SLOT GENERATION FUNCTION
-- ============================================================
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
  
  -- Review slots (15 min): 6:00 PM to 8:45 PM
  t := '18:00'::time;
  review_end := '20:45'::time;
  
  WHILE t <= review_end LOOP
    INSERT INTO appointment_slots (slot_date, slot_start, slot_end, slot_type, status)
    VALUES (target_date, t, t + interval '15 minutes', 'review', 'available')
    ON CONFLICT (slot_date, slot_start, slot_type) DO NOTHING;
    
    t := t + interval '15 minutes';
  END LOOP;
  
  -- New patient slots (60 min): 6:00 PM, 7:00 PM, 8:00 PM
  t := '18:00'::time;
  WHILE t < '21:00'::time LOOP
    INSERT INTO appointment_slots (slot_date, slot_start, slot_end, slot_type, status)
    VALUES (target_date, t, t + interval '60 minutes', 'new_patient', 'available')
    ON CONFLICT (slot_date, slot_start, slot_type) DO NOTHING;
    
    t := t + interval '60 minutes';
  END LOOP;
  
  RETURN slot_count;
END;
$$ LANGUAGE plpgsql;

-- Generate slots for the next 30 days
DO $$
DECLARE
  d date := current_date;
  i int;
BEGIN
  FOR i IN 0..30 LOOP
    PERFORM generate_appointment_slots(d + i);
  END LOOP;
END;
$$;

-- ============================================================
-- EMERGENCY CANCEL FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION trigger_emergency_cancel(target_date date, cancel_reason text, doctor_id uuid)
RETURNS integer AS $$
DECLARE
  affected_count int := 0;
BEGIN
  -- Update all confirmed bookings on that date to postponed
  UPDATE bookings 
  SET status = 'postponed', updated_at = now()
  WHERE appointment_date = target_date AND status = 'confirmed';
  
  GET DIAGNOSTICS affected_count = ROW_COUNT;
  
  -- Log the emergency cancellation
  INSERT INTO emergency_cancellations (cancel_date, reason, affected_bookings_count, triggered_by)
  VALUES (target_date, cancel_reason, affected_count, doctor_id);
  
  -- Create email notifications for affected patients
  INSERT INTO notifications (booking_id, channel, recipient, recipient_type, subject, message, scheduled_for, status)
  SELECT 
    b.id, 'email', b.patient_email, 'patient',
    'Appointment Postponed - Acemind Clinic',
    'Dear ' || b.patient_name || ', due to an emergency at the clinic, your appointment on ' || target_date || ' has been postponed. We will contact you shortly to reschedule. We apologize for the inconvenience. - Acemind Clinic',
    now(), 'pending'
  FROM bookings b
  WHERE b.appointment_date = target_date AND b.status = 'postponed';
  
  -- Create SMS notifications for affected patients
  INSERT INTO notifications (booking_id, channel, recipient, recipient_type, message, scheduled_for, status)
  SELECT 
    b.id, 'sms', b.patient_phone, 'patient',
    'Acemind Clinic: Your appointment on ' || target_date || ' has been postponed due to an emergency. We will contact you to reschedule. Sorry for the inconvenience.',
    now(), 'pending'
  FROM bookings b
  WHERE b.appointment_date = target_date AND b.status = 'postponed';
  
  -- Free up the slots
  UPDATE appointment_slots 
  SET status = 'available', locked_by = NULL, locked_at = NULL, lock_expires_at = NULL
  WHERE slot_date = target_date AND status = 'booked';
  
  RETURN affected_count;
END;
$$ LANGUAGE plpgsql;
