import { useState } from 'react';
import { User, Mail, Phone, Heart, AlertCircle, CheckCircle, ArrowLeft, ArrowRight, Loader2, FileText, Pill, Brain, Shield } from 'lucide-react';
import type { CmsContentMap } from '@/lib/cms';
import { getCmsValue } from '@/lib/cms';
import { supabase } from '@/lib/supabase';

type Props = {
  cms: CmsContentMap;
  onNavigate: (page: string) => void;
};

type Step = 'personal' | 'medical' | 'psychological' | 'consent' | 'success';

export default function IntakeForm({ cms, onNavigate }: Props) {
  const [step, setStep] = useState<Step>('personal');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [personal, setPersonal] = useState({
    name: '', email: '', phone: '', age: '', gender: '',
    emergencyName: '', emergencyPhone: '',
  });
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [medicalHistory, setMedicalHistory] = useState({
    diabetes: false, hypertension: false, thyroid: false, heart: false, asthma: false, seizures: false, other: '',
  });
  const [prescriptions, setPrescriptions] = useState([{ name: '', dosage: '', frequency: '' }]);
  const [psychological, setPsychological] = useState({
    sleepPattern: '', appetite: '', mood: '', energy: '', anxietyLevel: '', substanceUse: '',
    familyHistory: '', previousTreatment: '',
  });
  const [consent, setConsent] = useState(false);

  const stepOrder: Step[] = ['personal', 'medical', 'psychological', 'consent', 'success'];
  const currentStepIndex = stepOrder.indexOf(step);

  const addPrescription = () => {
    setPrescriptions([...prescriptions, { name: '', dosage: '', frequency: '' }]);
  };

  const removePrescription = (index: number) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    const { error: insertError } = await supabase.from('intake_forms').insert({
      patient_name: personal.name,
      patient_email: personal.email,
      patient_phone: personal.phone,
      patient_age: parseInt(personal.age) || null,
      patient_gender: personal.gender || null,
      emergency_contact_name: personal.emergencyName || null,
      emergency_contact_phone: personal.emergencyPhone || null,
      chief_complaint: chiefComplaint,
      medical_history: medicalHistory,
      current_prescriptions: prescriptions.filter((p) => p.name),
      psychological_baseline: psychological,
      family_history: psychological.familyHistory || null,
      previous_treatment: psychological.previousTreatment || null,
      consent_given: consent,
    });

    setSubmitting(false);

    if (insertError) {
      setError('Failed to submit intake form. Please try again.');
      return;
    }

    setStep('success');
  };

  const isPersonalValid = personal.name && personal.email && personal.phone && chiefComplaint;

  return (
    <div className="pt-16 min-h-screen bg-gradient-to-b from-teal-50/30 to-white">
      <section className="section-padding">
        <div className="container-max max-w-3xl">
          <div className="text-center mb-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 mb-4">
              <FileText className="h-7 w-7" />
            </div>
            <h1 className="font-serif text-3xl font-semibold text-gray-900 sm:text-4xl">
              {getCmsValue(cms, 'intake', 'title', 'Patient Intake Form')}
            </h1>
            <p className="mt-2 text-gray-600 max-w-xl mx-auto">
              {getCmsValue(cms, 'intake', 'subtitle', 'Please complete this form before your first appointment. All information is kept strictly confidential.')}
            </p>
          </div>

          {step !== 'success' && (
            <div className="mb-8">
              <div className="flex items-center justify-between">
                {['Personal', 'Medical', 'Psychological', 'Consent'].map((label, i) => (
                  <div key={label} className="flex items-center">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-all ${
                      i < currentStepIndex ? 'bg-teal-700 text-white' :
                      i === currentStepIndex ? 'bg-teal-600 text-white ring-4 ring-teal-100' :
                      'bg-gray-100 text-gray-400'
                    }`}>
                      {i < currentStepIndex ? <CheckCircle className="h-4 w-4" /> : i + 1}
                    </div>
                    {i < 3 && <div className={`h-0.5 w-8 sm:w-16 ${i < currentStepIndex ? 'bg-teal-700' : 'bg-gray-200'}`} />}
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

          {/* Step 1: Personal */}
          {step === 'personal' && (
            <div className="card space-y-5 animate-fade-in">
              <h3 className="font-serif text-lg font-semibold text-gray-900">Personal Information</h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input type="text" required value={personal.name} onChange={(e) => setPersonal({ ...personal, name: e.target.value })} className="input-field pl-10" placeholder="Your full name" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Age</label>
                  <input type="number" value={personal.age} onChange={(e) => setPersonal({ ...personal, age: e.target.value })} className="input-field" placeholder="Age" min="1" max="120" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input type="email" required value={personal.email} onChange={(e) => setPersonal({ ...personal, email: e.target.value })} className="input-field pl-10" placeholder="you@example.com" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input type="tel" required value={personal.phone} onChange={(e) => setPersonal({ ...personal, phone: e.target.value })} className="input-field pl-10" placeholder="+91 98765 43210" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Gender</label>
                  <select value={personal.gender} onChange={(e) => setPersonal({ ...personal, gender: e.target.value })} className="input-field">
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Chief Complaint / Primary Reason for Visit *</label>
                <textarea required value={chiefComplaint} onChange={(e) => setChiefComplaint(e.target.value)} rows={3} className="input-field" placeholder="Describe the main reason you are seeking consultation..." />
              </div>

              <div className="pt-2 border-t border-gray-100">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Emergency Contact</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact Name</label>
                    <input type="text" value={personal.emergencyName} onChange={(e) => setPersonal({ ...personal, emergencyName: e.target.value })} className="input-field" placeholder="Emergency contact name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact Phone</label>
                    <input type="tel" value={personal.emergencyPhone} onChange={(e) => setPersonal({ ...personal, emergencyPhone: e.target.value })} className="input-field" placeholder="Emergency contact phone" />
                  </div>
                </div>
              </div>

              <button onClick={() => setStep('medical')} disabled={!isPersonalValid} className="btn-primary w-full">
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Step 2: Medical History */}
          {step === 'medical' && (
            <div className="card space-y-5 animate-fade-in">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-teal-600" />
                <h3 className="font-serif text-lg font-semibold text-gray-900">Medical History</h3>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-3">Please check any conditions that apply to you:</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {[
                    { key: 'diabetes', label: 'Diabetes' },
                    { key: 'hypertension', label: 'Hypertension' },
                    { key: 'thyroid', label: 'Thyroid Disorder' },
                    { key: 'heart', label: 'Heart Condition' },
                    { key: 'asthma', label: 'Asthma' },
                    { key: 'seizures', label: 'Seizures/Epilepsy' },
                  ].map((item) => (
                    <label key={item.key} className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2.5 cursor-pointer hover:bg-teal-50/50 transition-colors">
                      <input
                        type="checkbox"
                        checked={medicalHistory[item.key as keyof typeof medicalHistory] as boolean}
                        onChange={(e) => setMedicalHistory({ ...medicalHistory, [item.key]: e.target.checked })}
                        className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                      />
                      <span className="text-sm text-gray-700">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Other Medical Conditions</label>
                <textarea value={medicalHistory.other} onChange={(e) => setMedicalHistory({ ...medicalHistory, other: e.target.value })} rows={2} className="input-field" placeholder="Any other medical conditions not listed above..." />
              </div>

              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Pill className="h-5 w-5 text-teal-600" />
                    <h4 className="text-sm font-semibold text-gray-700">Current Prescriptions</h4>
                  </div>
                  <button onClick={addPrescription} className="text-sm text-teal-700 font-medium hover:underline">+ Add medication</button>
                </div>
                <div className="space-y-3">
                  {prescriptions.map((med, i) => (
                    <div key={i} className="grid gap-2 sm:grid-cols-4 items-start">
                      <input type="text" value={med.name} onChange={(e) => { const p = [...prescriptions]; p[i] = { ...p[i], name: e.target.value }; setPrescriptions(p); }} className="input-field" placeholder="Medication name" />
                      <input type="text" value={med.dosage} onChange={(e) => { const p = [...prescriptions]; p[i] = { ...p[i], dosage: e.target.value }; setPrescriptions(p); }} className="input-field" placeholder="Dosage" />
                      <input type="text" value={med.frequency} onChange={(e) => { const p = [...prescriptions]; p[i] = { ...p[i], frequency: e.target.value }; setPrescriptions(p); }} className="input-field" placeholder="Frequency" />
                      {prescriptions.length > 1 && (
                        <button onClick={() => removePrescription(i)} className="text-red-500 text-sm hover:underline">Remove</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep('personal')} className="btn-ghost">
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button onClick={() => setStep('psychological')} className="btn-primary flex-1">
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Psychological Baseline */}
          {step === 'psychological' && (
            <div className="card space-y-5 animate-fade-in">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-teal-600" />
                <h3 className="font-serif text-lg font-semibold text-gray-900">Psychological Baseline</h3>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Sleep Pattern</label>
                  <select value={psychological.sleepPattern} onChange={(e) => setPsychological({ ...psychological, sleepPattern: e.target.value })} className="input-field">
                    <option value="">Select</option>
                    <option value="good">Good (7-8 hours)</option>
                    <option value="fair">Fair (5-6 hours)</option>
                    <option value="poor">Poor (less than 5 hours)</option>
                    <option value="insomnia">Insomnia</option>
                    <option value="excessive">Excessive sleeping</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Appetite</label>
                  <select value={psychological.appetite} onChange={(e) => setPsychological({ ...psychological, appetite: e.target.value })} className="input-field">
                    <option value="">Select</option>
                    <option value="normal">Normal</option>
                    <option value="increased">Increased</option>
                    <option value="decreased">Decreased</option>
                    <option value="fluctuating">Fluctuating</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Mood</label>
                  <select value={psychological.mood} onChange={(e) => setPsychological({ ...psychological, mood: e.target.value })} className="input-field">
                    <option value="">Select</option>
                    <option value="stable">Stable</option>
                    <option value="depressed">Depressed</option>
                    <option value="anxious">Anxious</option>
                    <option value="irritable">Irritable</option>
                    <option value="fluctuating">Fluctuating</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Energy Level</label>
                  <select value={psychological.energy} onChange={(e) => setPsychological({ ...psychological, energy: e.target.value })} className="input-field">
                    <option value="">Select</option>
                    <option value="high">High</option>
                    <option value="normal">Normal</option>
                    <option value="low">Low</option>
                    <option value="very_low">Very Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Anxiety Level</label>
                  <select value={psychological.anxietyLevel} onChange={(e) => setPsychological({ ...psychological, anxietyLevel: e.target.value })} className="input-field">
                    <option value="">Select</option>
                    <option value="none">None</option>
                    <option value="mild">Mild</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Substance Use</label>
                  <select value={psychological.substanceUse} onChange={(e) => setPsychological({ ...psychological, substanceUse: e.target.value })} className="input-field">
                    <option value="">Select</option>
                    <option value="none">None</option>
                    <option value="alcohol">Alcohol</option>
                    <option value="tobacco">Tobacco</option>
                    <option value="recreational">Recreational drugs</option>
                    <option value="prescription">Prescription misuse</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Family History of Mental Illness</label>
                <textarea value={psychological.familyHistory} onChange={(e) => setPsychological({ ...psychological, familyHistory: e.target.value })} rows={2} className="input-field" placeholder="Any family history of mental health conditions..." />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Previous Treatment / Therapy</label>
                <textarea value={psychological.previousTreatment} onChange={(e) => setPsychological({ ...psychological, previousTreatment: e.target.value })} rows={2} className="input-field" placeholder="Any previous psychiatric treatment or therapy..." />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep('medical')} className="btn-ghost">
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button onClick={() => setStep('consent')} className="btn-primary flex-1">
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Consent */}
          {step === 'consent' && (
            <div className="card space-y-5 animate-fade-in">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-teal-600" />
                <h3 className="font-serif text-lg font-semibold text-gray-900">Consent & Confirmation</h3>
              </div>

              <div className="rounded-lg bg-teal-50 border border-teal-100 p-4 text-sm text-teal-800 leading-relaxed">
                <p className="font-medium mb-2">Privacy & Confidentiality</p>
                <p>I understand that all information provided in this intake form will be kept strictly confidential and will only be accessible to the treating physician, Prof. Dr. R. Arul Saravanan. The information will be used solely for the purpose of providing psychiatric care and treatment.</p>
              </div>

              <div className="rounded-lg bg-gray-50 border border-gray-200 p-4 text-sm text-gray-700 leading-relaxed">
                <p className="font-medium mb-2">Treatment Acknowledgment</p>
                <p>I acknowledge that the information I have provided is accurate to the best of my knowledge. I understand that this information will be used to guide my treatment plan. I consent to receive appointment reminders via SMS and email.</p>
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 h-5 w-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-sm text-gray-700">
                  I have read and understood the above. I give my consent for the collection and use of my information as described.
                </span>
              </label>

              <div className="flex gap-3">
                <button onClick={() => setStep('psychological')} className="btn-ghost">
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button onClick={handleSubmit} disabled={!consent || submitting} className="btn-primary flex-1">
                  {submitting ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</>
                  ) : (
                    <><CheckCircle className="h-4 w-4" /> Submit Intake Form</>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Success */}
          {step === 'success' && (
            <div className="card text-center animate-fade-in-up py-12">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-teal-100 mb-6">
                <CheckCircle className="h-10 w-10 text-teal-600" />
              </div>
              <h2 className="font-serif text-2xl font-semibold text-gray-900">Intake Form Submitted</h2>
              <p className="mt-3 text-gray-600 max-w-md mx-auto">
                Thank you for completing the intake form. Your information has been securely recorded and will be reviewed by Dr. Saravanan before your appointment.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <button onClick={() => onNavigate('home')} className="btn-primary">
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
