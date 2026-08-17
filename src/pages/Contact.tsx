import { useEffect, useState, type FormEvent } from 'react';
import { Clock3, Mail } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { setPageMeta } from '../lib/pageMeta';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('');

  useEffect(() => {
    setPageMeta('Contact | Vividel Studio', 'Get in touch to plan commercial event, brand, or product photography coverage.');
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log('TODO: connect contact form to Firebase or backend workflow.', form);
    setStatus('Thanks! This form is ready for a real submission flow.');
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Contact</p>
        <h1 className="mt-2 text-display text-on-surface">Get in touch about your next shoot.</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <form onSubmit={handleSubmit} className="rounded-[2rem] border border-outline bg-surface-1 p-6 shadow-elevation-2">
          <div className="grid gap-5">
            <Input
              label="Name"
              name="name"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Your name"
              required
            />
            <Input
              label="Email"
              type="email"
              name="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              placeholder="your@email.com"
              required
            />
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-on-surface-variant">Message</label>
              <textarea
                name="message"
                value={form.message}
                onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
                placeholder="Tell us about your event, session, or creative brief."
                rows={6}
                required
                className="w-full rounded-[1.25rem] border border-outline bg-surface-2 px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <Button type="submit" variant="primary" size="lg">
              Send inquiry
            </Button>
            {status && <p className="text-sm text-primary">{status}</p>}
          </div>
        </form>

        <aside className="rounded-[2rem] border border-outline bg-surface-2 p-6 shadow-elevation-2">
          <h2 className="text-2xl font-semibold text-on-surface">Reach out</h2>
          {/* TODO: replace with real studio address and phone number once confirmed. */}
          <ul className="mt-5 space-y-4 text-sm text-on-surface-variant">
            <li className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 text-primary" />
              <a href="mailto:hello@vividel.studio" className="hover:text-primary">hello@vividel.studio</a>
            </li>
            <li className="flex items-start gap-3">
              <Clock3 className="mt-0.5 h-4 w-4 text-primary" />
              <span>Mon–Sat · 9am–6pm</span>
            </li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
