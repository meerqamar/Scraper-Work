import { PrismaClient } from "@prisma/client";
import { ListingData } from "./schemas";
import { logger } from "./logger";

export class Database {
  public prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async connect() {
    await this.prisma.$connect();
  }

  async disconnect() {
    await this.prisma.$disconnect();
  }

  async createRun(name: string): Promise<string> {
    const run = await this.prisma.scraperRun.create({
      data: {
        name,
        status: "running",
      }
    });
    return run.id;
  }

  async completeRun(id: string, itemsScraped: number, itemsFailed: number, errorMessage?: string) {
    await this.prisma.scraperRun.update({
      where: { id },
      data: {
        status: errorMessage ? "failed" : "completed",
        itemsScraped,
        itemsFailed,
        completedAt: new Date(),
        errorMessage,
      }
    });
  }

  async saveListing(data: ListingData, scraperId: string) {
    try {
      await this.prisma.listing.upsert({
        where: { sourceUrl: data.sourceUrl },
        update: {
          title: data.title,
          price: data.price,
          rating: data.rating,
          location: data.location,
          host: data.host,
          amenities: data.amenities,
          rawHtml: data.rawHtml,
          scraperId,
          updatedAt: new Date(),
        },
        create: {
          ...data,
          scraperId,
        }
      });
      return true;
    } catch (error: any) {
      logger.error(`Database error saving listing from ${data.sourceUrl}: ${error.message}`);
      return false;
    }
  }

  async getStats() {
    const totalListings = await this.prisma.listing.count();
    const latestRun = await this.prisma.scraperRun.findFirst({
        orderBy: { completedAt: 'desc' }
    });
    return {
      totalListings,
      lastScrape: latestRun?.completedAt
    };
  }
}
