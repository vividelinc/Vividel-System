import { Clock3, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const quickLinks = [
  { label: 'Portfolio', to: '/portfolio' },
  { label: 'Services', to: '/services' },
  { label: 'About', to: '/about' },
  { label: 'Testimonials', to: '/testimonials' },
  { label: 'Contact', to: '/contact' }
];

export function Footer() {
  return (
    <footer className="border-t border-outline bg-surface-2">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_0.8fr_1fr] lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Vividel Studio</p>
          <p className="mt-4 max-w-md text-sm leading-7 text-on-surface-variant">
            Commercial event coverage, brand photography, and product photography.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-on-surface">Quick Links</h3>
          <ul className="mt-4 space-y-3 text-sm text-on-surface-variant">
            {quickLinks.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="hover:text-primary">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-on-surface">Contact</h3>
          {/* TODO: replace with real studio address and phone number once confirmed. */}
          <ul className="mt-4 space-y-3 text-sm text-on-surface-variant">
            <li className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 text-primary" />
              <a href="mailto:hello@vividel.studio" className="hover:text-primary">hello@vividel.studio</a>
            </li>
            <li className="flex items-start gap-3">
              <Clock3 className="mt-0.5 h-4 w-4 text-primary" />
              <span>Mon–Sat • 9am–6pm</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-outline bg-surface-1/60">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-sm text-on-surface-variant sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© 2026 Vividel Studio. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
