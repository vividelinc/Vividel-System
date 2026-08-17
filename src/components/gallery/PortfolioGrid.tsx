import { motion } from 'motion/react';
import type { PortfolioItem } from '../../data/portfolio';

interface PortfolioGridProps {
  items: PortfolioItem[];
  featured?: boolean;
  onSelect: (item: PortfolioItem) => void;
}

export function PortfolioGrid({ items, featured = false, onSelect }: PortfolioGridProps) {
  return (
    <div
      className={
        featured
          ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'
          : 'grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3'
      }
    >
      {items.map((item, index) => (
        <motion.article
          key={item.id}
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.35, delay: index * 0.04 }}
          className="group"
        >
          <button
            type="button"
            onClick={() => onSelect(item)}
            className="block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-1"
            aria-label={`View ${item.title}`}
          >
            <div className="relative overflow-hidden rounded-[1.5rem] bg-surface-2 shadow-elevation-2">
              <img
                src={item.image}
                alt={item.alt}
                loading="lazy"
                className="h-80 w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-primary-soft">
                  {item.category}
                </p>
                <h3 className="mt-2 text-xl font-semibold text-white">{item.title}</h3>
              </div>
            </div>
          </button>
        </motion.article>
      ))}
    </div>
  );
}
