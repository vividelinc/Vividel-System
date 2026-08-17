export type PortfolioItem = {
  id: string;
  title: string;
  category: 'Commercial Events' | 'Brand Photography' | 'Product Photography';
  image: string;
  alt: string;
  description: string;
};

export const portfolioCategories = ['All', 'Commercial Events', 'Brand Photography', 'Product Photography'] as const;

// Swap these placeholder image URLs for final client photography when available.
export const portfolioItems: PortfolioItem[] = [
  {
    id: 'leadership-summit',
    title: 'Leadership Summit',
    category: 'Commercial Events',
    image:
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    alt: 'Speaker presenting on stage at a corporate conference',
    description: 'Full-day coverage of a leadership summit, from keynote sessions to networking.'
  },
  {
    id: 'brand-campaign-shoot',
    title: 'Brand Campaign Shoot',
    category: 'Brand Photography',
    image:
      'https://images.unsplash.com/photo-1556155092-490a1ba16284?auto=format&fit=crop&w=1200&q=80',
    alt: 'Creative team directing a brand photography session',
    description: 'Creative direction and styling for a seasonal brand campaign.'
  },
  {
    id: 'product-still-life',
    title: 'Product Still Life',
    category: 'Product Photography',
    image:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80',
    alt: 'Studio still-life product photography on a clean background',
    description: 'Clean, editorial product photography for e-commerce and campaign use.'
  },
  {
    id: 'product-launch-night',
    title: 'Product Launch Night',
    category: 'Commercial Events',
    image:
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
    alt: 'Guests at a brand product launch event under stage lighting',
    description: "Coverage of a brand's product launch, from setup through the after-hours crowd."
  },
  {
    id: 'studio-brand-session',
    title: 'Studio Brand Session',
    category: 'Brand Photography',
    image:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    alt: 'Studio lighting setup for a founder brand photography session',
    description: "Studio session built around a founder's brand and public-facing identity."
  },
  {
    id: 'footwear-campaign',
    title: 'Footwear Campaign',
    category: 'Product Photography',
    image:
      'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=1200&q=80',
    alt: 'Studio product photography of a shoe for a footwear brand',
    description: "Studio product photography for a footwear brand's seasonal collection."
  }
];

export const featuredPortfolioItems = portfolioItems.slice(0, 4);
