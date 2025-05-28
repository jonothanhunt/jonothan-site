export type ThingType = 'Post' | 'Video' | '3D Model' | 'Image' | 'AR Filter';

export interface ThingMetadata {
  title: string;
  date: string;
  excerpt: string;
  type: ThingType[];
}
