import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import type { CmsContentMap } from '@/lib/cms';
import { getCmsValue } from '@/lib/cms';

type Props = {
  cms: CmsContentMap;
};

export default function FAQ({ cms }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [1, 2, 3, 4, 5, 6].map((n) => ({
    q: getCmsValue(cms, 'faq', `q${n}`, ''),
    a: getCmsValue(cms, 'faq', `a${n}`, ''),
  })).filter((faq) => faq.q && faq.a);

  return (
    <div className="pt-16">
      <section className="section-padding bg-gradient-to-b from-teal-50/50 to-white">
        <div className="container-max max-w-3xl">
          <div className="text-center mb-12">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 mb-4">
              <HelpCircle className="h-7 w-7" />
            </div>
            <h1 className="font-serif text-4xl font-semibold text-gray-900 sm:text-5xl">
              {getCmsValue(cms, 'faq', 'title', 'Frequently Asked Questions')}
            </h1>
            <p className="mt-4 text-gray-600">Find answers to common questions about our services and booking process.</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="card overflow-hidden animate-fade-in-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="flex w-full items-center justify-between gap-4 text-left"
                >
                  <span className="font-medium text-gray-900">{faq.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 flex-shrink-0 text-teal-600 transition-transform duration-300 ${
                      openIndex === i ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-300 ${
                    openIndex === i ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
