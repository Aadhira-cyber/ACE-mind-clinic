import { Star, Award, BookOpen, Users, Heart, ArrowRight } from 'lucide-react';
import type { CmsContentMap } from '@/lib/cms';
import { getCmsValue } from '@/lib/cms';

type Props = {
  cms: CmsContentMap;
  onNavigate: (page: string) => void;
};

export default function About({ cms, onNavigate }: Props) {
  const achievements = [1, 2, 3, 4].map((n) => getCmsValue(cms, 'about', `achievement_${n}`, '')).filter(Boolean);

  return (
    <div className="pt-16">
      <section className="section-padding bg-gradient-to-b from-teal-50/50 to-white">
        <div className="container-max">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="animate-fade-in-up">
              <div className="relative rounded-3xl bg-gradient-to-br from-teal-700 to-teal-900 p-8 shadow-xl">
                <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-amber-400/80 blur-2xl" />
                <div className="relative">
                  <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white/10">
                    <Heart className="h-12 w-12 text-white" />
                  </div>
                  <h2 className="mt-6 font-serif text-2xl font-semibold text-white">
                    {getCmsValue(cms, 'about', 'name', 'Prof. Dr. R. Arul Saravanan')}
                  </h2>
                  <p className="mt-1 text-teal-100">{getCmsValue(cms, 'about', 'credentials', 'MD, DPM')}</p>
                  <div className="mt-6 space-y-2">
                    {achievements.map((a, i) => (
                      <div key={i} className="flex items-start gap-2 text-teal-50 text-sm">
                        <Star className="h-4 w-4 mt-0.5 text-amber-300 flex-shrink-0" />
                        <span>{a}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
              <h1 className="font-serif text-4xl font-semibold text-gray-900 sm:text-5xl">
                {getCmsValue(cms, 'about', 'title', 'About the Practitioner')}
              </h1>
              <p className="mt-6 text-gray-600 leading-relaxed text-lg">
                {getCmsValue(cms, 'about', 'bio', '')}
              </p>
              <div className="mt-8 rounded-2xl bg-teal-50 p-6 border border-teal-100">
                <h3 className="font-serif text-xl font-semibold text-teal-900">
                  {getCmsValue(cms, 'about', 'philosophy_title', 'Our Philosophy')}
                </h3>
                <p className="mt-3 text-teal-800 leading-relaxed">
                  {getCmsValue(cms, 'about', 'philosophy_text', '')}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Award, value: '30+', label: 'Years of Experience' },
              { icon: Users, value: '5000+', label: 'Patients Treated' },
              { icon: BookOpen, value: '50+', label: 'Research Publications' },
              { icon: Heart, value: '100%', label: 'Patient-Centered Care' },
            ].map((stat, i) => (
              <div key={i} className="card text-center animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                  <stat.icon className="h-7 w-7" />
                </div>
                <p className="mt-4 font-serif text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="mt-1 text-sm text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-teal-800">
        <div className="container-max text-center">
          <h2 className="font-serif text-3xl font-semibold text-white sm:text-4xl">
            Schedule Your Consultation Today
          </h2>
          <p className="mt-4 text-teal-100 max-w-2xl mx-auto">
            Take the first step towards better mental health. Book an appointment at a time that works for you.
          </p>
          <button onClick={() => onNavigate('booking')} className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-medium text-teal-800 transition-all hover:bg-teal-50 hover:shadow-lg active:scale-95">
            Book an Appointment <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </div>
  );
}
