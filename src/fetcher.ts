import { chromium, Browser, Page } from "playwright-core";
import robotsParser, { Robot } from "robots-parser";
import { logger } from "./logger";
import { ScraperConfig } from "./schemas";

export class Fetcher {
  private config: ScraperConfig;
  private browser: Browser | null = null;
  private robots: Robot | null = null;
  private lastRequestTime = 0;

  constructor(config: ScraperConfig) {
    this.config = config;
  }

  async init() {
    try {
      const robotsUrl = `${this.config.baseUrl}/robots.txt`;
      logger.debug(`Fetching robots.txt from ${robotsUrl}`);
      const response = await fetch(robotsUrl);
      const text = await response.text();
      this.robots = robotsParser(robotsUrl, text);
      logger.info("Successfully parsed robots.txt");
    } catch (error) {
      logger.warn("Could not fetch robots.txt, proceeding with default respectful behavior");
    }
    const executablePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
    this.browser = await chromium.launch({ headless: true, executablePath });
    logger.info("Playwright Chromium launched");
  }

  private async enforceRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const delayNeeded = this.config.rateLimitDelayMs - timeSinceLastRequest;

    if (delayNeeded > 0) {
      logger.debug(`Rate limiting: sleeping for ${delayNeeded}ms`);
      await new Promise(resolve => setTimeout(resolve, delayNeeded));
    }
    
    const jitter = Math.random() * (this.config.rateLimitDelayMs * 0.1);
    await new Promise(resolve => setTimeout(resolve, jitter));

    this.lastRequestTime = Date.now();
  }

  private async sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async fetch(urlPath: string): Promise<string | null> {
    const fullUrl = new URL(urlPath, this.config.baseUrl).toString();

    if (this.robots && !this.robots.isAllowed(fullUrl, `${this.config.botName}/${this.config.botVersion}`)) {
      logger.warn(`Scraping disallowed by robots.txt for: ${fullUrl}`);
      return null;
    }

    let attempt = 0;
    while (attempt < this.config.maxRetries) {
      try {
        await this.enforceRateLimit();
        logger.debug(`Fetching ${fullUrl} (Attempt ${attempt + 1}/${this.config.maxRetries})`);
        
        if (!this.browser) {
          throw new Error("Browser not initialized");
        }
        const page: Page = await this.browser.newPage();
        const response = await page.goto(fullUrl, { waitUntil: "domcontentloaded", timeout: this.config.timeoutMs });
        
        if (!response) {
          throw new Error("No response");
        }

        if (response.status() === 404) {
          logger.warn(`Page not found (404): ${fullUrl}`);
          await page.close();
          return null;
        }

        if (response.status() >= 300) {
          throw new Error(`Unexpected status code: ${response.status()}`);
        }

        const content = await page.content();
        await page.close();
        return content;
      } catch (error: any) {
        attempt++;
        logger.error(`Error fetching ${fullUrl}: ${error.message}`);
        
        if (error.response?.status === 429) {
          logger.warn("Rate limited (429)! Backing off significantly.");
          await this.sleep(this.config.rateLimitDelayMs * 5 * attempt);
        } else if (attempt < this.config.maxRetries) {
          const backoff = this.config.rateLimitDelayMs * Math.pow(2, attempt);
          logger.debug(`Backing off for ${backoff}ms before retry...`);
          await this.sleep(backoff);
        } else {
          logger.error(`Max retries reached for ${fullUrl}. Giving up.`);
          throw error;
        }
      }
    }
    return null;
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      logger.info("Playwright browser closed");
    }
  }
}
