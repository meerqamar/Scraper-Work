import { createHash } from "crypto";
import { ListingSchema, ListingData } from "./schemas";
import { logger } from "./logger";

export class Cleaner {
  clean(rawData: Record<string, any>, sourceUrl: string): ListingData | null {
    const dataWithUrl: Record<string, any> = { ...rawData, sourceUrl };


    for (const key of Object.keys(dataWithUrl)) {
      if (typeof dataWithUrl[key] === "string" && key !== "rawHtml") {
        dataWithUrl[key] = this.normalizeWhitespace(this.stripHtml(dataWithUrl[key]));
      }
    }


    const result = ListingSchema.safeParse(dataWithUrl);

    if (!result.success) {
      logger.debug(`Validation failed for ${sourceUrl}: ${JSON.stringify(result.error.format())}`);
      return null;
    }

    return result.data;
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>?/gm, '');
  }

  private normalizeWhitespace(text: string): string {
    return text.replace(/\s+/g, ' ').trim();
  }

  generateHash(data: ListingData): string {
    const contentToHash = [
      data.title,
      data.price,
      data.location
    ].join("|");

    return createHash("sha256").update(contentToHash).digest("hex");
  }
}
