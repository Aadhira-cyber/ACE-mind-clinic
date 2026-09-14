import { Brain, MapPin, Clock, Phone, Mail } from 'lucide-react';
import type { CmsContentMap } from '@/lib/cms';
import { getCmsValue } from '@/lib/cms';

type Props = {
  cms: CmsContentMap;
  onNavigate: (page: string) => void;
};

export default function Footer({ cms, onNavigate }: Props) {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container-max px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-700">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <span className="font-serif text-lg font-semibold text-white">Acemind Clinic</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              {getCmsValue(cms, 'footer', 'tagline', 'Compassionate mental health care you can trust.')}
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => onNavigate('home')} className="hover:text-teal-400 transition-colors">Home</button></li>
              <li><button onClick={() => onNavigate('services')} className="hover:text-teal-400 transition-colors">Services</button></li>
              <li><button onClick={() => onNavigate('about')} className="hover:text-teal-400 transition-colors">About</button></li>
              <li><button onClick={() => onNavigate('faq')} className="hover:text-teal-400 transition-colors">FAQ</button></li>
              <li><button onClick={() => onNavigate('booking')} className="hover:text-teal-400 transition-colors">Book Appointment</button></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-teal-500 flex-shrink-0" />
                <span>{getCmsValue(cms, 'contact', 'address', '23, Vivekanandha Nagar, Potheri, Kattankulathur')}</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-teal-500 flex-shrink-0" />
                <span>{getCmsValue(cms, 'contact', 'hours', '6:00 PM to 9:00 PM, Mon-Sat')}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-teal-500 flex-shrink-0" />
                <span>{getCmsValue(cms, 'contact', 'phone', '+91 98765 43210')}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-teal-500 flex-shrink-0" />
                <span>{getCmsValue(cms, 'contact', 'email', 'care@acemindclinic.com')}</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">Services</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Counselling Services</li>
              <li>Outpatient Services</li>
              <li>Online Counselling</li>
              <li>Psychiatric Consultation</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-800 pt-6 text-center text-sm text-gray-500">
          {getCmsValue(cms, 'footer', 'copyright', '© 2026 Acemind Clinic. All rights reserved.')}
        </div>
      </div>
    </footer>
  );
}
