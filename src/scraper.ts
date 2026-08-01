import { Fetcher } from "./fetcher";
import { Extractor } from "./extractor";
import { Cleaner } from "./cleaner";
import { Database } from "./database";
import { ScraperConfig } from "./schemas";
import { logger } from "./logger";

export class Scraper {
  private config: ScraperConfig;
  private fetcher: Fetcher;
  private extractor: Extractor;
  private cleaner: Cleaner;
  private database: Database;
  
  private seenHashes: Set<string> = new Set();

  constructor(config: ScraperConfig) {
    this.config = config;
    this.fetcher = new Fetcher(config);
    this.extractor = new Extractor(config);
    this.cleaner = new Cleaner();
    this.database = new Database();
  }

  async run() {
    logger.info(`Starting scraper run: ${this.config.name}`);
    
    await this.database.connect();
    const runId = await this.database.createRun(this.config.name);
    await this.fetcher.init();

    let itemsScraped = 0;
    let itemsFailed = 0;
    let errorMessage: string | undefined;

    try {
      for (const url of this.config.urlsToScrape) {
        try {
          const html = await this.fetcher.fetch(url);
          
          if (!html) {
            itemsFailed++;
            continue;
          }

          let extractedItems: Record<string, any>[] = [];

          if (this.config.questionListSelector) {
            extractedItems = this.extractor.extractList(html, this.config.questionListSelector);
          } else {
            extractedItems = [this.extractor.extract(html)];
          }

          for (const rawData of extractedItems) {
            const cleanData = this.cleaner.clean(rawData, new URL(url, this.config.baseUrl).toString());
            
            if (!cleanData) {
              itemsFailed++;
              continue;
            }

            const hash = this.cleaner.generateHash(cleanData);
            if (this.seenHashes.has(hash)) {
              logger.debug(`Skipping duplicate item from ${url}`);
              continue;
            }
            this.seenHashes.add(hash);

            const saved = await this.database.saveListing(cleanData, runId);
            if (saved) {
              itemsScraped++;
              logger.info(`Successfully saved item from ${url}`);
            } else {
              itemsFailed++;
            }
          }
        } catch (error: any) {
          logger.error(`Failed processing URL ${url}: ${error.message}`);
          itemsFailed++;
        }
      }
    } catch (error: any) {
      logger.error(`Critical error during scraper run: ${error.message}`);
      errorMessage = error.message;
    } finally {
      await this.fetcher.close();
      await this.database.completeRun(runId, itemsScraped, itemsFailed, errorMessage);
      logger.info(`Run completed. Scraped: ${itemsScraped}, Failed: ${itemsFailed}`);
      await this.database.disconnect();
    }
  }
}
