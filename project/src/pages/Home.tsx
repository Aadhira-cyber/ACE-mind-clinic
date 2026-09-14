import { Brain, Heart, Stethoscope, Video, Calendar, Shield, Clock, MapPin, ArrowRight, CheckCircle, Star, Phone, User } from 'lucide-react';
import type { CmsContentMap } from '@/lib/cms';
import { getCmsValue } from '@/lib/cms';

type Props = {
  cms: CmsContentMap;
  onNavigate: (page: string) => void;
};

const iconMap: Record<string, typeof Heart> = {
  heart: Heart,
  stethoscope: Stethoscope,
  video: Video,
};

export default function Home({ cms, onNavigate }: Props) {
  const services = [
    { num: 1, title: getCmsValue(cms, 'services', 'service_1_title', 'Counselling Services'), desc: getCmsValue(cms, 'services', 'service_1_desc', ''), icon: 'heart' },
    { num: 2, title: getCmsValue(cms, 'services', 'service_2_title', 'Outpatient Services'), desc: getCmsValue(cms, 'services', 'service_2_desc', ''), icon: 'stethoscope' },
    { num: 3, title: getCmsValue(cms, 'services', 'service_3_title', 'Online Counselling'), desc: getCmsValue(cms, 'services', 'service_3_desc', ''), icon: 'video' },
  ];

  const achievements = [1, 2, 3, 4].map((n) => getCmsValue(cms, 'about', `achievement_${n}`, '')).filter(Boolean);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-teal-50 via-white to-amber-50/30">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-teal-200/30 blur-3xl" />
          <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-amber-200/20 blur-3xl" />
        </div>

        <div className="container-max relative z-10 px-4 py-32 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center gap-2 rounded-full bg-teal-100 px-4 py-1.5 text-sm font-medium text-teal-800 mb-6">
                <span className="flex h-2 w-2 rounded-full bg-teal-500 animate-pulse-soft" />
                {getCmsValue(cms, 'home', 'hero_badge', 'Accepting new patients')}
              </div>
              <h1 className="font-serif text-4xl font-semibold leading-tight text-gray-900 sm:text-5xl lg:text-6xl">
                {getCmsValue(cms, 'home', 'hero_title', 'Your Mind Deserves Expert Care')}
              </h1>
              <p className="mt-6 text-lg text-gray-600 leading-relaxed max-w-lg">
                {getCmsValue(cms, 'home', 'hero_subtitle', 'Compassionate psychiatric and counselling services for individuals, couples, and families')}
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <button onClick={() => onNavigate('booking')} className="btn-primary">
                  <Calendar className="h-4 w-4" />
                  {getCmsValue(cms, 'home', 'hero_cta_primary', 'Book an Appointment')}
                </button>
                <button onClick={() => onNavigate('services')} className="btn-secondary">
                  {getCmsValue(cms, 'home', 'hero_cta_secondary', 'Explore Services')}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="relative hidden lg:block animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="relative rounded-3xl bg-gradient-to-br from-teal-600 to-teal-800 p-8 shadow-2xl">
                <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-amber-400/80 blur-2xl" />
                <div className="relative space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
                      <Brain className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-lg">Prof. Dr. R. Arul Saravanan</p>
                      <p className="text-teal-100 text-sm">MD, DPM - Consultant Psychiatrist</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { icon: Clock, label: 'Hours', value: '6:00 PM - 9:00 PM' },
                      { icon: Calendar, label: 'Days', value: 'Monday - Saturday' },
                      { icon: MapPin, label: 'Location', value: 'Potheri, Kattankulathur' },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3">
                        <item.icon className="h-5 w-5 text-teal-100" />
                        <div>
                          <p className="text-xs text-teal-200">{item.label}</p>
                          <p className="text-sm text-white font-medium">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="section-padding bg-white">
        <div className="container-max">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-semibold text-gray-900 sm:text-4xl">
              {getCmsValue(cms, 'services', 'title', 'Our Services')}
            </h2>
            <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
              {getCmsValue(cms, 'services', 'subtitle', 'Comprehensive mental health care tailored to your needs')}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {services.map((service, i) => {
              const Icon = iconMap[service.icon] || Heart;
              return (
                <div
                  key={service.num}
                  className="card group hover:shadow-xl hover:-translate-y-1 animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 group-hover:bg-teal-700 group-hover:text-white transition-colors">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="mt-5 font-serif text-xl font-semibold text-gray-900">{service.title}</h3>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">{service.desc}</p>
                  <button
                    onClick={() => onNavigate('services')}
                    className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-teal-700 hover:gap-2 transition-all"
                  >
                    Learn more <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section className="section-padding bg-gradient-to-b from-teal-50/50 to-white">
        <div className="container-max">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="animate-fade-in-up">
              <div className="relative">
                <div className="rounded-3xl bg-gradient-to-br from-teal-700 to-teal-900 p-8 shadow-xl">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10">
                      <User className="h-10 w-10 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-serif text-xl font-semibold">{getCmsValue(cms, 'about', 'name', 'Prof. Dr. R. Arul Saravanan')}</p>
                      <p className="text-teal-100 text-sm">{getCmsValue(cms, 'about', 'credentials', 'MD, DPM')}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {achievements.map((achievement, i) => (
                      <div key={i} className="flex items-start gap-2 text-teal-50 text-sm">
                        <Star className="h-4 w-4 mt-0.5 text-amber-300 flex-shrink-0" />
                        <span>{achievement}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
              <h2 className="font-serif text-3xl font-semibold text-gray-900 sm:text-4xl">
                {getCmsValue(cms, 'about', 'title', 'About the Practitioner')}
              </h2>
              <p className="mt-4 text-gray-600 leading-relaxed">
                {getCmsValue(cms, 'about', 'bio', '')}
              </p>
              <div className="mt-6 rounded-2xl bg-teal-50 p-5 border border-teal-100">
                <h3 className="font-serif text-lg font-semibold text-teal-900">
                  {getCmsValue(cms, 'about', 'philosophy_title', 'Our Philosophy')}
                </h3>
                <p className="mt-2 text-sm text-teal-800 leading-relaxed">
                  {getCmsValue(cms, 'about', 'philosophy_text', '')}
                </p>
              </div>
              <button onClick={() => onNavigate('about')} className="mt-6 btn-secondary">
                Read More <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section-padding bg-white">
        <div className="container-max">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-semibold text-gray-900 sm:text-4xl">Why Choose Acemind Clinic</h2>
            <p className="mt-3 text-gray-600">A calm, confidential, and professional environment for your mental wellness journey</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Shield, title: 'Strictly Confidential', desc: 'Your privacy is our highest priority. All records are secure and accessible only to the treating physician.' },
              { icon: Clock, title: 'Flexible Scheduling', desc: 'Online booking with real-time availability. Choose from 15-minute reviews or 1-hour consultations.' },
              { icon: Heart, title: 'Compassionate Care', desc: 'Every patient receives personalized attention in a judgment-free, empathetic environment.' },
              { icon: CheckCircle, title: 'Evidence-Based', desc: 'Treatment plans grounded in decades of clinical experience and the latest psychiatric research.' },
            ].map((item, i) => (
              <div key={i} className="text-center animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                  <item.icon className="h-7 w-7" />
                </div>
                <h3 className="mt-4 font-serif text-lg font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-teal-800">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 h-64 w-64 rounded-full bg-teal-600/50 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-amber-500/20 blur-3xl" />
        </div>
        <div className="container-max relative z-10 px-4 py-20 text-center sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl font-semibold text-white sm:text-4xl">
            Ready to Take the First Step?
          </h2>
          <p className="mt-4 text-teal-100 max-w-2xl mx-auto">
            Booking is simple and takes less than a minute. Choose a time that works for you and our team will take care of the rest.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <button onClick={() => onNavigate('booking')} className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-medium text-teal-800 transition-all hover:bg-teal-50 hover:shadow-lg active:scale-95">
              <Calendar className="h-4 w-4" />
              Book an Appointment
            </button>
            <button onClick={() => onNavigate('contact')} className="inline-flex items-center gap-2 rounded-lg border border-teal-300 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-teal-700 active:scale-95">
              <Phone className="h-4 w-4" />
              Contact Us
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
