export type ThingType = string;

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
