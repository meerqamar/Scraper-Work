# Web Scraper Workshop

A TypeScript-based web scraping project that fetches pages, parses HTML, extracts structured data, validates and cleans it, and stores the results in PostgreSQL using Prisma.

## Overview

This project is designed for building respectful, maintainable scrapers with a clear modular pipeline:

- fetch the page
- parse the DOM
- extract target fields
- clean and validate the output
- save the data to PostgreSQL

## Features

- Respectful crawling with `robots.txt` handling and rate limiting
- Retry and timeout support for request reliability
- Structured extraction rules with CSS selectors and regex support
- Input validation and normalization through Zod
- Prisma-backed database storage
- Simple local development workflow with TypeScript and Node.js

## Quick Start

```bash
npm install
npm run prisma:migrate
npm run dev
```

To inspect saved records:

```bash
npm run prisma:studio
```

## Project Structure

```text
src/
  index.ts
  scraper.ts
  fetcher.ts
  extractor.ts
  cleaner.ts
  database.ts
  schemas.ts
  logger.ts
prisma/
  schema.prisma
package.json
tsconfig.json
```

## Configuration

Update the extraction rules in `src/index.ts` to match the target website structure and then run the scraper.

## Requirements

- Node.js 18+
- PostgreSQL
- TypeScript

## License

ISC
