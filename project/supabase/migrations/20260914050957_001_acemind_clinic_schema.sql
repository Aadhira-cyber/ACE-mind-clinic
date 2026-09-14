/*
# Acemind Clinic - Core Database Schema

Creates the complete database schema for Acemind Clinic's platform:
CMS content, appointment slots, bookings, patient intake forms,
notification queue, and emergency cancellation tracking.

## Tables
- cms_content: editable website content (public read, doctor write)
- appointment_slots: time slots within operating hours (public read, doctor manage)
- bookings: patient appointments (anon insert, doctor manage)
- intake_forms: patient medical data (anon insert, DOCTOR-ONLY read)
- notifications: SMS/email queue (anon insert, doctor manage)
- emergency_cancellations: doctor emergency cancel log (doctor only)
*/

-- ============================================================
-- CMS CONTENT TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS cms_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section text NOT NULL,
  key text NOT NULL,
  value text NOT NULL DEFAULT '',
  is_visible boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (section, key)
);

ALTER TABLE cms_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_cms" ON cms_content;
CREATE POLICY "anon_read_cms" ON cms_content FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "doctor_insert_cms" ON cms_content;
CREATE POLICY "doctor_insert_cms" ON cms_content FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "doctor_update_cms" ON cms_content;
CREATE POLICY "doctor_update_cms" ON cms_content FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "doctor_delete_cms" ON cms_content;
CREATE POLICY "doctor_delete_cms" ON cms_content FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- APPOINTMENT SLOTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS appointment_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_date date NOT NULL,
  slot_start time NOT NULL,
  slot_end time NOT NULL,
  slot_type text NOT NULL DEFAULT 'review' CHECK (slot_type IN ('review', 'new_patient')),
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'locked', 'booked')),
  locked_by uuid,
  locked_at timestamptz,
  lock_expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE (slot_date, slot_start, slot_type)
);

ALTER TABLE appointment_slots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_slots" ON appointment_slots;
CREATE POLICY "anon_read_slots" ON appointment_slots FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "doctor_insert_slots" ON appointment_slots;
CREATE POLICY "doctor_insert_slots" ON appointment_slots FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "doctor_update_slots" ON appointment_slots;
CREATE POLICY "doctor_update_slots" ON appointment_slots FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "doctor_delete_slots" ON appointment_slots;
CREATE POLICY "doctor_delete_slots" ON appointment_slots FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- BOOKINGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id uuid REFERENCES appointment_slots(id) ON DELETE SET NULL,
  patient_name text NOT NULL,
  patient_email text NOT NULL,
  patient_phone text NOT NULL,
  appointment_type text NOT NULL CHECK (appointment_type IN ('review', 'new_patient')),
  appointment_date date NOT NULL,
  appointment_time time NOT NULL,
  duration_minutes int NOT NULL DEFAULT 15,
  status text NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'postponed', 'completed')),
  is_new_patient boolean NOT NULL DEFAULT false,
  notes text,
  google_calendar_event_id text,
  reminder_sent boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_bookings" ON bookings;
CREATE POLICY "anon_insert_bookings" ON bookings FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_read_bookings" ON bookings;
CREATE POLICY "anon_read_bookings" ON bookings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "doctor_update_bookings" ON bookings;
CREATE POLICY "doctor_update_bookings" ON bookings FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "doctor_delete_bookings" ON bookings;
CREATE POLICY "doctor_delete_bookings" ON bookings FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- INTAKE FORMS TABLE (DOCTOR-ONLY ACCESS)
-- ============================================================
CREATE TABLE IF NOT EXISTS intake_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id) ON DELETE SET NULL,
  patient_name text NOT NULL,
  patient_email text NOT NULL,
  patient_phone text NOT NULL,
  patient_age int,
  patient_gender text,
  emergency_contact_name text,
  emergency_contact_phone text,
  chief_complaint text NOT NULL,
  medical_history jsonb DEFAULT '{}'::jsonb,
  current_prescriptions jsonb DEFAULT '[]'::jsonb,
  psychological_baseline jsonb DEFAULT '{}'::jsonb,
  family_history text,
  previous_treatment text,
  consent_given boolean NOT NULL DEFAULT false,
  google_drive_folder_id text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE intake_forms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_intake" ON intake_forms;
CREATE POLICY "anon_insert_intake" ON intake_forms FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "doctor_read_intake" ON intake_forms;
CREATE POLICY "doctor_read_intake" ON intake_forms FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "doctor_update_intake" ON intake_forms;
CREATE POLICY "doctor_update_intake" ON intake_forms FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "doctor_delete_intake" ON intake_forms;
CREATE POLICY "doctor_delete_intake" ON intake_forms FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- NOTIFICATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id) ON DELETE SET NULL,
  channel text NOT NULL CHECK (channel IN ('sms', 'email')),
  recipient text NOT NULL,
  recipient_type text NOT NULL CHECK (recipient_type IN ('patient', 'staff')),
  subject text,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  scheduled_for timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_notifications" ON notifications;
CREATE POLICY "anon_insert_notifications" ON notifications FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "doctor_read_notifications" ON notifications;
CREATE POLICY "doctor_read_notifications" ON notifications FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "doctor_update_notifications" ON notifications;
CREATE POLICY "doctor_update_notifications" ON notifications FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- EMERGENCY CANCELLATIONS TABLE (DOCTOR-ONLY)
-- ============================================================
CREATE TABLE IF NOT EXISTS emergency_cancellations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cancel_date date NOT NULL,
  reason text NOT NULL,
  affected_bookings_count int NOT NULL DEFAULT 0,
  triggered_by uuid,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE emergency_cancellations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "doctor_read_emergency" ON emergency_cancellations;
CREATE POLICY "doctor_read_emergency" ON emergency_cancellations FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "doctor_insert_emergency" ON emergency_cancellations;
CREATE POLICY "doctor_insert_emergency" ON emergency_cancellations FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "doctor_update_emergency" ON emergency_cancellations;
CREATE POLICY "doctor_update_emergency" ON emergency_cancellations FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "doctor_delete_emergency" ON emergency_cancellations;
CREATE POLICY "doctor_delete_emergency" ON emergency_cancellations FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_cms_section ON cms_content(section);
CREATE INDEX IF NOT EXISTS idx_slots_date_type ON appointment_slots(slot_date, slot_type);
CREATE INDEX IF NOT EXISTS idx_slots_status ON appointment_slots(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(appointment_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_intake_email ON intake_forms(patient_email);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_scheduled ON notifications(scheduled_for);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_cms_updated ON cms_content;
CREATE TRIGGER trigger_cms_updated BEFORE UPDATE ON cms_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_bookings_updated ON bookings;
CREATE TRIGGER trigger_bookings_updated BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
