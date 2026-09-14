import { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, User, Mail, Phone, CheckCircle, ArrowLeft, ArrowRight, Loader2, AlertCircle, Stethoscope, Heart } from 'lucide-react';
import type { CmsContentMap } from '@/lib/cms';
import { getCmsValue } from '@/lib/cms';
import { fetchAvailableSlots, lockSlot, releaseSlotLock, createBooking, type AppointmentType, TYPE_LABELS, DURATION_MAP } from '@/lib/booking';
import type { AppointmentSlot } from '@/lib/supabase';

type Props = {
  cms: CmsContentMap;
  onNavigate: (page: string) => void;
};

type Step = 'type' | 'date' | 'time' | 'details' | 'confirm' | 'success';

export default function Booking({ cms, onNavigate }: Props) {
  const [step, setStep] = useState<Step>('type');
  const [appointmentType, setAppointmentType] = useState<AppointmentType | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [slots, setSlots] = useState<AppointmentSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AppointmentSlot | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [locking, setLocking] = useState(false);
  const [booking, setBooking] = useState(false);
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [patientDetails, setPatientDetails] = useState({ name: '', email: '', phone: '' });

  const today = new Date();
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + 30);

  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  const nextThirtyDays = Array.from({ length: 31 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return d;
  }).filter((d) => d.getDay() !== 0);

  const loadSlots = useCallback(async () => {
    if (!selectedDate || !appointmentType) return;
    setLoadingSlots(true);
    setError(null);
    const available = await fetchAvailableSlots(selectedDate, appointmentType);
    setSlots(available);
    setLoadingSlots(false);
  }, [selectedDate, appointmentType]);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  useEffect(() => {
    return () => {
      if (selectedSlot) {
        releaseSlotLock(selectedSlot.id);
      }
    };
  }, [selectedSlot]);

  const handleSelectType = (type: AppointmentType) => {
    setAppointmentType(type);
    setStep('date');
  };

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    setStep('time');
  };

  const handleSelectSlot = async (slot: AppointmentSlot) => {
    setLocking(true);
    setError(null);
    if (selectedSlot && selectedSlot.id !== slot.id) {
      await releaseSlotLock(selectedSlot.id);
    }
    const locked = await lockSlot(slot.id);
    setLocking(false);
    if (locked) {
      setSelectedSlot(slot);
      setStep('details');
    } else {
      setError('This slot was just taken by another patient. Please select another time.');
      loadSlots();
    }
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientDetails.name || !patientDetails.email || !patientDetails.phone) return;
    setStep('confirm');
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot || !appointmentType || !selectedDate) return;
    setBooking(true);
    setError(null);
    const result = await createBooking({
      slot_id: selectedSlot.id,
      patient_name: patientDetails.name,
      patient_email: patientDetails.email,
      patient_phone: patientDetails.phone,
      appointment_type: appointmentType,
      appointment_date: selectedDate,
      appointment_time: selectedSlot.slot_start,
      is_new_patient: appointmentType === 'new_patient',
    });
    setBooking(false);
    if (result) {
      setConfirmedBookingId(result.id);
      setStep('success');
    } else {
      setError('Failed to create booking. The slot may have been taken. Please try again.');
      setStep('time');
      loadSlots();
    }
  };

  const stepNumber = { type: 1, date: 2, time: 3, details: 4, confirm: 5, success: 5 };
  const currentStep = stepNumber[step];

  return (
    <div className="pt-16 min-h-screen bg-gradient-to-b from-teal-50/30 to-white">
      <section className="section-padding">
        <div className="container-max max-w-3xl">
          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl font-semibold text-gray-900 sm:text-4xl">
              {getCmsValue(cms, 'booking', 'title', 'Book Your Appointment')}
            </h1>
            <p className="mt-2 text-gray-600">
              {getCmsValue(cms, 'booking', 'subtitle', 'Select a time that works for you. Confirm in seconds.')}
            </p>
          </div>

          {step !== 'success' && (
            <div className="mb-8">
              <div className="flex items-center justify-between">
                {['Type', 'Date', 'Time', 'Details', 'Confirm'].map((label, i) => (
                  <div key={label} className="flex items-center">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-all ${
                      i + 1 < currentStep ? 'bg-teal-700 text-white' :
                      i + 1 === currentStep ? 'bg-teal-600 text-white ring-4 ring-teal-100' :
                      'bg-gray-100 text-gray-400'
                    }`}>
                      {i + 1 < currentStep ? <CheckCircle className="h-4 w-4" /> : i + 1}
                    </div>
                    {i < 4 && <div className={`h-0.5 w-8 sm:w-16 ${i + 1 < currentStep ? 'bg-teal-700' : 'bg-gray-200'}`} />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-lg bg-red-50 border border-red-200 p-4 animate-fade-in">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Step 1: Type */}
          {step === 'type' && (
            <div className="space-y-4 animate-fade-in">
              <div
                className="card cursor-pointer hover:shadow-xl hover:border-teal-300 transition-all"
                onClick={() => handleSelectType('review')}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                    <Clock className="h-7 w-7" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-serif text-lg font-semibold text-gray-900">Review Consultation</h3>
                    <p className="text-sm text-gray-600">{getCmsValue(cms, 'booking', 'review_desc', '15-minute follow-up for existing patients')}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-teal-700">15</span>
                    <span className="text-sm text-gray-500"> min</span>
                  </div>
                </div>
              </div>

              <div
                className="card cursor-pointer hover:shadow-xl hover:border-teal-300 transition-all"
                onClick={() => handleSelectType('new_patient')}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                    <Stethoscope className="h-7 w-7" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-serif text-lg font-semibold text-gray-900">New Patient Consultation</h3>
                    <p className="text-sm text-gray-600">{getCmsValue(cms, 'booking', 'new_patient_desc', '60-minute comprehensive consultation for new patients')}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-amber-700">60</span>
                    <span className="text-sm text-gray-500"> min</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Date */}
          {step === 'date' && (
            <div className="animate-fade-in">
              <div className="card">
                <h3 className="font-serif text-lg font-semibold text-gray-900 mb-4">Select a Date</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-80 overflow-y-auto">
                  {nextThirtyDays.map((d) => {
                    const dateStr = formatDate(d);
                    const isSelected = selectedDate === dateStr;
                    return (
                      <button
                        key={dateStr}
                        onClick={() => handleSelectDate(dateStr)}
                        className={`rounded-xl border p-3 text-center transition-all ${
                          isSelected
                            ? 'border-teal-600 bg-teal-50 ring-2 ring-teal-200'
                            : 'border-gray-200 hover:border-teal-300 hover:bg-teal-50/50'
                        }`}
                      >
                        <p className="text-xs text-gray-500">{d.toLocaleDateString('en-US', { weekday: 'short' })}</p>
                        <p className="text-lg font-semibold text-gray-900">{d.getDate()}</p>
                        <p className="text-xs text-gray-500">{d.toLocaleDateString('en-US', { month: 'short' })}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
              <button onClick={() => setStep('type')} className="mt-4 btn-ghost">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
            </div>
          )}

          {/* Step 3: Time */}
          {step === 'time' && (
            <div className="animate-fade-in">
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif text-lg font-semibold text-gray-900">
                    Available Times for {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </h3>
                  <span className="text-sm text-gray-500">{TYPE_LABELS[appointmentType!]}</span>
                </div>

                {loadingSlots ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
                  </div>
                ) : slots.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No available slots for this date. Please try another day.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {slots.map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => handleSelectSlot(slot)}
                        disabled={locking}
                        className="rounded-xl border border-gray-200 p-3 text-center transition-all hover:border-teal-500 hover:bg-teal-50 disabled:opacity-50"
                      >
                        <Clock className="h-4 w-4 text-teal-600 mx-auto mb-1" />
                        <span className="text-sm font-medium text-gray-900">
                          {slot.slot_start.substring(0, 5)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                {locking && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-sm text-teal-600">
                    <Loader2 className="h-4 w-4 animate-spin" /> Reserving your slot...
                  </div>
                )}
              </div>
              <button onClick={() => setStep('date')} className="mt-4 btn-ghost">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
            </div>
          )}

          {/* Step 4: Details */}
          {step === 'details' && (
            <div className="animate-fade-in">
              <form onSubmit={handleDetailsSubmit} className="card space-y-5">
                <h3 className="font-serif text-lg font-semibold text-gray-900">Your Details</h3>

                <div className="rounded-lg bg-teal-50 border border-teal-100 p-3 text-sm text-teal-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Slot reserved: {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {selectedSlot?.slot_start.substring(0, 5)} ({DURATION_MAP[appointmentType!]} min)
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={patientDetails.name}
                      onChange={(e) => setPatientDetails({ ...patientDetails, name: e.target.value })}
                      className="input-field pl-10"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={patientDetails.email}
                      onChange={(e) => setPatientDetails({ ...patientDetails, email: e.target.value })}
                      className="input-field pl-10"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="tel"
                      required
                      value={patientDetails.phone}
                      onChange={(e) => setPatientDetails({ ...patientDetails, phone: e.target.value })}
                      className="input-field pl-10"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setStep('time')} className="btn-ghost">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                  <button type="submit" className="btn-primary flex-1">
                    Continue <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Step 5: Confirm */}
          {step === 'confirm' && (
            <div className="animate-fade-in">
              <div className="card">
                <h3 className="font-serif text-lg font-semibold text-gray-900 mb-4">Confirm Your Appointment</h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                    <span className="text-sm text-gray-500">Type</span>
                    <span className="text-sm font-medium text-gray-900">{TYPE_LABELS[appointmentType!]}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                    <span className="text-sm text-gray-500">Date</span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                    <span className="text-sm text-gray-500">Time</span>
                    <span className="text-sm font-medium text-gray-900">{selectedSlot?.slot_start.substring(0, 5)}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                    <span className="text-sm text-gray-500">Duration</span>
                    <span className="text-sm font-medium text-gray-900">{DURATION_MAP[appointmentType!]} minutes</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                    <span className="text-sm text-gray-500">Name</span>
                    <span className="text-sm font-medium text-gray-900">{patientDetails.name}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                    <span className="text-sm text-gray-500">Email</span>
                    <span className="text-sm font-medium text-gray-900">{patientDetails.email}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                    <span className="text-sm text-gray-500">Phone</span>
                    <span className="text-sm font-medium text-gray-900">{patientDetails.phone}</span>
                  </div>
                </div>

                <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                  <p>Please arrive 10 minutes before your appointment time.</p>
                </div>

                <div className="mt-6 flex gap-3">
                  <button onClick={() => setStep('details')} className="btn-ghost">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                  <button onClick={handleConfirmBooking} disabled={booking} className="btn-primary flex-1">
                    {booking ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Confirming...</>
                    ) : (
                      <><CheckCircle className="h-4 w-4" /> Confirm Booking</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Success */}
          {step === 'success' && (
            <div className="card text-center animate-fade-in-up py-12">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-teal-100 mb-6">
                <CheckCircle className="h-10 w-10 text-teal-600" />
              </div>
              <h2 className="font-serif text-2xl font-semibold text-gray-900">Booking Confirmed!</h2>
              <p className="mt-3 text-gray-600 max-w-md mx-auto">
                Your appointment has been confirmed. A confirmation email and SMS reminder will be sent to you.
              </p>

              <div className="mt-6 mx-auto max-w-sm rounded-xl bg-teal-50 border border-teal-100 p-4 text-left">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Booking ID</span>
                    <span className="font-mono text-gray-900">{confirmedBookingId?.substring(0, 8)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Type</span>
                    <span className="text-gray-900">{TYPE_LABELS[appointmentType!]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date</span>
                    <span className="text-gray-900">{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Time</span>
                    <span className="text-gray-900">{selectedSlot?.slot_start.substring(0, 5)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap justify-center gap-3">
                {appointmentType === 'new_patient' && (
                  <button onClick={() => onNavigate('intake')} className="btn-primary">
                    <Heart className="h-4 w-4" /> Complete Intake Form
                  </button>
                )}
                <button onClick={() => onNavigate('home')} className="btn-secondary">
                  Back to Home
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
