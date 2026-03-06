/**
 * app/api/categorize/route.js
 * POST /api/categorize
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { categorizeProduct } from "@/lib/modules/categorize";

const RequestSchema = z.object({
  name: z.string().min(2, "Product name required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  materials: z.string().optional(),
  brand: z.string().optional(),
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

    const { output, logId, durationMs } = await categorizeProduct(parsed.data);

    return NextResponse.json({
      success: true,
      data: output,
      meta: { logId, durationMs },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/categorize] Error:", message);

    const isKeyError = message.toLowerCase().includes("api_key") || message.toLowerCase().includes("auth");
    return NextResponse.json(
      {
        error: isKeyError
          ? "Invalid or missing GEMINI_API_KEY. Check your .env.local file."
          : "Failed to categorize product",
        message,
      },
      { status: 500 }
    );
  }
}
