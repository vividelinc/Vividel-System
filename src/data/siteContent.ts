// The public site sends leads here first; the owner shares the /book link
// directly with a client only after a positive discovery call.
export const DISCOVERY_CALL_URL = 'https://cal.com/vividel-inc/30min?overlayCalendar=true';

export const CONTACT_EMAIL = 'vividelinc@gmail.com';
export const CONTACT_PHONE_DISPLAY = '+233 50 412 4077';
export const CONTACT_PHONE_TEL = '+233504124077';
export const CONTACT_WHATSAPP_URL = 'https://wa.me/233504124077';

export type SocialLink = {
  label: string;
  href: string;
};

export const socialLinks: SocialLink[] = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/vividel-inc' },
  { label: 'Instagram', href: 'https://www.instagram.com/vividel.inc' },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/profile.php?id=61592474495822&sk=directory_privacy_and_legal_info&_rdc=1&_rdr'
  }
];

export type ServiceItem = {
  name: string;
  description: string;
  price: string;
  detail: string;
};

export const services: ServiceItem[] = [
  {
    name: 'Commercial Event Coverage',
    description: 'Full coverage for conferences, product launches, and corporate gatherings.',
    price: '$1,600+',
    detail: 'Includes a pre-event planning call, on-site coverage, and a same-week edited gallery.'
  },
  {
    name: 'Brand Photography',
    description: 'On-location or studio sessions for founders, teams, and brand campaigns that need a consistent visual identity.',
    price: '$950+',
    detail: 'Includes creative direction, location guidance, and a licensed image set.'
  },
  {
    name: 'Product Photography',
    description: 'Studio product photography for e-commerce, catalogs, and marketing campaigns.',
    price: '$650+',
    detail: 'Includes styling, multiple angles per product, and retouched, platform-ready files.'
  }
];

export type Testimonial = {
  name: string;
  role: string;
  quote: string;
  rating: number;
};

// Placeholder testimonials — replace with real client quotes once available.
export const testimonials: Testimonial[] = [
  {
    name: 'Sample Client',
    role: 'Marketing Director',
    quote: 'The team covered our annual summit start to finish and delivered a same-week gallery that was ready for our recap deck and social channels.',
    rating: 5
  },
  {
    name: 'Sample Client',
    role: 'Brand Founder',
    quote: 'Our product shots finally look like our brand — clean, consistent, and ready to drop straight into our site and ads.',
    rating: 5
  },
  {
    name: 'Sample Client',
    role: 'Marketing Agency Partner',
    quote: 'Reliable and easy to brief. Every event gallery comes back polished and on time.',
    rating: 5
  }
];
