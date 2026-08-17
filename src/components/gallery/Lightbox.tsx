import { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import type { PortfolioItem } from '../../data/portfolio';

interface LightboxProps {
  item: PortfolioItem | null;
  items: PortfolioItem[];
  onClose: () => void;
  onSelect: (item: PortfolioItem) => void;
}

export function Lightbox({ item, items, onClose, onSelect }: LightboxProps) {
  if (!item) return null;

  const currentIndex = items.findIndex((entry) => entry.id === item.id);
  const previousItem = currentIndex > 0 ? items[currentIndex - 1] : items[items.length - 1];
  const nextItem = currentIndex < items.length - 1 ? items[currentIndex + 1] : items[0];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }

      if (event.key === 'ArrowLeft') {
        onSelect(previousItem);
      }

      if (event.key === 'ArrowRight') {
        onSelect(nextItem);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextItem, onClose, onSelect, previousItem]);

  return (
    <Modal isOpen={Boolean(item)} onClose={onClose} title={item.title} maxWidth="xl">
      <div className="grid gap-6 lg:grid-cols-[1.55fr_0.9fr]">
        <div className="relative overflow-hidden rounded-[1.5rem] bg-surface-2">
          <img src={item.image} alt={item.alt} className="max-h-[70vh] w-full object-cover" />
        </div>

        <div className="flex flex-col justify-between gap-5">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-primary">{item.category}</p>
            <h3 className="mt-2 text-2xl font-semibold text-on-surface">{item.title}</h3>
            <p className="mt-3 text-sm leading-6 text-on-surface-variant">{item.description}</p>
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={() => onSelect(previousItem)}>
              Prev
            </Button>
            <Button type="button" variant="primary" onClick={() => onSelect(nextItem)}>
              Next
            </Button>
          </div>

          <div className="rounded-2xl border border-outline bg-surface-2 p-4 text-sm text-on-surface-variant">
            Placeholder image — swap for real client photography once available.
          </div>
        </div>
      </div>

      <button
        type="button"
        aria-label="Close lightbox"
        onClick={onClose}
        className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-outline bg-surface-1/90 text-on-surface shadow-elevation-3 transition hover:bg-surface-2"
      >
        <X className="h-4 w-4" />
      </button>
    </Modal>
  );
}
