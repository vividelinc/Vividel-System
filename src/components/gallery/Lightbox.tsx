import { useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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

  const navButtonClasses =
    'absolute top-1/2 z-10 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center rounded-full border border-outline bg-surface-1/90 text-on-surface shadow-elevation-3 transition hover:bg-surface-2';

  return (
    <Modal isOpen={Boolean(item)} onClose={onClose} title={item.title} maxWidth="6xl">
      <div className="space-y-4">
        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-primary">{item.category}</p>

        <div className="relative flex items-center justify-center overflow-hidden rounded-[1.5rem] bg-surface-2">
          <img src={item.image} alt={item.alt} className="max-h-[75vh] w-full object-contain" />

          <button
            type="button"
            aria-label="Previous photo"
            onClick={() => onSelect(previousItem)}
            className={`${navButtonClasses} left-3`}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Next photo"
            onClick={() => onSelect(nextItem)}
            className={`${navButtonClasses} right-3`}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <p className="text-sm leading-6 text-on-surface-variant">{item.description}</p>
      </div>
    </Modal>
  );
}
