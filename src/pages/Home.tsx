import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { PortfolioGrid } from '../components/gallery/PortfolioGrid';
import { Lightbox } from '../components/gallery/Lightbox';
import { featuredPortfolioItems, portfolioItems, type PortfolioItem } from '../data/portfolio';
import { DISCOVERY_CALL_URL, services, testimonials } from '../data/siteContent';
import { setPageMeta } from '../lib/pageMeta';

export default function Home() {
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);

  useEffect(() => {
    setPageMeta(
      'Vividel Inc. | Commercial, Brand & Product Photography',
      'Ghana-based commercial and event photography studio delivering high-impact visuals for brands internationally.'
    );
  }, []);

  return (
    <div className="bg-surface-1 text-on-surface">
      <Lightbox item={selectedItem} items={portfolioItems} onClose={() => setSelectedItem(null)} onSelect={setSelectedItem} />

      <section className="relative overflow-hidden">
        {/* Swap this hero image with the final studio hero once real photography is in place. */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1800&q=80')"
          }}
        />
        <div className="absolute inset-0 bg-surface-1/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-surface-1 via-surface-1/85 to-surface-1/30" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="max-w-2xl">
            <p className="inline-flex rounded-full border border-primary/60 bg-primary-soft px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
              Commercial Events • Brand • Product Photography
            </p>
            <h1 className="mt-6 text-display text-on-surface">
              Professional photography for brands that mean business.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-on-surface-variant">
              Vividel Inc. delivers commercial event coverage, brand photography, and product photography with a fast, reliable turnaround.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href={DISCOVERY_CALL_URL} target="_blank" rel="noreferrer">
                <Button variant="primary" size="lg">
                  Book a Discovery Call
                </Button>
              </a>
              <Link to="/portfolio">
                <Button variant="outline" size="lg">
                  View Portfolio
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Featured work</p>
            <h2 className="mt-2 text-headline text-on-surface">A closer look at recent stories.</h2>
          </div>
          <Link to="/portfolio" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-strong">
            See full portfolio <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <PortfolioGrid items={featuredPortfolioItems} featured onSelect={setSelectedItem} />
      </section>

      <section className="bg-surface-2 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Services</p>
            <h2 className="mt-2 text-headline text-on-surface">Photography packages for events, brands, and products.</h2>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {services.map((service) => (
              <div key={service.name} className="rounded-[2rem] border border-outline bg-surface-1 p-6 shadow-elevation-2">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">{service.name}</p>
                  <span className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold text-primary">{service.price}</span>
                </div>
                <p className="mt-5 text-base leading-7 text-on-surface-variant">{service.description}</p>
                <p className="mt-4 text-sm text-on-surface-variant">{service.detail}</p>
                <div className="mt-6">
                  <Link to="/services">
                    <Button variant="secondary" size="md">
                      Explore service
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Client feedback</p>
            <h2 className="mt-2 text-headline text-on-surface">Trusted by teams who need reliable coverage.</h2>
          </div>
          <Link to="/testimonials" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-strong">
            Read more <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {testimonials.map((item) => (
            <div key={item.name} className="rounded-[2rem] border border-outline bg-surface-1 p-6 shadow-elevation-2">
              <div className="flex items-center gap-1 text-primary">
                {Array.from({ length: item.rating }).map((_, index) => (
                  <Star key={`${item.name}-${index}`} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="mt-4 text-base leading-7 text-on-surface-variant">“{item.quote}”</p>
              <div className="mt-6 border-t border-outline pt-4">
                <p className="font-semibold text-on-surface">{item.name}</p>
                <p className="text-sm text-on-surface-variant">{item.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-[2rem] bg-surface-2 px-6 py-10 text-center shadow-elevation-3 sm:px-10 lg:py-14">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Ready when you are</p>
          <h2 className="mt-4 text-headline text-on-surface">Let’s plan your next shoot.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-on-surface-variant">
            Tell us about your event, brand, or product line and we’ll put together a coverage plan that fits your timeline.
          </p>
          <div className="mt-8 flex justify-center">
            <a href={DISCOVERY_CALL_URL} target="_blank" rel="noreferrer">
              <Button variant="primary" size="lg">
                Book a Discovery Call
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
