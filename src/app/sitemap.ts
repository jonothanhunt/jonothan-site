import type { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://jonothan.dev',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    },
    {
      url: 'https://jonothan.dev/things',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.5,
    },
  ]
}