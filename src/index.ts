import { ScraperConfigSchema } from "./schemas";
import { Scraper } from "./scraper";
import { logger } from "./logger";
import dotenv from "dotenv";

dotenv.config();

const rawConfig = {
  name: "example-scrape",
  baseUrl: process.env.TARGET_BASE_URL || "https://example.com",
  domain: process.env.TARGET_DOMAIN || "example.com",
  botName: process.env.BOT_NAME || "WorkshopScraperBot",
  botEmail: process.env.BOT_EMAIL || "admin@example.com",
  botVersion: process.env.BOT_VERSION || "1.0.0",
  
  timeoutMs: parseInt(process.env.REQUEST_TIMEOUT_MS || "30000", 10),
  rateLimitDelayMs: parseInt(process.env.RATE_LIMIT_DELAY_MS || "1000", 10),
  maxConcurrent: parseInt(process.env.MAX_CONCURRENT_REQUESTS || "2", 10),
  maxRetries: parseInt(process.env.MAX_RETRIES || "3", 10),

  // Rule formats: jsonld://Type.field, meta://property, /regex/|group, selector|attr, selector
  extractionRules: {
    title: "jsonld://VacationRental.name",
    rating: "jsonld://VacationRental.aggregateRating.ratingValue",
    location: "jsonld://VacationRental.address.addressLocality",
    price: "meta://og:title",
    host: "meta://og:description",
  },

  
  urlsToScrape: [
    "/rooms/774442567042912473",
  ],
};

async function main() {
  try {
    const config = ScraperConfigSchema.parse(rawConfig);
    const scraper = new Scraper(config);
    await scraper.run();
  } catch (error) {
    logger.error(error, "Failed to start scraper");
    process.exit(1);
  }
}

main();
