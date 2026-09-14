import { Heart, Stethoscope, Video, ArrowRight, CheckCircle, Clock, Shield, User } from 'lucide-react';
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

export default function Services({ cms, onNavigate }: Props) {
  const services = [
    { num: 1, title: getCmsValue(cms, 'services', 'service_1_title', 'Counselling Services'), desc: getCmsValue(cms, 'services', 'service_1_desc', ''), icon: 'heart', features: ['Individual therapy sessions', 'Couples counselling', 'Family therapy', 'Confidential and empathetic approach'] },
    { num: 2, title: getCmsValue(cms, 'services', 'service_2_title', 'Outpatient Services'), desc: getCmsValue(cms, 'services', 'service_2_desc', ''), icon: 'stethoscope', features: ['Strictly by appointment', '15-minute review consultations', '1-hour new patient consultations', 'Comprehensive psychiatric assessment'] },
    { num: 3, title: getCmsValue(cms, 'services', 'service_3_title', 'Online Counselling'), desc: getCmsValue(cms, 'services', 'service_3_desc', ''), icon: 'video', features: ['Anonymised sessions', 'Available on exception basis', 'Connect from home', 'No digital prescriptions provided'] },
  ];

  return (
    <div className="pt-16">
      <section className="section-padding bg-gradient-to-b from-teal-50 to-white">
        <div className="container-max">
          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl font-semibold text-gray-900 sm:text-5xl">
              {getCmsValue(cms, 'services', 'title', 'Our Services')}
            </h1>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              {getCmsValue(cms, 'services', 'subtitle', 'Comprehensive mental health care tailored to your needs')}
            </p>
          </div>

          <div className="space-y-8">
            {services.map((service, i) => {
              const Icon = iconMap[service.icon] || Heart;
              return (
                <div
                  key={service.num}
                  className={`card overflow-hidden animate-fade-in-up ${i % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
                  style={{ animationDelay: `${i * 0.15}s` }}
                >
                  <div className="grid gap-6 lg:grid-cols-3 lg:items-center">
                    <div className="flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-teal-50 to-teal-100 p-8 lg:col-span-1">
                      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-teal-700 text-white">
                        <Icon className="h-10 w-10" />
                      </div>
                      <h3 className="mt-4 font-serif text-xl font-semibold text-teal-900 text-center">{service.title}</h3>
                    </div>
                    <div className="lg:col-span-2">
                      <p className="text-gray-600 leading-relaxed">{service.desc}</p>
                      <div className="mt-5 grid gap-2 sm:grid-cols-2">
                        {service.features.map((feature, fi) => (
                          <div key={fi} className="flex items-center gap-2 text-sm text-gray-700">
                            <CheckCircle className="h-4 w-4 text-teal-600 flex-shrink-0" />
                            {feature}
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => onNavigate('booking')}
                        className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-teal-700 hover:gap-2.5 transition-all"
                      >
                        Book this service <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-16 rounded-2xl bg-teal-50 border border-teal-100 p-8">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="flex items-start gap-3">
                <Clock className="h-6 w-6 text-teal-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900">Operating Hours</h4>
                  <p className="text-sm text-gray-600 mt-1">6:00 PM to 9:00 PM, Monday to Saturday</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="h-6 w-6 text-teal-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900">Confidentiality</h4>
                  <p className="text-sm text-gray-600 mt-1">All consultations are private and strictly confidential</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User className="h-6 w-6 text-teal-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900">Personalized Care</h4>
                  <p className="text-sm text-gray-600 mt-1">Treatment plans tailored to each individual's needs</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
