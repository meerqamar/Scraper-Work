import { z } from "zod";

export const ScraperConfigSchema = z.object({
  name: z.string(),
  baseUrl: z.string().url(),
  domain: z.string(),
  botName: z.string(),
  botEmail: z.string().email(),
  botVersion: z.string(),
  timeoutMs: z.number().default(10000),
  rateLimitDelayMs: z.number().default(1000),
  maxConcurrent: z.number().default(2),
  maxRetries: z.number().default(3),
  extractionRules: z.record(z.string(), z.string()),
  urlsToScrape: z.array(z.string()),
  questionListSelector: z.string().optional(),
});

export type ScraperConfig = z.infer<typeof ScraperConfigSchema>;

export const ListingSchema = z.object({
  sourceUrl: z.string().url(),
  title: z.string().min(1),
  price: z.string().min(1),
  rating: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  host: z.string().optional().nullable(),
  amenities: z.string().optional().nullable(),
  rawHtml: z.string().optional().nullable(),
});

export type ListingData = z.infer<typeof ListingSchema>;
