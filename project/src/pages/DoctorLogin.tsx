import { useState } from 'react';
import { Brain, Lock, Mail, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/auth';

type Props = {
  onNavigate: (page: string) => void;
  onAuthSuccess: () => void;
};

export default function DoctorLogin({ onNavigate, onAuthSuccess }: Props) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      setError(error);
    } else {
      onAuthSuccess();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-amber-50/30 px-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-teal-200/20 blur-3xl" />
        <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-amber-200/15 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-700 shadow-lg mb-4">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <h1 className="font-serif text-2xl font-semibold text-gray-900">Doctor's Portal</h1>
          <p className="mt-2 text-sm text-gray-600">Sign in to access the administrative dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-5">
          {error && (
            <div className="flex items-start gap-3 rounded-lg bg-red-50 border border-red-200 p-3 animate-fade-in">
              <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field pl-10"
                placeholder="doctor@acemindclinic.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-10"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</>
            ) : (
              <>Sign In</>
            )}
          </button>
        </form>

        <button onClick={() => onNavigate('home')} className="mt-6 flex items-center gap-1.5 text-sm text-gray-500 hover:text-teal-700 transition-colors mx-auto">
          <ArrowLeft className="h-4 w-4" /> Back to website
        </button>
      </div>
    </div>
  );
}
