# Web Scraper Workshop — Complete Package

This folder contains a **production-ready web scraper** built from scratch with TypeScript, PostgreSQL, and professional data handling practices.

## What You're Getting

### 📦 Main Package: `scraper-workshop/`

Complete Node.js + TypeScript project with:

- **5 modular layers** (Fetch → Parse → Extract → Clean → Store)
- **Prisma ORM** with PostgreSQL
- **Zod validation** for strict type checking
- **Structured logging** (Pino)
- **robots.txt compliance** + rate limiting
- **Error handling** with exponential backoff retries
- **Content deduplication** using SHA256 hashing

**Use this to scrape any site** while respecting robots.txt and server load.

### 📚 Documentation

1. **WORKSHOP_GUIDE.md** ← **START HERE**
   - 5-minute overview
   - Complete getting started
   - Configuration reference
   - Real-world examples
   - Next steps (embeddings → RAG)

2. **CHEAT_SHEET.md**
   - Selector syntax reference
   - Configuration templates
   - Debugging guide
   - Common patterns
   - Quick commands

3. **scraper-workshop/README.md**
   - Full project documentation
   - Architecture details
   - API reference
   - Performance tuning

4. **scraper-workshop/QUICKSTART.md**
   - 15-minute setup guide
   - Step-by-step instructions
   - Troubleshooting

5. **scraper-workshop/ARCHITECTURE.md**
   - Design decisions
   - Data flow diagrams
   - Extension points
   - Security & ethics

## Quick Start (5 Minutes)

### 1. Setup Database
```bash
cd scraper-workshop
npm install
npm run prisma:migrate
```

### 2. Configure Target
Edit `src/index.ts`:
```typescript
extractionRules: {
  title: "h1.question-title",      // ← CSS selector
  statement: ".question-statement",
  optionA: ".option.a",
  // ... etc
},
urlsToScrape: [
  "/questions/1",
  "/questions/2",
],
```

### 3. Run
```bash
npm run dev
```

### 4. View Results
```bash
npm run prisma:studio
# Opens http://localhost:5555
```

## Project Structure

```
scraper-workshop/
├── src/
│   ├── index.ts                   # Entry point (customize here)
│   ├── scraper.ts                 # Orchestrator
│   ├── fetcher.ts                 # HTTP + robots.txt + rate limiting
│   ├── extractor.ts               # HTML parsing + CSS/regex
│   ├── cleaner.ts                 # Validation + normalization + dedupe
│   ├── database.ts                # Prisma storage
│   ├── schemas.ts                 # Zod validation
│   ├── logger.ts                  # Structured logging
│   ├── examples/
│   │   └── mdcat-config.ts        # 3 real-world examples
│   └── __tests__/
│       └── extractor.test.ts      # Test extraction
├── prisma/
│   └── schema.prisma              # Database schema (Question, ScraperRun)
├── package.json
├── tsconfig.json
├── .env.example                   # Environment template
├── README.md                       # Full documentation
├── QUICKSTART.md                  # 15-minute setup
└── ARCHITECTURE.md                # Design & data flow
```

## Key Features

✅ **Respectful Crawling**
- Parses and follows `/robots.txt`
- Configurable rate limiting (1-2s between requests typical)
- Proper User-Agent identification
- Graceful error handling

✅ **Data Quality**
- HTML stripping + entity decoding
- Whitespace normalization
- Zod type validation
- Content-based deduplication (SHA256)

✅ **Professional Reliability**
- Exponential backoff retries
- Per-request timeout handling
- Per-run error tracking
- Statistics and aggregation

✅ **Production Ready**
- Structured logging (Pino)
- TypeScript strict mode
- Modular architecture
- PostgreSQL storage with Prisma

## The Pipeline

```
FETCH                PARSE              EXTRACT             CLEAN & STORE
├─ robots.txt  →  ├─ Cheerio      →  ├─ CSS rules     →  ├─ Zod validation
├─ Rate limit     ├─ DOM parsing      ├─ Regex patterns    ├─ HTML stripping
├─ Retries        └─ Error handling   └─ Attributes       ├─ Normalization
└─ Timeout                                                 ├─ Deduplication
                                                           └─ PostgreSQL
```

## Configuration Options

### Extraction Rules (CSS + Regex)

```typescript
// Plain CSS selector
"title": "h1.question-title"

// Attribute extraction
"answer": "[data-correct]|data-correct"

// Regex pattern
"difficulty": "/Level: (\\w+)/|1"
```

### Rate Limiting

```typescript
rateLimitDelayMs: 1000    // 1 second between requests
maxConcurrent: 2          // 2 parallel requests max
```

### Retries

```typescript
maxRetries: 3             // 3 retry attempts
timeoutMs: 10000          // 10 second timeout per request
```

## Data Model

### Question Table
- `sourceUrl` (unique, original URL)
- `title`, `statement` (question content)
- `optionA`, `optionB`, `optionC`, `optionD` (choices)
- `correctAnswer` (A, B, C, or D)
- `explanation`, `difficulty`, `subject`, `tags` (optional)
- `scrapedAt`, `updatedAt` (timestamps)
- `scraperId` (which run created this)
- `rawHtml` (original HTML for debugging)

### ScraperRun Table
- `name` (run identifier)
- `status` (pending, running, completed, failed)
- `itemsScraped`, `itemsFailed` (counts)
- `startedAt`, `completedAt` (timestamps)
- `errorMessage` (if failed)

## Real-World Examples

### Example 1: Individual Question Pages
```typescript
{
  extractionRules: { /* fields */ },
  urlsToScrape: Array.from({ length: 100 }, (_, i) => `/question/${i + 1}`),
}
```

### Example 2: List Pages (Multiple Questions)
```typescript
{
  extractionRules: { /* fields */ },
  questionListSelector: ".question-card",
  urlsToScrape: Array.from({ length: 10 }, (_, i) => `/questions?page=${i + 1}`),
}
```

### Example 3: Advanced (Regex + Attributes)
```typescript
{
  extractionRules: {
    title: "h1",
    optionA: ".opt.a|data-value",           // Attribute
    correctAnswer: "/Answer: ([A-D])/|1",   // Regex
    difficulty: "/Level: (\\w+)/|1",        // Regex
  },
  urlsToScrape: ["bio/1", "chem/1", "phys/1"],
}
```

## Next Steps

### For Learning
1. Read **WORKSHOP_GUIDE.md** (comprehensive overview)
2. Follow **QUICKSTART.md** (step-by-step setup)
3. Customize `src/index.ts` (your first scrape)
4. Inspect results in `npm run prisma:studio`

### For Production
1. Set up PostgreSQL database
2. Configure `.env` with real credentials
3. Test on 10 records before full run
4. Monitor logs with `LOG_LEVEL=debug`
5. Export data to use in embeddings pipeline

### For Advanced Usage
1. Create custom `Extractor` for complex patterns
2. Implement custom `Cleaner` for domain logic
3. Extend database schema for your fields
4. Build caching layer for re-scraping

## Performance

- **Throughput**: 500-1000 questions/hour (rate-limited)
- **Bottleneck**: Rate limiting (1-2s delays)
- **Memory**: Constant regardless of dataset size
- **CPU**: Minimal (dominated by I/O)

## Troubleshooting

| Problem | Solution |
|---------|----------|
| No extractions | Test CSS selectors with DevTools Inspector |
| Wrong values | Inspect actual HTML structure; adjust selectors |
| Connection refused | Verify PostgreSQL running, check DATABASE_URL |
| Timeout errors | Increase `timeoutMs`, reduce `maxConcurrent` |
| Rate limit errors | Increase `rateLimitDelayMs` or `maxRetries` |

## Next: RAG Pipeline

With structured data in PostgreSQL:

```
Scraper Output
     ↓
Embeddings (sentence-transformers, OpenAI, Anthropic)
     ↓
Vector Store (Milvus, Pinecone, Weaviate)
     ↓
RAG Retrieval (search similar questions)
     ↓
LLM Context (feed top-K matches to Claude)
     ↓
Fine-tuning (use Q&A pairs for model training)
```

## Files Included

- **scraper-workshop/** — Complete Node.js project (ready to run)
- **WORKSHOP_GUIDE.md** — Comprehensive guide (start here)
- **CHEAT_SHEET.md** — Quick reference for selectors & config
- **README.md** — This file

## Requirements

- Node.js 18+
- PostgreSQL 12+
- TypeScript knowledge (helpful but not required)

## Commands

```bash
cd scraper-workshop

# Setup
npm install
npm run prisma:generate
npm run prisma:migrate

# Run
npm run dev                 # Development with watch
npm run build && npm start  # Production

# Database
npm run prisma:studio      # UI to browse/edit data

# Debug
LOG_LEVEL=debug npm run dev  # Verbose logging
```

## Philosophy

This is **not** a "download the web" tool. It's **data infrastructure**:

- ✅ Respects site owners (robots.txt, rate limits)
- ✅ Produces clean, validated data
- ✅ Tracks every scrape execution
- ✅ Enables RAG pipelines and fine-tuning

Build it right once, use it for all your scraping needs.

---

## Get Started

1. **Read**: WORKSHOP_GUIDE.md (5 min)
2. **Setup**: Follow QUICKSTART.md (5 min)
3. **Configure**: Edit src/index.ts with your selectors (3 min)
4. **Run**: `npm run dev` (watch logs)
5. **View**: `npm run prisma:studio` (see results)

**You'll have production-grade scraped data in 15 minutes.** 🚀

---

Questions or issues? Check:
- CHEAT_SHEET.md for selector syntax
- scraper-workshop/ARCHITECTURE.md for design details
- scraper-workshop/README.md for full documentation
