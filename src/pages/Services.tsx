import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { services } from '../data/siteContent';
import { setPageMeta } from '../lib/pageMeta';

export default function ServicesPage() {
  useEffect(() => {
    setPageMeta('Services | Vividel Studio', 'Explore commercial event, brand, and product photography packages.');
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Services</p>
        <h1 className="mt-2 text-display text-on-surface">Photography packages for events, brands, and products.</h1>
      </div>

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
              <Link to="/book">
                <Button variant="primary" size="lg">
                  Book Now
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
