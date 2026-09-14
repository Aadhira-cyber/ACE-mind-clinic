import { supabase, type AppointmentSlot, type Booking } from './supabase';

export type AppointmentType = 'review' | 'new_patient';

export const DURATION_MAP: Record<AppointmentType, number> = {
  review: 15,
  new_patient: 60,
};

export const TYPE_LABELS: Record<AppointmentType, string> = {
  review: 'Review Consultation',
  new_patient: 'New Patient Consultation',
};

export async function fetchAvailableSlots(date: string, type: AppointmentType): Promise<AppointmentSlot[]> {
  const { data, error } = await supabase
    .from('appointment_slots')
    .select('*')
    .eq('slot_date', date)
    .eq('slot_type', type)
    .eq('status', 'available')
    .order('slot_start', { ascending: true });

  if (error) {
    console.error('Failed to fetch slots:', error);
    return [];
  }
  return (data as AppointmentSlot[]) || [];
}

export async function lockSlot(slotId: string): Promise<boolean> {
  const lockExpiry = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  const sessionId = crypto.randomUUID();

  const { data, error } = await supabase
    .from('appointment_slots')
    .update({
      status: 'locked',
      locked_by: sessionId,
      locked_at: new Date().toISOString(),
      lock_expires_at: lockExpiry,
    })
    .eq('id', slotId)
    .eq('status', 'available')
    .select('*')
    .maybeSingle();

  if (error || !data) {
    return false;
  }
  return true;
}

export async function releaseSlotLock(slotId: string): Promise<void> {
  await supabase
    .from('appointment_slots')
    .update({
      status: 'available',
      locked_by: null,
      locked_at: null,
      lock_expires_at: null,
    })
    .eq('id', slotId);
}

export async function createBooking(params: {
  slot_id: string;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  appointment_type: AppointmentType;
  appointment_date: string;
  appointment_time: string;
  is_new_patient: boolean;
}): Promise<Booking | null> {
  const { data: slot } = await supabase
    .from('appointment_slots')
    .select('*')
    .eq('id', params.slot_id)
    .maybeSingle();

  if (!slot || (slot as AppointmentSlot).status !== 'locked' && (slot as AppointmentSlot).status !== 'available') {
    console.error('Slot is no longer available');
    return null;
  }

  const { data, error } = await supabase
    .from('bookings')
    .insert({
      slot_id: params.slot_id,
      patient_name: params.patient_name,
      patient_email: params.patient_email,
      patient_phone: params.patient_phone,
      appointment_type: params.appointment_type,
      appointment_date: params.appointment_date,
      appointment_time: params.appointment_time,
      duration_minutes: DURATION_MAP[params.appointment_type],
      is_new_patient: params.is_new_patient,
      status: 'confirmed',
    })
    .select('*')
    .maybeSingle();

  if (error || !data) {
    console.error('Failed to create booking:', error);
    return null;
  }

  await supabase
    .from('appointment_slots')
    .update({
      status: 'booked',
      locked_by: null,
      locked_at: null,
      lock_expires_at: null,
    })
    .eq('id', params.slot_id);

  const booking = data as Booking;

  const reminderTime = new Date(`${params.appointment_date}T${params.appointment_time}`);
  reminderTime.setHours(reminderTime.getHours() - 24);

  await supabase.from('notifications').insert([
    {
      booking_id: booking.id,
      channel: 'email',
      recipient: params.patient_email,
      recipient_type: 'patient',
      subject: 'Appointment Confirmation - Acemind Clinic',
      message: `Dear ${params.patient_name}, your appointment at Acemind Clinic is confirmed for ${params.appointment_date} at ${params.appointment_time}. Type: ${TYPE_LABELS[params.appointment_type]}. Please arrive 10 minutes early. - Acemind Clinic`,
      scheduled_for: reminderTime.toISOString(),
      status: 'pending',
    },
    {
      booking_id: booking.id,
      channel: 'sms',
      recipient: params.patient_phone,
      recipient_type: 'patient',
      message: `Acemind Clinic: Appointment confirmed for ${params.appointment_date} at ${params.appointment_time}. ${TYPE_LABELS[params.appointment_type]}. Please arrive 10 mins early.`,
      scheduled_for: reminderTime.toISOString(),
      status: 'pending',
    },
    {
      booking_id: booking.id,
      channel: 'email',
      recipient: 'staff@acemindclinic.com',
      recipient_type: 'staff',
      subject: 'New Booking - Acemind Clinic',
      message: `New booking: ${params.patient_name} on ${params.appointment_date} at ${params.appointment_time}. Type: ${TYPE_LABELS[params.appointment_type]}. Email: ${params.patient_email}, Phone: ${params.patient_phone}`,
      scheduled_for: new Date().toISOString(),
      status: 'pending',
    },
  ]);

  return booking;
}

export async function triggerEmergencyCancellation(date: string, reason: string, doctorId: string): Promise<number> {
  const { data, error } = await supabase.rpc('trigger_emergency_cancel', {
    target_date: date,
    cancel_reason: reason,
    doctor_id: doctorId,
  });

  if (error) {
    console.error('Emergency cancel failed:', error);
    return 0;
  }
  return (data as number) || 0;
}
