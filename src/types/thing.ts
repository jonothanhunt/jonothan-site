export type ThingType = 'Post' | 'Video' | '3D Model' | 'Image' | 'AR Filter';

export interface ThingLink {
  title: string;
  url: string;
}

export interface ThingMetadata {
  title: string;
  date: string;
  excerpt: string;
  type: ThingType[];
  image?: string;
  links?: ThingLink[];
}
