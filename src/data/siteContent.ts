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

// Rendered as plain wordmark text by default; `logo` is only set for the
// handful of clients whose actual logo file was supplied to the project.
export type TrustedClient = {
  name: string;
  logo?: string;
};

export const trustedClients: TrustedClient[] = [
  { name: 'World Bank Ghana' },
  { name: 'Ministry of Education, Ghana' },
  { name: "Attorney General's Office, Kumasi" },
  { name: 'Bolt Ghana', logo: '/logos/bolt.svg' },
  { name: 'OFI (Olam Food Ingredients)' },
  { name: 'OCP (Olam Cocoa Processing)' },
  { name: 'Chamber of Agribusiness Ghana', logo: '/logos/chamber-of-agribusiness.jpg' },
  { name: 'Lancaster Kumasi City' },
  { name: 'Cedar Restaurants' },
  { name: 'The Joint Foods' },
  { name: 'Ridge Tennis Club' },
  { name: 'Dag Heward-Mills Ministries', logo: '/logos/dhm-ministries.png' }
];

export type ServiceItem = {
  name: string;
  description: string;
  price: string;
  detail: string;
};

export const services: ServiceItem[] = [
  {
    name: 'Corporate Events',
    description: 'Full coverage for conferences, summits, launches, and corporate gatherings.',
    price: '$1,600+',
    detail: 'Includes a pre-event planning call, on-site coverage, and a same-week edited gallery.'
  },
  {
    name: 'Brand & Product Photography',
    description: 'Studio and on-location sessions for founders, teams, and product lines that need a consistent visual identity.',
    price: '$650+',
    detail: 'Includes creative direction, styling, and a retouched, platform-ready image set.'
  },
  {
    name: 'Night Life, Parties & Dinners',
    description: 'Candid, atmosphere-first coverage for private dinners, parties, and nightlife events.',
    price: '$900+',
    detail: 'Includes on-site coverage through the night and a fast-turnaround highlight gallery.'
  }
];

export type FaqItem = {
  question: string;
  answer: string;
};

export const faqs: FaqItem[] = [
  {
    question: 'How far in advance should we book?',
    answer:
      "For corporate events and large productions, 2–4 weeks out is ideal so we can lock your date and plan logistics. Brand and product shoots can often be booked with less notice — tell us your timeline on the discovery call and we'll let you know what's realistic."
  },
  {
    question: 'Do you travel outside Accra or Ghana for shoots?',
    answer:
      "Yes. We're based in Ghana and work with clients across the country, and take on select international projects. Travel and logistics are scoped as part of your discovery call."
  },
  {
    question: 'What exactly is included in the starting price?',
    answer:
      'Every package covers on-site coverage, professional editing, and a delivered gallery. Exact deliverables — turnaround time, number of edited images, and usage rights — depend on the scope of your project, so we confirm the full breakdown on your discovery call before you book.'
  },
  {
    question: 'How long until we receive the final photos?',
    answer:
      "Corporate event galleries are typically delivered within a week. Brand and product shoots usually turn around faster since they're studio-based. We'll confirm an exact delivery date before the shoot."
  },
  {
    question: 'Do you provide the raw, unedited files?',
    answer:
      "No. Every image we deliver is professionally edited and color-graded to a consistent standard — raw files aren't part of standard packages."
  },
  {
    question: 'Can we use the photos for ads and social media?',
    answer:
      'Yes. Usage rights are discussed upfront as part of every project scope, so you know exactly what you can do with the final images before you book.'
  },
  {
    question: 'Do you require a deposit to book?',
    answer:
      'Yes — a deposit secures your date once a contract is signed, with the balance due on or before delivery. Exact terms are confirmed during booking.'
  },
  {
    question: 'What if our event runs longer than planned?',
    answer:
      "Let us know as early as possible on the day and we'll do our best to extend coverage. Time beyond the agreed hours is billed at an hourly add-on rate."
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
