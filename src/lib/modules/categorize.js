/**
 * lib/modules/categorize.js
 * Business logic for Module 1: AI Auto-Category & Tag Generator.
 */

import { z } from "zod";
import { runAIModule, extractJSON } from "@/lib/ai-client";

export const CATEGORY_TREE = {
  "Home & Living": ["Kitchen & Dining", "Bedroom", "Bathroom", "Cleaning", "Decor"],
  "Food & Beverage": ["Snacks", "Beverages", "Condiments", "Pantry Staples", "Fresh Produce"],
  "Personal Care": ["Skincare", "Haircare", "Oral Care", "Feminine Care", "Baby Care"],
  "Fashion & Apparel": ["Clothing", "Footwear", "Accessories", "Activewear", "Kids"],
  "Office & Stationery": ["Writing", "Packaging", "Paper Products", "Desk Accessories"],
  "Outdoor & Garden": ["Gardening", "Outdoor Furniture", "Composting", "Travel Gear"],
  "Pet Care": ["Food", "Grooming", "Accessories", "Bedding"],
};

export const SUSTAINABILITY_FILTERS = [
  "plastic-free",
  "compostable",
  "vegan",
  "recycled-materials",
  "organic-certified",
  "fair-trade",
  "zero-waste",
  "biodegradable",
  "cruelty-free",
  "locally-sourced",
  "refillable",
  "carbon-neutral",
];

export const CategoryOutputSchema = z.object({
  primaryCategory: z.string(),
  subCategory: z.string(),
  seoTags: z.array(z.string()).min(5).max(10),
  sustainabilityFilters: z.array(z.string()),
  confidenceScore: z.number().min(0).max(1),
  reasoning: z.string(),
});

const SYSTEM_PROMPT = `You are a sustainable e-commerce catalog expert for Rayeva, a B2B platform for eco-friendly products.
Your task is to analyze product information and return structured categorization data.

Available primary categories: ${Object.keys(CATEGORY_TREE).join(", ")}

Available sustainability filters: ${SUSTAINABILITY_FILTERS.join(", ")}

Rules:
- primaryCategory MUST be one of the listed categories exactly
- subCategory should be specific and useful for filtering
- seoTags: 5-10 lowercase hyphenated terms optimized for search (e.g. "bamboo-toothbrush", "plastic-free-kitchen")
- sustainabilityFilters: only include filters genuinely applicable to the product
- confidenceScore: 0.0–1.0 reflecting how certain you are
- reasoning: 1–2 sentences explaining your choices

Respond ONLY with valid JSON — no markdown fences, no preamble.`;

function buildUserPrompt(input) {
  return `Product Name: ${input.name}
Description: ${input.description}${input.materials ? `\nMaterials: ${input.materials}` : ""}${input.brand ? `\nBrand: ${input.brand}` : ""}

Return JSON matching this exact shape:
{
  "primaryCategory": string,
  "subCategory": string,
  "seoTags": string[],
  "sustainabilityFilters": string[],
  "confidenceScore": number,
  "reasoning": string
}`;
}

function parseOutput(raw) {
  const json = extractJSON(raw);
  return CategoryOutputSchema.parse(json);
}

export async function categorizeProduct(input) {
  const { result, log } = await runAIModule(
    "categorize",
    SYSTEM_PROMPT,
    buildUserPrompt(input),
    parseOutput
  );

  // TODO: Replace with real DB write
  // await db.productCategories.upsert({ productName: input.name, ...result });

  return { output: result, logId: log.id, durationMs: log.durationMs };
}
