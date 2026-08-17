import { useEffect } from 'react';
import { CONTACT_EMAIL } from '../data/siteContent';
import { setPageMeta } from '../lib/pageMeta';

export default function PrivacyPage() {
  useEffect(() => {
    setPageMeta('Privacy Policy | Vividel Inc.', 'How Vividel Inc. collects, uses, and protects information submitted through this site.');
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Privacy Policy</p>
      <h1 className="mt-2 text-display text-on-surface">Privacy Policy</h1>
      <p className="mt-4 text-sm text-on-surface-variant">Last updated: August 17, 2026</p>

      <div className="mt-10 space-y-8 text-base leading-7 text-on-surface-variant">
        <section>
          <h2 className="text-title text-on-surface">Who we are</h2>
          <p className="mt-3">
            Vividel Inc. ("Vividel", "we", "us") is a commercial and event photography studio based in Ghana, working
            with clients internationally. This policy explains what information we collect through this website and
            how it is used.
          </p>
        </section>

        <section>
          <h2 className="text-title text-on-surface">Information we collect</h2>
          <p className="mt-3">We collect information you provide directly to us, including:</p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>Contact details submitted through the contact form (name, email, message).</li>
            <li>Booking details submitted through the booking form (name, email, phone, event/service details, dates, and location).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-title text-on-surface">How we use your information</h2>
          <p className="mt-3">We use the information you submit to:</p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>Respond to inquiries and discovery call requests.</li>
            <li>Plan, schedule, and deliver booked photography services.</li>
            <li>Send booking confirmations, contracts, and related communications.</li>
          </ul>
          <p className="mt-3">We do not sell your information to third parties.</p>
        </section>

        <section>
          <h2 className="text-title text-on-surface">Third-party services</h2>
          <p className="mt-3">
            We use third-party services to operate this site and our booking workflow, including Firebase (data
            storage) and Cal.com (discovery call scheduling). These providers process information on our behalf and
            are bound by their own privacy and security practices.
          </p>
        </section>

        <section>
          <h2 className="text-title text-on-surface">Data retention</h2>
          <p className="mt-3">
            We retain booking and contact information for as long as necessary to deliver services, meet legal or
            accounting obligations, and maintain business records.
          </p>
        </section>

        <section>
          <h2 className="text-title text-on-surface">Your rights</h2>
          <p className="mt-3">
            You may request access to, correction of, or deletion of the personal information you've submitted to us
            by contacting us at{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:text-primary-strong">
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-title text-on-surface">Contact</h2>
          <p className="mt-3">
            Questions about this policy can be sent to{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:text-primary-strong">
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
