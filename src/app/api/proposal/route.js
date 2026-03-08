/**
 * app/api/proposal/route.js
 * POST /api/proposal
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { generateProposal } from "@/lib/modules/proposal";

const RequestSchema = z.object({
  clientName: z.string().min(2, "Client name required"),
  industry: z.string().min(2, "Industry required"),
  totalBudget: z.number().positive("Budget must be positive"),
  currency: z.string().optional().default("INR"),
  numberOfEmployees: z.number().int().positive().optional(),
  sustainabilityGoals: z.string().optional(),
  preferredCategories: z.array(z.string()).optional(),
  additionalNotes: z.string().optional(),
});

export async function POST(req) {
  try {
    const body = await req.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { output, logId, durationMs } = await generateProposal(parsed.data);

    return NextResponse.json({
      success: true,
      data: output,
      meta: { logId, durationMs },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/proposal] Error:", message);

    const isKeyError = message.toLowerCase().includes("api_key") || message.toLowerCase().includes("auth");
    return NextResponse.json(
      {
        error: isKeyError
          ? "Invalid or missing GEMINI_API_KEY. Check your .env.local file."
          : "Failed to generate proposal",
        message,
      },
      { status: 500 }
    );
  }
}
