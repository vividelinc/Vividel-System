import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { setPageMeta } from '../lib/pageMeta';

export default function AboutPage() {
  useEffect(() => {
    setPageMeta('About | Vividel Studio', 'Learn about Vividel Studio and our approach to commercial, brand, and product photography.');
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">About</p>
          <h1 className="mt-2 text-display text-on-surface">A dependable partner for commercial photography.</h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-on-surface-variant">
            Vividel Studio specializes in commercial event coverage, brand photography, and product photography. We work with a calm, collaborative process built around clear deliverables and fast turnaround.
          </p>

          <div className="mt-8 rounded-[2rem] border border-outline bg-surface-2 p-6 shadow-elevation-2">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Mission</p>
            <p className="mt-3 text-base leading-7 text-on-surface-variant">
              To deliver photography that is consistent, on-brand, and ready to use across marketing, e-commerce, and event recaps.
            </p>
          </div>

          <div className="mt-8">
            <Link to="/book">
              <Button variant="primary" size="lg">
                Book a discovery call
              </Button>
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-8 -top-8 h-24 w-24 rounded-full bg-primary/20 blur-2xl" />
          <div className="absolute -bottom-8 -right-8 h-28 w-28 rounded-full bg-secondary/20 blur-2xl" />
          <img
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=80"
            alt="Photographer with a camera in natural light"
            className="relative h-[640px] w-full rounded-[2rem] object-cover shadow-elevation-4"
          />
        </div>
      </div>
    </div>
  );
}
