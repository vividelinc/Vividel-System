import { useEffect } from 'react';
import { motion } from 'motion/react';
import { Star } from 'lucide-react';
import { testimonials } from '../data/siteContent';
import { setPageMeta } from '../lib/pageMeta';

export default function TestimonialsPage() {
  useEffect(() => {
    setPageMeta('Testimonials | Vividel Inc.', 'Client feedback on commercial event, brand, and product photography work.');
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Testimonials</p>
        <h1 className="mt-2 text-display text-on-surface">What clients say about working with us.</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {testimonials.map((item, index) => (
          <motion.article
            key={item.name}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.35, delay: index * 0.08 }}
            className="rounded-[2rem] border border-outline bg-surface-1 p-6 shadow-elevation-2"
          >
            <div className="flex items-center gap-1 text-primary">
              {Array.from({ length: item.rating }).map((_, starIndex) => (
                <Star key={`${item.name}-${starIndex}`} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <p className="mt-5 text-base leading-7 text-on-surface-variant">“{item.quote}”</p>
            <div className="mt-6 border-t border-outline pt-4">
              <p className="font-semibold text-on-surface">{item.name}</p>
              <p className="text-sm text-on-surface-variant">{item.role}</p>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
