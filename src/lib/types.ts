// Base entry type
export interface BaseEntry {
  type: 'restaurant' | 'art' | 'tour';
  slug: string;
  name: string;
  rating: number;
  status: 'draft' | 'active' | 'inactive';
  date: string;
  images: string[];
  content: string;      // Raw markdown content (for editing)
  htmlContent?: string; // Rendered HTML (for display, not stored)
}

// Restaurant-specific
export interface RestaurantEntry extends BaseEntry {
  type: 'restaurant';
  cuisine: string[];
  price_range?: '€' | '€€' | '€€€' | '€€€€';
  ratings: {
    service: number;
    food: number;
    ambiance: number;
    value: number;
  };
  address?: string;
  link?: string;
}

// Art-specific
export interface ArtEntry extends BaseEntry {
  type: 'art';
  museum: string;
  exhibition_start?: string;
  exhibition_end?: string;
  link?: string;
}

// Tour-specific
export interface TourEntry extends BaseEntry {
  type: 'tour';
  distance_km?: number;
  duration?: string;
  difficulty?: 'leicht' | 'mittel' | 'schwer';
  link?: string;
}

// Union type
export type Entry = RestaurantEntry | ArtEntry | TourEntry;

// Session (for authentication)
export interface Session {
  id: string;
  createdAt: string;
  expiresAt: string;
}

// Category mapping for URLs
export const CATEGORY_PATHS = {
  restaurant: 'restaurants',
  art: 'kunst',
  tour: 'touren',
} as const;

export const PATH_TO_TYPE = {
  restaurants: 'restaurant',
  kunst: 'art',
  touren: 'tour',
} as const;
