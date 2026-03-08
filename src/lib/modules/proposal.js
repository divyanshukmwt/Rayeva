/**
 * lib/modules/proposal.js
 * Business logic for Module 2: AI B2B Proposal Generator.
 */

import { z } from "zod";
import { runAIModule, extractJSON } from "@/lib/ai-client";

const ProposedProductSchema = z.object({
  productName: z.string(),
  category: z.string(),
  unitCost: z.number().positive(),
  quantity: z.number().int().positive(),
  totalCost: z.number().positive(),
  sustainabilityHighlights: z.array(z.string()),
  whyRecommended: z.string(),
});

const BudgetAllocationSchema = z.object({
  totalBudget: z.number(),
  allocated: z.number(),
  remaining: z.number(),
  allocationByCategory: z.record(z.number()),
});

export const ProposalOutputSchema = z.object({
  clientName: z.string(),
  proposalTitle: z.string(),
  executiveSummary: z.string(),
  products: z.array(ProposedProductSchema).min(2).max(8),
  budgetAllocation: BudgetAllocationSchema,
  impactPositioning: z.object({
    headline: z.string(),
    keyBenefits: z.array(z.string()),
    estimatedPlasticSavedKg: z.number(),
    estimatedCO2AvoidedKg: z.number(),
    sustainabilityNarrative: z.string(),
  }),
  nextSteps: z.array(z.string()),
});

const SYSTEM_PROMPT = `You are a senior B2B sustainability consultant at Rayeva, a platform connecting businesses with eco-friendly product suppliers.

Your role is to create compelling, data-grounded product proposals for corporate clients transitioning to sustainable procurement.

Guidelines:
- Product recommendations must feel realistic and commercially viable
- Budget allocation must be precise: sum of (unitCost × quantity) must not exceed totalBudget
- Keep 5–15% of budget as buffer (show as "remaining")
- impactPositioning must use credible, conservative estimates
  - Plastic saved: ~0.05kg per plastic-free product unit
  - CO2 avoided: ~0.1kg per sustainably sourced product unit
- Products should span 2–4 different categories for diversity
- nextSteps should be 3 actionable items
- Respond ONLY with valid JSON — no markdown, no preamble`;

function buildUserPrompt(input) {
  return `Client: ${input.clientName}
Industry: ${input.industry}
Total Budget: ${input.currency ?? "INR"} ${input.totalBudget.toLocaleString()}
${input.numberOfEmployees ? `Employees: ${input.numberOfEmployees}` : ""}
${input.sustainabilityGoals ? `Sustainability Goals: ${input.sustainabilityGoals}` : ""}
${input.preferredCategories?.length ? `Preferred Categories: ${input.preferredCategories.join(", ")}` : ""}
${input.additionalNotes ? `Notes: ${input.additionalNotes}` : ""}

Generate a B2B sustainability proposal JSON with this exact shape:
{
  "clientName": string,
  "proposalTitle": string,
  "executiveSummary": string,
  "products": [
    {
      "productName": string,
      "category": string,
      "unitCost": number,
      "quantity": number,
      "totalCost": number,
      "sustainabilityHighlights": string[],
      "whyRecommended": string
    }
  ],
  "budgetAllocation": {
    "totalBudget": number,
    "allocated": number,
    "remaining": number,
    "allocationByCategory": { [category]: number }
  },
  "impactPositioning": {
    "headline": string,
    "keyBenefits": string[],
    "estimatedPlasticSavedKg": number,
    "estimatedCO2AvoidedKg": number,
    "sustainabilityNarrative": string
  },
  "nextSteps": string[]
}`;
}

function parseOutput(raw) {
  const json = extractJSON(raw);
  return ProposalOutputSchema.parse(json);
}

export async function generateProposal(input) {
  const { result, log } = await runAIModule(
    "proposal",
    SYSTEM_PROMPT,
    buildUserPrompt(input),
    parseOutput
  );

  // TODO: Replace with real DB write
  // await db.proposals.create({ clientName: input.clientName, ...result });

  return { output: result, logId: log.id, durationMs: log.durationMs };
}
