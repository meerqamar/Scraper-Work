import * as cheerio from "cheerio";
import { logger } from "./logger";
import { ScraperConfig } from "./schemas";

export class Extractor {
  private config: ScraperConfig;

  constructor(config: ScraperConfig) {
    this.config = config;
  }

  extract(html: string): Record<string, any> {
    const $ = cheerio.load(html);
    const result: Record<string, any> = {};

    for (const [field, rule] of Object.entries(this.config.extractionRules) as [string, string][]) {
      try {
        result[field] = this.applyRule($, html, rule);
      } catch (error: any) {
        logger.warn(`Failed to extract field '${field}' using rule '${rule}': ${error.message}`);
        result[field] = null;
      }
    }

    result.rawHtml = html;
    return result;
  }
  
  extractList(html: string, listSelector: string): Record<string, any>[] {
    const $ = cheerio.load(html);
    const results: Record<string, any>[] = [];
    
    $(listSelector).each((_, element) => {
        const itemHtml = $(element).html() || "";
        const result = this.extract(`<div>${itemHtml}</div>`);
        results.push(result);
    });
    
    return results;
  }

  private applyRule($: cheerio.CheerioAPI, html: string, rule: string): string | null {
    // jsonld://Type.field — extracts from <script type="application/ld+json"> blocks
    if (rule.startsWith("jsonld://")) {
      const path = rule.slice("jsonld://".length);
      const [targetType, ...fieldParts] = path.split(".");
      const fieldPath = fieldParts.join(".");
      
      const jsonLdBlocks = $('script[type="application/ld+json"]');
      for (let i = 0; i < jsonLdBlocks.length; i++) {
        try {
          const data = JSON.parse($(jsonLdBlocks[i]).html() || "{}");
          if (data["@type"] === targetType) {
            let value: any = data;
            for (const key of fieldPath.split(".")) {
              value = value?.[key];
            }
            return value != null ? String(value) : null;
          }
        } catch {
          continue;
        }
      }
      return null;
    }

    // meta://property — extracts content attribute from <meta> tags
    if (rule.startsWith("meta://")) {
      const metaName = rule.slice("meta://".length);
      const metaTag = $(`meta[property="${metaName}"], meta[name="${metaName}"]`).first();
      return metaTag.attr("content") || null;
    }

    // /regex/|group — applies regex and returns capture group
    if (rule.startsWith("/")) {
      const parts = rule.split("|");
      if (parts.length !== 2) throw new Error("Invalid regex rule format. Expected /pattern/|group");
      
      const patternString = parts[0].slice(1, parts[0].lastIndexOf("/"));
      const groupIndex = parseInt(parts[1], 10);
      
      const regex = new RegExp(patternString, "s");
      const match = html.match(regex);
      
      return match ? match[groupIndex] : null;
    }

    // selector|attribute — extracts an HTML attribute value
    if (rule.includes("|")) {
      const parts = rule.split("|");
      if (parts.length !== 2) throw new Error("Invalid attribute rule format. Expected selector|attribute");
      
      const selector = parts[0];
      const attribute = parts[1];
      
      return $(selector).first().attr(attribute) || null;
    }

    // Plain CSS selector — extracts text content
    return $(rule).text() || null;
  }
}
