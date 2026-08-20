export type PortfolioItem = {
  id: string;
  title: string;
  category: 'Corporate Events' | 'Brand & Product Photography' | 'Night Life, Parties & Dinners';
  image: string;
  thumbImage: string;
  alt: string;
  description: string;
};

export const portfolioCategories = [
  'All',
  'Corporate Events',
  'Brand & Product Photography',
  'Night Life, Parties & Dinners'
] as const;

const corporate = (id: string) => `/portfolio/corporate-events/${id}`;
const nightlife = (id: string) => `/portfolio/nightlife-dinners/${id}`;
const brand = (id: string) => `/portfolio/brand-product/${id}`;

export const portfolioItems: PortfolioItem[] = [
  {
    id: 'keynote-address',
    title: 'Keynote Address',
    category: 'Corporate Events',
    image: corporate('keynote-address.jpg'),
    thumbImage: corporate('keynote-address-thumb.jpg'),
    alt: 'Speaker addressing the room during a corporate summit',
    description: 'A speaker addressing the room during a leadership summit.'
  },
  {
    id: 'panel-discussion',
    title: 'Panel Discussion',
    category: 'Corporate Events',
    image: corporate('panel-discussion.jpg'),
    thumbImage: corporate('panel-discussion-thumb.jpg'),
    alt: 'Panelist speaking during a corporate discussion session',
    description: 'A panelist speaking during a corporate discussion session.'
  },
  {
    id: 'breakout-session',
    title: 'Breakout Session',
    category: 'Corporate Events',
    image: corporate('breakout-session.jpg'),
    thumbImage: corporate('breakout-session-thumb.jpg'),
    alt: 'Attendees following a breakout session presentation',
    description: 'Attendees following a breakout session presentation.'
  },
  {
    id: 'session-lead',
    title: 'Session Lead',
    category: 'Corporate Events',
    image: corporate('session-lead.jpg'),
    thumbImage: corporate('session-lead-thumb.jpg'),
    alt: 'Session lead presenting to the room',
    description: 'A session lead presenting to the room.'
  },
  {
    id: 'site-briefing',
    title: 'Site Briefing',
    category: 'Corporate Events',
    image: corporate('site-briefing.jpg'),
    thumbImage: corporate('site-briefing-thumb.jpg'),
    alt: 'Project briefing with site plans on screen',
    description: 'A project briefing with site plans on screen.'
  },
  {
    id: 'roundtable',
    title: 'Roundtable',
    category: 'Corporate Events',
    image: corporate('roundtable.jpg'),
    thumbImage: corporate('roundtable-thumb.jpg'),
    alt: 'Roundtable discussion between attendees',
    description: 'A roundtable discussion between attendees.'
  },
  {
    id: 'delegates-portrait',
    title: 'Delegates',
    category: 'Corporate Events',
    image: corporate('delegates-portrait.jpg'),
    thumbImage: corporate('delegates-portrait-thumb.jpg'),
    alt: 'Delegates sharing a moment between sessions',
    description: 'Delegates sharing a moment between sessions.'
  },
  {
    id: 'burger-studio',
    title: 'Studio Product Shot',
    category: 'Brand & Product Photography',
    image: brand('burger-studio.jpg'),
    thumbImage: brand('burger-studio-thumb.jpg'),
    alt: "Studio product shot for a restaurant brand's signature burger",
    description: "Studio product shot for a restaurant brand's signature burger."
  },
  {
    id: 'plating-action',
    title: 'Plating & Styling',
    category: 'Brand & Product Photography',
    image: brand('plating-action.jpg'),
    thumbImage: brand('plating-action-thumb.jpg'),
    alt: 'Behind-the-scenes plating and styling for a product shoot',
    description: 'Behind-the-scenes plating and styling for a product shoot.'
  },
  {
    id: 'pizza-overhead',
    title: 'Overhead Product Shot',
    category: 'Brand & Product Photography',
    image: brand('pizza-overhead.jpg'),
    thumbImage: brand('pizza-overhead-thumb.jpg'),
    alt: 'Overhead product photography of a signature pizza',
    description: 'Overhead product photography of a signature pizza.'
  },
  {
    id: 'jollof-plated',
    title: 'Signature Plate',
    category: 'Brand & Product Photography',
    image: brand('jollof-plated.jpg'),
    thumbImage: brand('jollof-plated-thumb.jpg'),
    alt: "Studio food photography for a restaurant's signature plate",
    description: "Studio food photography for a restaurant's signature plate."
  },
  {
    id: 'burger-spread',
    title: 'Brand Campaign Spread',
    category: 'Brand & Product Photography',
    image: brand('burger-spread.jpg'),
    thumbImage: brand('burger-spread-thumb.jpg'),
    alt: 'Full product spread styled for a restaurant brand campaign',
    description: 'A full product spread styled for a restaurant brand campaign.'
  },
  {
    id: 'interior-bedroom',
    title: 'Interior Photography',
    category: 'Brand & Product Photography',
    image: brand('interior-bedroom.jpg'),
    thumbImage: brand('interior-bedroom-thumb.jpg'),
    alt: 'Interior photography for a property listing',
    description: 'Interior photography for a property listing.'
  },
  {
    id: 'property-exterior',
    title: 'Property Exterior',
    category: 'Brand & Product Photography',
    image: brand('property-exterior.jpg'),
    thumbImage: brand('property-exterior-thumb.jpg'),
    alt: 'Exterior property photography for a real estate listing',
    description: 'Exterior property photography for a real estate listing.'
  },
  {
    id: 'champagne-service',
    title: 'Champagne Service',
    category: 'Night Life, Parties & Dinners',
    image: nightlife('champagne-service.jpg'),
    thumbImage: nightlife('champagne-service-thumb.jpg'),
    alt: 'Champagne service at a private venue opening',
    description: 'Champagne service at a private venue opening.'
  },
  {
    id: 'guests-mingling',
    title: 'Guests Mingling',
    category: 'Night Life, Parties & Dinners',
    image: nightlife('guests-mingling.jpg'),
    thumbImage: nightlife('guests-mingling-thumb.jpg'),
    alt: 'Guests mingling at a nightlife venue opening',
    description: 'Guests mingling at a nightlife venue opening.'
  },
  {
    id: 'guests-portrait',
    title: 'Night Out',
    category: 'Night Life, Parties & Dinners',
    image: nightlife('guests-portrait.jpg'),
    thumbImage: nightlife('guests-portrait-thumb.jpg'),
    alt: 'Guests dressed up for a night out',
    description: 'Guests dressed up for a night out.'
  },
  {
    id: 'dinner-moment',
    title: 'Dinner Moment',
    category: 'Night Life, Parties & Dinners',
    image: nightlife('dinner-moment.jpg'),
    thumbImage: nightlife('dinner-moment-thumb.jpg'),
    alt: 'A candid moment over dinner and drinks',
    description: 'A candid moment over dinner and drinks.'
  },
  {
    id: 'venue-ambience',
    title: 'Venue Ambience',
    category: 'Night Life, Parties & Dinners',
    image: nightlife('venue-ambience.jpg'),
    thumbImage: nightlife('venue-ambience-thumb.jpg'),
    alt: 'Ambience inside the venue after hours',
    description: 'Ambience inside the venue after hours.'
  },
  {
    id: 'kitchen-action',
    title: 'Kitchen Action',
    category: 'Night Life, Parties & Dinners',
    image: nightlife('kitchen-action.jpg'),
    thumbImage: nightlife('kitchen-action-thumb.jpg'),
    alt: 'Behind-the-scenes plating in the kitchen',
    description: 'Behind-the-scenes plating in the kitchen during dinner service.'
  },
  {
    id: 'grill-service',
    title: 'Grill Service',
    category: 'Night Life, Parties & Dinners',
    image: nightlife('grill-service.jpg'),
    thumbImage: nightlife('grill-service-thumb.jpg'),
    alt: 'Skewers on the grill during dinner service',
    description: 'Skewers on the grill during dinner service.'
  }
];

export const featuredPortfolioItems = [
  portfolioItems.find((i) => i.id === 'keynote-address')!,
  portfolioItems.find((i) => i.id === 'burger-studio')!,
  portfolioItems.find((i) => i.id === 'champagne-service')!,
  portfolioItems.find((i) => i.id === 'breakout-session')!
];
