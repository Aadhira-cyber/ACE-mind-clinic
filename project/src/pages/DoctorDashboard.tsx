import { useState, useEffect, useCallback } from 'react';
import {
  Brain, Calendar, FileText, Layout, Bell, AlertTriangle, LogOut, Menu, X,
  Clock, Mail, Phone, User, Eye, EyeOff, Trash2, Plus, Save, CheckCircle,
  Loader2, AlertCircle, Stethoscope, Heart, Video, ChevronRight, RefreshCw, XCircle,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { supabase, type Booking, type IntakeForm, type Notification, type EmergencyCancellation, type CmsContent } from '@/lib/supabase';
import { fetchAllCmsContent, updateCmsItem, createCmsItem, deleteCmsItem } from '@/lib/cms';
import { triggerEmergencyCancellation, TYPE_LABELS } from '@/lib/booking';

type Tab = 'overview' | 'appointments' | 'intake' | 'cms' | 'notifications' | 'emergency';

type Props = {
  onSignOut: () => void;
};

export default function DoctorDashboard({ onSignOut }: Props) {
  const auth = useAuth();
  const [tab, setTab] = useState<Tab>('overview');
  const [mobileNav, setMobileNav] = useState(false);

  const navItems: { key: Tab; label: string; icon: typeof Calendar }[] = [
    { key: 'overview', label: 'Overview', icon: Layout },
    { key: 'appointments', label: 'Appointments', icon: Calendar },
    { key: 'intake', label: 'Intake Forms', icon: FileText },
    { key: 'cms', label: 'CMS Editor', icon: Stethoscope },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'emergency', label: 'Emergency Cancel', icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 text-gray-300 transform transition-transform duration-300 lg:translate-x-0 ${mobileNav ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center justify-between px-6 border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-700">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="font-serif text-sm font-semibold text-white">Acemind Clinic</span>
          </div>
          <button className="lg:hidden" onClick={() => setMobileNav(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => { setTab(item.key); setMobileNav(false); }}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                tab === item.key ? 'bg-teal-700 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <button
            onClick={onSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {mobileNav && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setMobileNav(false)} />}

      {/* Main */}
      <div className="flex-1 lg:ml-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button className="lg:hidden" onClick={() => setMobileNav(true)}>
              <Menu className="h-6 w-6 text-gray-700" />
            </button>
            <h1 className="font-serif text-lg font-semibold text-gray-900">
              {navItems.find((n) => n.key === tab)?.label}
            </h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Dr. Saravanan</span>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          {tab === 'overview' && <OverviewTab onNavigate={setTab} />}
          {tab === 'appointments' && <AppointmentsTab />}
          {tab === 'intake' && <IntakeTab />}
          {tab === 'cms' && <CmsTab />}
          {tab === 'notifications' && <NotificationsTab />}
          {tab === 'emergency' && <EmergencyTab doctorId={auth.user?.id ?? ''} />}
        </main>
      </div>
    </div>
  );
}

// ============================================================
// OVERVIEW TAB
// ============================================================
function OverviewTab({ onNavigate }: { onNavigate: (tab: Tab) => void }) {
  const [stats, setStats] = useState({ today: 0, upcoming: 0, intake: 0, pending: 0 });
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const today = new Date().toISOString().split('T')[0];
      const { count: todayCount } = await supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('appointment_date', today).eq('status', 'confirmed');
      const { count: upcomingCount } = await supabase.from('bookings').select('*', { count: 'exact', head: true }).gte('appointment_date', today).eq('status', 'confirmed');
      const { count: intakeCount } = await supabase.from('intake_forms').select('*', { count: 'exact', head: true });
      const { count: pendingCount } = await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('status', 'pending');
      const { data: recent } = await supabase.from('bookings').select('*').order('created_at', { ascending: false }).limit(5);

      setStats({
        today: todayCount || 0,
        upcoming: upcomingCount || 0,
        intake: intakeCount || 0,
        pending: pendingCount || 0,
      });
      setRecentBookings((recent as Booking[]) || []);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-teal-600" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Today's Appointments", value: stats.today, icon: Calendar, color: 'teal' },
          { label: 'Upcoming Total', value: stats.upcoming, icon: Clock, color: 'blue' },
          { label: 'Intake Forms', value: stats.intake, icon: FileText, color: 'amber' },
          { label: 'Pending Notifications', value: stats.pending, icon: Bell, color: 'rose' },
        ].map((stat, i) => (
          <div key={i} className="card animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="mt-1 font-serif text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-${stat.color}-50 text-${stat.color}-600`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-lg font-semibold text-gray-900">Recent Bookings</h3>
          <button onClick={() => onNavigate('appointments')} className="text-sm text-teal-700 font-medium hover:underline flex items-center gap-1">
            View all <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
        {recentBookings.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">No bookings yet.</p>
        ) : (
          <div className="space-y-2">
            {recentBookings.map((b) => (
              <div key={b.id} className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{b.patient_name}</p>
                    <p className="text-xs text-gray-500">{TYPE_LABELS[b.appointment_type]} - {b.appointment_date} at {b.appointment_time.substring(0, 5)}</p>
                  </div>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  b.status === 'confirmed' ? 'bg-teal-50 text-teal-700' :
                  b.status === 'postponed' ? 'bg-amber-50 text-amber-700' :
                  b.status === 'cancelled' ? 'bg-red-50 text-red-700' :
                  'bg-gray-50 text-gray-600'
                }`}>
                  {b.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <button onClick={() => onNavigate('emergency')} className="card flex items-center gap-3 hover:border-red-300 hover:shadow-md transition-all text-left">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Emergency Cancellation</p>
            <p className="text-xs text-gray-500">Cancel all appointments for a date</p>
          </div>
        </button>
        <button onClick={() => onNavigate('cms')} className="card flex items-center gap-3 hover:border-teal-300 hover:shadow-md transition-all text-left">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
            <Layout className="h-6 w-6" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Edit Website Content</p>
            <p className="text-xs text-gray-500">Update text, FAQ, services</p>
          </div>
        </button>
      </div>
    </div>
  );
}

// ============================================================
// APPOINTMENTS TAB
// ============================================================
function AppointmentsTab() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'postponed' | 'completed' | 'cancelled'>('all');

  const loadBookings = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('bookings').select('*').order('appointment_date', { ascending: true }).order('appointment_time', { ascending: true });
    if (filter !== 'all') query = query.eq('status', filter);
    const { data } = await query;
    setBookings((data as Booking[]) || []);
    setLoading(false);
  }, [filter]);

  useEffect(() => { loadBookings(); }, [loadBookings]);

  const updateStatus = async (id: string, status: Booking['status']) => {
    await supabase.from('bookings').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    loadBookings();
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-teal-600" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(['all', 'confirmed', 'postponed', 'completed', 'cancelled'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
              filter === f ? 'bg-teal-700 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {bookings.length === 0 ? (
        <div className="card text-center py-12">
          <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No appointments found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div key={b.id} className="card animate-fade-in">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{b.patient_name}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {b.appointment_date}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {b.appointment_time.substring(0, 5)} ({b.duration_minutes}m)</span>
                      <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {b.patient_email}</span>
                      <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {b.patient_phone}</span>
                    </div>
                    <span className="mt-1 inline-block rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700">
                      {TYPE_LABELS[b.appointment_type]}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    b.status === 'confirmed' ? 'bg-teal-50 text-teal-700' :
                    b.status === 'postponed' ? 'bg-amber-50 text-amber-700' :
                    b.status === 'cancelled' ? 'bg-red-50 text-red-700' :
                    'bg-gray-50 text-gray-600'
                  }`}>
                    {b.status}
                  </span>
                </div>
              </div>
              {b.status === 'confirmed' && (
                <div className="mt-3 flex gap-2 border-t border-gray-100 pt-3">
                  <button onClick={() => updateStatus(b.id, 'completed')} className="text-xs font-medium text-teal-700 hover:underline">Mark Complete</button>
                  <span className="text-gray-200">|</span>
                  <button onClick={() => updateStatus(b.id, 'cancelled')} className="text-xs font-medium text-red-600 hover:underline">Cancel</button>
                  <span className="text-gray-200">|</span>
                  <button onClick={() => updateStatus(b.id, 'postponed')} className="text-xs font-medium text-amber-600 hover:underline">Postpone</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// INTAKE FORMS TAB
// ============================================================
function IntakeTab() {
  const [forms, setForms] = useState<IntakeForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<IntakeForm | null>(null);

  useEffect(() => {
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        setError('Authentication required to view intake forms.');
        setLoading(false);
        return;
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/intake-api`;
      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        setError('Unauthorized: your session is invalid or has expired. Please sign in again.');
        setLoading(false);
        return;
      }

      if (!response.ok) {
        setError('Failed to fetch intake forms.');
        setLoading(false);
        return;
      }

      const json = await response.json();
      setForms((json.data as IntakeForm[]) || []);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-teal-600" /></div>;
  }

  if (selected) {
    return <IntakeDetailView form={selected} onBack={() => setSelected(null)} />;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-teal-50 border border-teal-100 p-3 text-sm text-teal-800 flex items-center gap-2">
        <CheckCircle className="h-4 w-4" />
        Only you (the authenticated doctor) can view intake form data. All data is protected by row-level security and served through an authenticated API endpoint.
      </div>

      {forms.length === 0 ? (
        <div className="card text-center py-12">
          <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No intake forms submitted yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {forms.map((f) => (
            <button
              key={f.id}
              onClick={() => setSelected(f)}
              className="card w-full text-left hover:shadow-md hover:border-teal-300 transition-all animate-fade-in"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{f.patient_name}</p>
                    <p className="text-xs text-gray-500">{f.patient_email} - {f.patient_phone}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Submitted: {new Date(f.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
              <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                <span className="font-medium">Chief complaint:</span> {f.chief_complaint}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function IntakeDetailView({ form, onBack }: { form: IntakeForm; onBack: () => void }) {
  const medical = form.medical_history as Record<string, unknown>;
  const prescriptions = form.current_prescriptions as Array<{ name: string; dosage: string; frequency: string }>;
  const psych = form.psychological_baseline as Record<string, string>;

  return (
    <div className="space-y-4 animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-teal-700">
        <ArrowLeft className="h-4 w-4" /> Back to list
      </button>

      <div className="card">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
            <FileText className="h-7 w-7" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-semibold text-gray-900">{form.patient_name}</h3>
            <p className="text-sm text-gray-500">Submitted {new Date(form.created_at).toLocaleString()}</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 mb-6">
          <InfoRow label="Email" value={form.patient_email} />
          <InfoRow label="Phone" value={form.patient_phone} />
          <InfoRow label="Age" value={form.patient_age?.toString() || '-'} />
          <InfoRow label="Gender" value={form.patient_gender || '-'} />
          <InfoRow label="Emergency Contact" value={form.emergency_contact_name || '-'} />
          <InfoRow label="Emergency Phone" value={form.emergency_contact_phone || '-'} />
        </div>

        <div className="rounded-lg bg-gray-50 p-4 mb-6">
          <p className="text-sm font-medium text-gray-700 mb-1">Chief Complaint</p>
          <p className="text-sm text-gray-600">{form.chief_complaint}</p>
        </div>

        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Medical History</h4>
          <div className="grid gap-2 sm:grid-cols-3">
            {Object.entries(medical).filter(([k]) => k !== 'other').map(([key, val]) => (
              <div key={key} className={`rounded-lg border px-3 py-2 text-sm ${val ? 'bg-teal-50 border-teal-200 text-teal-800' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                {key}: {val ? 'Yes' : 'No'}
              </div>
            ))}
          </div>
          {medical.other && (
            <p className="mt-2 text-sm text-gray-600">Other: {medical.other as string}</p>
          )}
        </div>

        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Current Prescriptions</h4>
          {prescriptions && prescriptions.length > 0 ? (
            <div className="space-y-2">
              {prescriptions.map((p, i) => (
                <div key={i} className="rounded-lg border border-gray-200 px-3 py-2 text-sm">
                  <span className="font-medium text-gray-900">{p.name}</span>
                  <span className="text-gray-500"> - {p.dosage} - {p.frequency}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">None reported.</p>
          )}
        </div>

        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Psychological Baseline</h4>
          <div className="grid gap-3 sm:grid-cols-2">
            {Object.entries(psych).filter(([k]) => k !== 'familyHistory' && k !== 'previousTreatment').map(([key, val]) => (
              val && <InfoRow key={key} label={key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())} value={val} />
            ))}
          </div>
        </div>

        {(psych.familyHistory || psych.previousTreatment) && (
          <div className="space-y-3">
            {psych.familyHistory && (
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm font-medium text-gray-700 mb-1">Family History</p>
                <p className="text-sm text-gray-600">{psych.familyHistory}</p>
              </div>
            )}
            {psych.previousTreatment && (
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm font-medium text-gray-700 mb-1">Previous Treatment</p>
                <p className="text-sm text-gray-600">{psych.previousTreatment}</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex items-center gap-2 rounded-lg bg-teal-50 p-3 text-sm text-teal-800">
          <CheckCircle className="h-4 w-4" />
          Consent given: {form.consent_given ? 'Yes' : 'No'}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value}</p>
    </div>
  );
}

// ============================================================
// CMS EDITOR TAB
// ============================================================
function CmsTab() {
  const [items, setItems] = useState<CmsContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<CmsContent | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editVisible, setEditVisible] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSection, setNewSection] = useState('');
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const loadItems = useCallback(async () => {
    setLoading(true);
    const data = await fetchAllCmsContent();
    setItems(data);
    setLoading(false);
  }, []);

  useEffect(() => { loadItems(); }, [loadItems]);

  const handleEdit = (item: CmsContent) => {
    setEditing(item);
    setEditValue(item.value);
    setEditVisible(item.is_visible);
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    await updateCmsItem(editing.id, { value: editValue, is_visible: editVisible });
    setSaving(false);
    setEditing(null);
    loadItems();
  };

  const handleToggleVisible = async (item: CmsContent) => {
    await updateCmsItem(item.id, { is_visible: !item.is_visible });
    loadItems();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this content item? This cannot be undone.')) return;
    await deleteCmsItem(id);
    loadItems();
  };

  const handleAdd = async () => {
    if (!newSection || !newKey || !newValue) return;
    await createCmsItem({ section: newSection, key: newKey, value: newValue, is_visible: true, sort_order: 0 });
    setNewSection(''); setNewKey(''); setNewValue('');
    setShowAdd(false);
    loadItems();
  };

  const sections = [...new Set(items.map((i) => i.section))];

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-teal-600" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">Edit website content. Changes appear instantly on the public site.</p>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-ghost text-sm">
          <Plus className="h-4 w-4" /> Add Content
        </button>
      </div>

      {showAdd && (
        <div className="card space-y-3 animate-fade-in">
          <h4 className="font-medium text-gray-900">Add New Content</h4>
          <div className="grid gap-3 sm:grid-cols-3">
            <input type="text" placeholder="Section (e.g. home)" value={newSection} onChange={(e) => setNewSection(e.target.value)} className="input-field" />
            <input type="text" placeholder="Key (e.g. hero_title)" value={newKey} onChange={(e) => setNewKey(e.target.value)} className="input-field" />
            <input type="text" placeholder="Value (text content)" value={newValue} onChange={(e) => setNewValue(e.target.value)} className="input-field" />
          </div>
          <button onClick={handleAdd} className="btn-primary text-sm">Add Item</button>
        </div>
      )}

      {editing && (
        <div className="card space-y-4 animate-fade-in border-2 border-teal-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Editing: {editing.section} - {editing.key}</p>
            </div>
            <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          <textarea value={editValue} onChange={(e) => setEditValue(e.target.value)} rows={4} className="input-field" />
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={editVisible} onChange={(e) => setEditVisible(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-teal-600" />
            Visible on website
          </label>
          <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </button>
        </div>
      )}

      {sections.map((section) => (
        <div key={section} className="card">
          <h3 className="font-serif text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">{section}</h3>
          <div className="space-y-2">
            {items.filter((i) => i.section === section).map((item) => (
              <div key={item.id} className={`flex items-start justify-between gap-3 rounded-lg border px-3 py-2.5 ${item.is_visible ? 'border-gray-200 bg-white' : 'border-gray-200 bg-gray-50 opacity-60'}`}>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500">{item.key}</p>
                  <p className="text-sm text-gray-800 mt-0.5 line-clamp-2">{item.value || '(empty)'}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => handleToggleVisible(item)} className="p-1.5 rounded hover:bg-gray-100" title={item.is_visible ? 'Hide' : 'Show'}>
                    {item.is_visible ? <Eye className="h-4 w-4 text-teal-600" /> : <EyeOff className="h-4 w-4 text-gray-400" />}
                  </button>
                  <button onClick={() => handleEdit(item)} className="p-1.5 rounded hover:bg-gray-100" title="Edit">
                    <Save className="h-4 w-4 text-gray-600" />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded hover:bg-red-50" title="Delete">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// NOTIFICATIONS TAB
// ============================================================
function NotificationsTab() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(100);
    setNotifications((data as Notification[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const markSent = async (id: string) => {
    await supabase.from('notifications').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('id', id);
    load();
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-teal-600" /></div>;
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg bg-blue-50 border border-blue-100 p-3 text-sm text-blue-800 flex items-center gap-2">
        <Bell className="h-4 w-4" />
        Notification queue: SMS and email reminders are queued here when bookings are created or emergency cancellations are triggered.
      </div>

      {notifications.length === 0 ? (
        <div className="card text-center py-12">
          <Bell className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No notifications queued.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div key={n.id} className="card animate-fade-in">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    n.channel === 'sms' ? 'bg-blue-50 text-blue-600' : 'bg-teal-50 text-teal-600'
                  }`}>
                    {n.channel === 'sms' ? <Phone className="h-5 w-5" /> : <Mail className="h-5 w-5" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">{n.recipient}</span>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{n.recipient_type}</span>
                    </div>
                    {n.subject && <p className="text-xs font-medium text-gray-700 mt-0.5">{n.subject}</p>}
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">Scheduled: {new Date(n.scheduled_for).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    n.status === 'sent' ? 'bg-teal-50 text-teal-700' :
                    n.status === 'failed' ? 'bg-red-50 text-red-700' :
                    'bg-amber-50 text-amber-700'
                  }`}>
                    {n.status}
                  </span>
                  {n.status === 'pending' && (
                    <button onClick={() => markSent(n.id)} className="text-xs text-teal-700 font-medium hover:underline">Mark sent</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// EMERGENCY CANCELLATION TAB
// ============================================================
function EmergencyTab({ doctorId }: { doctorId: string }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ count: number; date: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<EmergencyCancellation[]>([]);

  const loadHistory = useCallback(async () => {
    const { data } = await supabase.from('emergency_cancellations').select('*').order('created_at', { ascending: false }).limit(10);
    setHistory((data as EmergencyCancellation[]) || []);
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  const handleTrigger = async () => {
    if (!reason.trim()) {
      setError('Please provide a reason for the emergency cancellation.');
      return;
    }
    if (!confirm(`This will cancel ALL confirmed appointments on ${date} and send cancellation alerts to affected patients. Continue?`)) return;

    setLoading(true);
    setError(null);
    const count = await triggerEmergencyCancellation(date, reason, doctorId);
    setLoading(false);

    if (count > 0) {
      setResult({ count, date });
      loadHistory();
    } else {
      setResult({ count: 0, date });
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-red-50 border border-red-200 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-900">Emergency Cancellation Protocol</p>
            <p className="text-sm text-red-700 mt-1">
              Triggering this will immediately cancel all confirmed appointments for the selected date,
              mark them as "Postponed/Priority Reschedule", send SMS and email cancellation alerts to all affected patients,
              and free up the appointment slots.
            </p>
          </div>
        </div>
      </div>

      <div className="card space-y-4">
        <h3 className="font-serif text-lg font-semibold text-gray-900">Trigger Emergency Cancellation</h3>

        {error && (
          <div className="flex items-start gap-3 rounded-lg bg-red-50 border border-red-200 p-3">
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {result && (
          <div className="flex items-start gap-3 rounded-lg bg-teal-50 border border-teal-200 p-3 animate-fade-in">
            <CheckCircle className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-teal-900">Emergency cancellation processed</p>
              <p className="text-sm text-teal-700 mt-0.5">
                {result.count > 0
                  ? `${result.count} appointment(s) on ${result.date} were postponed. Cancellation alerts have been dispatched.`
                  : `No confirmed appointments found on ${result.date}.`}
              </p>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Date to Cancel</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-field" min={new Date().toISOString().split('T')[0]} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Reason</label>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} className="input-field" placeholder="e.g. Medical emergency, unavoidable circumstance..." />
        </div>

        <button onClick={handleTrigger} disabled={loading} className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-red-700 hover:shadow-lg active:scale-95 disabled:opacity-50">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <AlertTriangle className="h-4 w-4" />}
          Trigger Emergency Cancellation
        </button>
      </div>

      <div className="card">
        <h3 className="font-serif text-lg font-semibold text-gray-900 mb-4">Cancellation History</h3>
        {history.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">No emergency cancellations recorded.</p>
        ) : (
          <div className="space-y-2">
            {history.map((h) => (
              <div key={h.id} className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{h.cancel_date}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{h.reason}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-amber-700">{h.affected_bookings_count} affected</span>
                  <p className="text-xs text-gray-400">{new Date(h.created_at).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
