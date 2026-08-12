import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title:     z.string(),
    author: z.string().default('MR Glass Project'),
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

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title:       z.string(),
    category:    z.enum(['dla-domu', 'dla-firm']),
    images: z.array(
    z.object({
    image: z.string(),
    alt: z.string().optional(),
     })
    ),
    description: z.string().optional().nullable(),
    year:        z.coerce.number().optional().nullable(),
    dimensions:  z.string().optional().nullable(),
    order: z.coerce.number().optional().default(0),
    published:   z.boolean().default(true),
  }),
});

const pricingTierSchema = z.object({
  persons:    z.number(),
  price:      z.number(),
  label:      z.string().optional(),
  setmoreUrl: z.string(),
  stripeUrl:  z.string().optional(),
});

const workshops = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/workshops' }),
  schema: z.object({
    title:          z.string(),
    description:    z.string(),
    duration:       z.string(),
    maxPersons:     z.number(),
    price:          z.number(),
    pricePair:      z.number().optional(),
    pricePairLabel: z.string().optional(),
    voucherPair:    z.boolean().default(true),
    level:          z.enum(['fusing', 'podstawowy', 'zaawansowany', 'indywidualny']),
    setmoreUrl:     z.string(),
    active:         z.boolean().default(true),
    order:          z.number().default(0),
    featured:       z.boolean().default(false),
    stripeUrl1:     z.string().optional(),
    stripeUrl2:     z.string().optional(),
    pricingTiers:   z.array(pricingTierSchema).optional(),
  }),
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

const voucherFaq = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/voucherfaq' }),
  schema: z.object({
    order:    z.number().optional(),
    question: z.string(),
    answer:   z.string(),
  }),
});

export const collections = {
  posts,
  pages,
  projects,
  workshops,
  testimonials,
  faq,
  voucherfaq: voucherFaq,
};
