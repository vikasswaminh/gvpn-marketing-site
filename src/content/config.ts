import { z, defineCollection } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.union([z.string(), z.date()]),
    updatedDate: z.union([z.string(), z.date()]).optional(),
    author: z.string().optional(),
    tags: z.array(z.string()).optional(),
    seoKeywords: z.array(z.string()).optional(),
    cover: image().optional(),
  }),
});

export const collections = {
  'blog': blogCollection,
};
