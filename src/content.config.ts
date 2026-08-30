import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title:     z.string(),
    author: z.string().default('Riverside Dym i Ogień'),
    date:      z.coerce.date(),
    excerpt:   z.string(),
    cover:     z.string(),
    published: z.boolean().default(false),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title:     z.string(),
    updatedAt: z.coerce.date(),
  }),
});

const gallery = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/gallery' }),
  schema: z.object({
    title:       z.string(),
    category:    z.enum(['Lokal', 'Wnetrza', 'Tank', 'Chef', 'Dania']),
    media: z.array(
    z.object({
    file: z.string(),
    alt: z.string().optional(),
     })
    ),
    order: z.coerce.number().optional().default(0),
    published:   z.boolean().default(true),
  }),
});

const pricingTierSchema = z.object({
  persons:    z.number(),
  price:      z.number(),
  label:      z.string().optional(),
  setmoreUrl: z.string(),
});

const testimonials = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/testimonials' }),
  schema: z.object({
    name:    z.string(),
    content: z.string(),
    rating: z.coerce.number().min(1).max(5).default(5),
    source:  z.string().optional(),
  }),
});


const faq = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/faq' }),
  schema: z.object({
    question: z.string(),
    answer:   z.string(),
    order:    z.number().default(0),
  }),
});

const menu = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/menu' }),
  schema: z.object({
    category:    z.string(),
    name:        z.string(),
    description: z.string().optional(),
    price:       z.string(),
    weight:      z.string().optional(),
    tags:        z.array(z.enum(['Pikantne', 'Wegetariańskie', 'Polecane'])).optional().default([]),
    image:       z.string().optional(),
    order:       z.coerce.number().optional().default(0),
    published:   z.boolean().default(true),
  }),
});

export const collections = {
  posts,
  pages,
  gallery,
  testimonials,
  faq,
  menu,
};
