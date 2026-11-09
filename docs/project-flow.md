# Automation Hub Project Flow

This project is a collection of automation tasks that scrape data from the web, enrich it with Gemini AI, generate social-ready visual content, and publish it to social channels or messaging apps.

## High-level architecture

```mermaid
flowchart TD
    A[User / scheduler / npm script] --> B[package.json scripts]

    B --> C[src/tasks/*]
    C --> C1[morning-quote]
    C --> C2[nse-earnings]
    C --> C3[job-listing]
    C --> C4[interview-prep]
    C --> C5[market-pulse]
    C --> C6[insta-stocks / earnings-results / etc.]

    C --> D[Web scraping + browser automation]
    D --> E[src/core/browser.ts]
    D --> F[src/core/scrapper]
    D --> G[Task-specific fetchers]

    G --> H[Raw data: jobs, market, quotes, results]
    H --> I[Helpers + constants + mock data]
    H --> J[src/core/gemini.ts]
    J --> K[AI-generated summaries, headlines, captions]

    K --> L[Image generation modules]
    L --> M[Social publishing layer]
    M --> M1[Facebook / Instagram / Threads / X]
    M --> M2[Telegram / Discord notifications]

    H --> N[MongoDB storage]
    N --> O[src/db/index.ts + services]

    M2 --> P[Alerts and scheduled posts]
    O --> P
```

## Typical task flow

```mermaid
flowchart LR
    Start[Trigger task] --> Fetch[Fetch data from website]
    Fetch --> Parse[Extract structured results]
    Parse --> Validate[Filter / dedupe / business rules]
    Validate --> AI[Gemini summarization + caption generation]
    AI --> Image[Generate post image / infographic]
    Image --> Save[Upload image / store result]
    Save --> Publish[Post to Instagram / X / Threads / Facebook]
    Save --> Notify[Send Telegram / Discord message]
    Publish --> DB[(MongoDB)]
    Notify --> End[Done]
```

## Example: morning quote engine

```mermaid
flowchart TD
    A[runDailyQuoteEngine] --> B[axios.get zenquotes.io]
    B --> C[quote payload]
    C --> D[generateQuoteImage]
    D --> E[Image URL returned]
    C --> F[Sanitize caption + headline]
    E --> G[broadcastUpdate]
    F --> G
    G --> H[Instagram / X / Threads publish]
    H --> I[Done]
```

## Key project components

- src/tasks/: independent automation tasks such as market updates, job scraping, quote posting, interview prep, and NSE monitoring.
- src/core/: shared infrastructure for browser automation, AI, image uploads, notifications, and social media publishing.
- src/db/: MongoDB connection and service layer for storing scraped or processed results.
- lib/: constants, mock data, and helper utilities used across tasks.
- package.json: entry points for different automation jobs.

## Execution model

Most tasks follow the same pattern:

1. Launch a browser or call a public API.
2. Scrape or fetch raw data.
3. Validate and normalize the data.
4. Pass it to Gemini for summarization or extraction.
5. Generate a visual asset or formatted message.
6. Save to MongoDB if needed.
7. Publish it to social media or notify via Telegram/Discord.

This is effectively a modular automation framework for content and data workflows rather than a single app.
