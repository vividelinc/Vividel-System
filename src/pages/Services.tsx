import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { DISCOVERY_CALL_URL, faqs, services } from '../data/siteContent';
import { setPageMeta } from '../lib/pageMeta';

export default function ServicesPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    setPageMeta('Services | Vividel Inc.', 'Explore corporate event, brand and product, and nightlife photography packages.');
  }, []);

  return (
    <div>
      <div className="border-b border-outline bg-surface-2 px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Services</p>
          <h1 className="mt-2 text-display text-on-surface">Photography Packages</h1>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {services.map((service) => (
            <div key={service.name} className="rounded-[2rem] border border-outline bg-surface-1 p-6 shadow-elevation-2">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-2xl font-semibold text-on-surface">{service.name}</h2>
                <span className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold text-primary">{service.price}</span>
              </div>

              <p className="mt-5 text-base leading-7 text-on-surface-variant">{service.description}</p>
              <p className="mt-4 text-sm leading-6 text-on-surface-variant">{service.detail}</p>

              <div className="mt-8 border-t border-outline pt-5">
                <a href={DISCOVERY_CALL_URL} target="_blank" rel="noreferrer">
                  <Button variant="primary" size="lg">
                    Book a Discovery Call
                  </Button>
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-20 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">FAQ</p>
          <h2 className="mt-2 text-headline text-on-surface">Common questions.</h2>

          <div className="mt-8 divide-y divide-outline rounded-[1.5rem] border border-outline bg-surface-1 shadow-elevation-2">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={faq.question}>
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  >
                    <span className="text-sm font-semibold text-on-surface sm:text-base">{faq.question}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-primary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {isOpen && (
                    <p className="px-6 pb-5 text-sm leading-7 text-on-surface-variant">{faq.answer}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
