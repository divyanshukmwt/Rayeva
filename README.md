# Rayeva AI Modules

> Applied AI for Sustainable Commerce · Next.js 14 · Google Gemini

---

## Overview

Two fully implemented AI modules for the Rayeva B2B sustainable commerce platform, built with Next.js 14 (App Router), JavaScript (JSX), and Google Gemini API.

| Module | Status | Route |
|--------|--------|-------|
| **Module 1: Auto-Category & Tag Generator** | ✅ Fully implemented | `/categorize` |
| **Module 2: B2B Proposal Generator** | ✅ Fully implemented | `/proposal` |
| Module 3: Impact Reporting Generator | 📐 Architecture outlined | See below |
| Module 4: WhatsApp Support Bot | 📐 Architecture outlined | See below |

---

## Getting Started

### Prerequisites
- Node.js 18+
- A Gemini API key (get one free at https://aistudio.google.com/app/apikey)

### Installation

```bash
git clone <your-repo-url>
cd rayeva-ai-modules
npm install
```

### Environment Setup

```bash
cp .env.example .env.local
# Edit .env.local and set your GEMINI_API_KEY
```

### Run

```bash
npm run dev
# Open http://localhost:3000
```

---

## Architecture Overview

```
src/
├── app/
│   ├── page.jsx                    # Home / module selection
│   ├── categorize/page.jsx         # Module 1 UI
│   ├── proposal/page.jsx           # Module 2 UI
│   └── api/
│       ├── categorize/route.js     # POST /api/categorize
│       └── proposal/route.js       # POST /api/proposal
├── lib/
│   ├── ai-client.js                # Singleton Gemini client + logging
│   └── modules/
│       ├── categorize.js           # Module 1 business logic + prompts
│       └── proposal.js             # Module 2 business logic + prompts
```

### Key Design Decisions

**1. Separation of AI and Business Logic**

AI prompts, schemas, and parsing live in `src/lib/modules/`. API routes handle only request validation and HTTP concerns. The UI handles only presentation. Nothing is mixed.

```
Request → API Route (validate) → lib/module (AI + parse) → Response
```

**2. Centralized AI Client (`lib/ai-client.js`)**

All AI calls go through a single `runAIModule()` function. This function:
- Calls Gemini with the provided system + user prompt
- Logs every prompt, raw response, parsed output, duration, and success/failure
- Returns both the parsed result and the log entry

Swapping models, adding retries, or enabling streaming only requires changes in one file.

**3. Zod Schema Validation**

Every AI response is parsed through a Zod schema. If the AI returns malformed JSON or misses required fields, validation fails cleanly with a descriptive error — no silent data corruption.

**4. Environment-based API Key Management**

The Gemini API key is loaded exclusively from `process.env.GEMINI_API_KEY`. The client warns at startup if the key is missing. Keys never reach the client bundle.

**5. Path Aliases via jsconfig.json**

Since the project uses plain JavaScript (no TypeScript), `jsconfig.json` provides the `@/` path alias so imports like `@/lib/modules/proposal` resolve correctly in Next.js.

---

## Module 1: AI Auto-Category & Tag Generator

### What It Does

Takes a product name, description, optional materials, and brand — returns:
- `primaryCategory` (from a predefined list of 7 categories)
- `subCategory` (specific, filterable)
- `seoTags` (5–10 lowercase hyphenated SEO-optimized terms)
- `sustainabilityFilters` (from a curated list of 12 eco attributes)
- `confidenceScore` (0.0–1.0)
- `reasoning` (1–2 sentence explanation)

### API

```
POST /api/categorize
Content-Type: application/json

{
  "name": "Bamboo Dish Brush",
  "description": "Sustainably harvested bamboo handle...",
  "materials": "Bamboo, agave fibre",   // optional
  "brand": "EcoNest"                    // optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "primaryCategory": "Home & Living",
    "subCategory": "Kitchen & Dining",
    "seoTags": ["bamboo-dish-brush", "plastic-free-kitchen", "..."],
    "sustainabilityFilters": ["plastic-free", "compostable", "biodegradable"],
    "confidenceScore": 0.94,
    "reasoning": "The product is clearly a kitchen cleaning tool..."
  },
  "meta": { "logId": "categorize-1234-abc", "durationMs": 1420 }
}
```

### Prompt Design

The system prompt provides:
1. **Role grounding** — "sustainable e-commerce catalog expert for Rayeva"
2. **Closed vocabulary constraints** — category and filter lists are injected directly into the prompt, preventing hallucinated categories
3. **Output contract** — explicit JSON shape in the user prompt
4. **Instruction to avoid markdown fences** — for reliable JSON parsing

The user prompt is a templated string that includes only the product fields provided, keeping token count low for products with partial data.

---

## Module 2: AI B2B Proposal Generator

### What It Does

Takes client name, industry, budget, employees, goals, and preferences — returns a full proposal:
- `proposalTitle` and `executiveSummary`
- `products[]` — 2–8 recommended products with unit cost, quantity, total, sustainability highlights, and rationale
- `budgetAllocation` — total, allocated, buffer, and per-category breakdown
- `impactPositioning` — headline, key benefits, estimated plastic saved (kg), CO₂ avoided (kg), narrative
- `nextSteps` — 3 actionable items

### API

```
POST /api/proposal
Content-Type: application/json

{
  "clientName": "GreenLeaf Hospitality",
  "industry": "Hotels & Hospitality",
  "totalBudget": 150000,
  "currency": "INR",
  "numberOfEmployees": 120,
  "sustainabilityGoals": "Eliminate single-use plastics",
  "preferredCategories": ["Home & Living", "Personal Care"],
  "additionalNotes": "Products must look premium"
}
```

**Response:** Full `ProposalOutput` JSON (see `src/lib/modules/proposal.js` for schema).

### Prompt Design

The system prompt encodes three critical constraints as rules:
1. **Budget math must close** — `sum(unitCost × quantity) ≤ totalBudget` — instructed explicitly to prevent nonsensical allocations
2. **Conservative impact estimates** — plastic and CO₂ multipliers are provided to the model (0.05kg/unit and 0.1kg/unit respectively), grounding the numbers in logic rather than hallucination
3. **Category diversity** — the model is told to span 2–4 categories to avoid recommending 8 products from the same category

The user prompt includes only fields that were provided (optional fields are conditionally included), so the model focuses on what's relevant.

---

## Prompt/Response Logging

All AI interactions are logged via `runAIModule()` in `lib/ai-client.js`:

```js
{
  id: string,           // unique per call
  module: string,       // "categorize" | "proposal"
  prompt: string,       // full user prompt sent
  rawResponse: string,  // raw model output before parsing
  parsedOutput: object, // validated Zod output
  durationMs: number,   // end-to-end latency
  timestamp: string,
  success: boolean,
  error?: string
}
```

In production, replace the in-memory array with a database write:
```js
await db.aiLogs.create({ data: log });
```

---

## Module 3: Impact Reporting Generator (Architecture Outline)

### Trigger
After an order is placed in the system.

### Input
```js
{
  orderId: string,
  products: [{ productId, name, quantity, isSustainable, isLocallySourced, plasticFreePieces }]
}
```

### AI Prompt Design
The system prompt includes:
- Plastic weight-per-unit multipliers for common product types
- Carbon intensity factors for local vs. imported goods
- A template for generating a human-readable impact statement

### Output (stored with order)
```json
{
  "orderId": "ORD-001",
  "plasticSavedKg": 0.45,
  "carbonAvoidedKg": 1.2,
  "localSourcingPercent": 60,
  "localSourcingSummary": "3 of 5 products sourced within 200km",
  "impactStatement": "This order prevented 450g of plastic from entering the waste stream..."
}
```

### Stack
- Next.js API route `POST /api/impact`
- Triggered from order webhook or post-purchase server action
- Stored in `order_impact_reports` table

---

## Module 4: AI WhatsApp Support Bot (Architecture Outline)

### Flow
```
WhatsApp Message → Twilio Webhook → POST /api/whatsapp
  → Intent Classifier (AI) → Route to handler:
      [order_status]   → Query DB → Format reply
      [return_policy]  → Return policy FAQ lookup
      [refund/urgent]  → Escalate to human agent
  → Log conversation → Reply via Twilio API
```

### Components

**Intent Classification Prompt**
Classifies incoming message into: `order_status | return_policy | refund | general | unknown`

**Order Status Handler**
Queries `orders` table by phone number or order ID extracted from message. Returns structured status string to AI for formatting.

**Escalation Logic**
If intent is `refund` or sentiment score < 0.3, the bot replies with an empathetic message and creates a support ticket, tagging it `HIGH_PRIORITY`.

**Conversation Logging**
Every inbound message and outbound reply stored in `whatsapp_conversations` table with timestamp, intent, and resolution status.

### Stack
- Twilio WhatsApp API
- Next.js webhook route `POST /api/whatsapp`
- Prisma ORM for DB queries
- Google Gemini for intent classification and reply generation

---

## Tech Stack

- **Framework**: Next.js 14 (App Router, Route Handlers)
- **AI**: Google Gemini (`gemini-2.5-flash`)
- **Validation**: Zod
- **Styling**: Tailwind CSS
- **Language**: JavaScript (JSX) — no TypeScript
- **Path Aliases**: `jsconfig.json`

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Your Gemini API key (get one free at https://aistudio.google.com/app/apikey) |
| `DATABASE_URL` | Database connection string (for production DB writes) |
| `NEXT_PUBLIC_APP_URL` | App base URL |

---

Made with ❤️ by Divyanshu Kumawat