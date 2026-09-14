import { MapPin, Clock, Phone, Mail, Calendar } from 'lucide-react';
import type { CmsContentMap } from '@/lib/cms';
import { getCmsValue } from '@/lib/cms';

type Props = {
  cms: CmsContentMap;
  onNavigate: (page: string) => void;
};

export default function Contact({ cms, onNavigate }: Props) {
  return (
    <div className="pt-16">
      <section className="section-padding bg-gradient-to-b from-teal-50/50 to-white">
        <div className="container-max">
          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl font-semibold text-gray-900 sm:text-5xl">
              {getCmsValue(cms, 'contact', 'title', 'Get in Touch')}
            </h1>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              {getCmsValue(cms, 'contact', 'subtitle', 'We are here to help. Reach out to schedule your visit.')}
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="card text-center animate-fade-in-up">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                <MapPin className="h-7 w-7" />
              </div>
              <h3 className="mt-4 font-serif text-lg font-semibold text-gray-900">Visit Us</h3>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                {getCmsValue(cms, 'contact', 'address', '23, Vivekanandha Nagar, Potheri, Kattankulathur')}
              </p>
            </div>

            <div className="card text-center animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                <Clock className="h-7 w-7" />
              </div>
              <h3 className="mt-4 font-serif text-lg font-semibold text-gray-900">Operating Hours</h3>
              <p className="mt-2 text-sm text-gray-600">{getCmsValue(cms, 'contact', 'hours', '6:00 PM to 9:00 PM, Mon-Sat')}</p>
              <p className="mt-1 text-sm text-gray-400">{getCmsValue(cms, 'contact', 'closed_note', 'Sundays: Closed')}</p>
            </div>

            <div className="card text-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                <Phone className="h-7 w-7" />
              </div>
              <h3 className="mt-4 font-serif text-lg font-semibold text-gray-900">Call / Email</h3>
              <p className="mt-2 text-sm text-gray-600">{getCmsValue(cms, 'contact', 'phone', '+91 98765 43210')}</p>
              <p className="mt-1 text-sm text-gray-600">{getCmsValue(cms, 'contact', 'email', 'care@acemindclinic.com')}</p>
            </div>
          </div>

          <div className="mt-12 rounded-2xl overflow-hidden shadow-lg">
            <iframe
              src="https://maps.google.com/maps?q=Kattankulathur&t=&z=13&ie=UTF8&iwloc=&output=embed"
              className="w-full h-80 border-0"
              loading="lazy"
              title="Clinic Location Map"
            />
          </div>

          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-100 px-4 py-1.5 text-sm font-medium text-teal-800 mb-4">
              <Calendar className="h-4 w-4" />
              Prefer to book online?
            </div>
            <div>
              <button onClick={() => onNavigate('booking')} className="btn-primary">
                <Calendar className="h-4 w-4" />
                Book an Appointment
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
