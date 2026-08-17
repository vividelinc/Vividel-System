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
