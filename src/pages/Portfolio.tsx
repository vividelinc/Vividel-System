import { useEffect, useState } from 'react';
import { Lightbox } from '../components/gallery/Lightbox';
import { PortfolioGrid } from '../components/gallery/PortfolioGrid';
import { Button } from '../components/ui/Button';
import { DISCOVERY_CALL_URL } from '../data/siteContent';
import { portfolioCategories, portfolioItems, type PortfolioItem } from '../data/portfolio';
import { setPageMeta } from '../lib/pageMeta';

export default function PortfolioPage() {
  const [selectedCategory, setSelectedCategory] = useState<(typeof portfolioCategories)[number]>('All');
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);

  useEffect(() => {
    setPageMeta('Portfolio | Vividel Inc.', 'Browse recent work across commercial events, brand photography, and product photography.');
  }, []);

  const visibleItems =
    selectedCategory === 'All'
      ? portfolioItems
      : portfolioItems.filter((item) => item.category === selectedCategory);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <Lightbox item={selectedItem} items={visibleItems} onClose={() => setSelectedItem(null)} onSelect={setSelectedItem} />

      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Portfolio</p>
          <h1 className="mt-2 text-display text-on-surface">Recent work across events, brand, and product photography.</h1>
        </div>

        <a href={DISCOVERY_CALL_URL} target="_blank" rel="noreferrer">
          <Button variant="primary" size="md">
            Book a Discovery Call
          </Button>
        </a>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {portfolioCategories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setSelectedCategory(category)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              selectedCategory === category
                ? 'border-primary bg-primary-soft text-primary'
                : 'border-outline bg-surface-1 text-on-surface-variant hover:border-primary/60 hover:text-primary'
            }`}
            aria-pressed={selectedCategory === category}
          >
            {category}
          </button>
        ))}
      </div>

      <PortfolioGrid items={visibleItems} onSelect={setSelectedItem} />
    </div>
  );
}
