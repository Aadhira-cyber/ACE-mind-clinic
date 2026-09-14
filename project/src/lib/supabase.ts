import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  detectSessionInUrl: true,
  storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
});

export type Booking = {
  id: string;
  slot_id: string | null;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  appointment_type: 'review' | 'new_patient';
  appointment_date: string;
  appointment_time: string;
  duration_minutes: number;
  status: 'confirmed' | 'cancelled' | 'postponed' | 'completed';
  is_new_patient: boolean;
  notes: string | null;
  google_calendar_event_id: string | null;
  reminder_sent: boolean;
  created_at: string;
  updated_at: string;
};

export type AppointmentSlot = {
  id: string;
  slot_date: string;
  slot_start: string;
  slot_end: string;
  slot_type: 'review' | 'new_patient';
  status: 'available' | 'locked' | 'booked';
  locked_by: string | null;
  locked_at: string | null;
  lock_expires_at: string | null;
  created_at: string;
};

export type CmsContent = {
  id: string;
  section: string;
  key: string;
  value: string;
  is_visible: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type IntakeForm = {
  id: string;
  booking_id: string | null;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  patient_age: number | null;
  patient_gender: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  chief_complaint: string;
  medical_history: Record<string, unknown>;
  current_prescriptions: unknown[];
  psychological_baseline: Record<string, unknown>;
  family_history: string | null;
  previous_treatment: string | null;
  consent_given: boolean;
  google_drive_folder_id: string | null;
  created_at: string;
};

export type Notification = {
  id: string;
  booking_id: string | null;
  channel: 'sms' | 'email';
  recipient: string;
  recipient_type: 'patient' | 'staff';
  subject: string | null;
  message: string;
  status: 'pending' | 'sent' | 'failed';
  scheduled_for: string;
  sent_at: string | null;
  created_at: string;
};

export type EmergencyCancellation = {
  id: string;
  cancel_date: string;
  reason: string;
  affected_bookings_count: number;
  triggered_by: string | null;
  created_at: string;
};
