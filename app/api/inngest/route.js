// src/app/api/inngest/route.js
import { inngest } from "@/lib/inngest/client";
import { generateIndustryInsights } from "@/lib/inngest/functions";
import { serve } from "inngest/next";

// ✅ Correct App Router export style:
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [generateIndustryInsights],
});
