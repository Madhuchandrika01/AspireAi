// src/lib/inngest/functions.js
import { db } from "@/lib/prisma";
import { inngest } from "./client";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ✅ Ensure key exists
if (!process.env.GEMINI_API_KEY) {
  throw new Error("❌ Missing GEMINI_API_KEY in .env file");
}

console.log("🔑 GEMINI_API_KEY loaded successfully!");

// ✅ Initialize Gemini v1 API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ Use latest model that works with AI Studio key
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

export const generateIndustryInsights = inngest.createFunction(
  { name: "Generate Industry Insights" },
  { cron: "0 0 * * 0" }, // weekly on Sunday
  async ({ step }) => {
    const industries = await step.run("Fetch industries", async () => {
      return await db.industryInsight.findMany({
        select: { industry: true },
      });
    });

    for (const { industry } of industries) {
      const prompt = `
      Analyze the current state of the ${industry} industry and provide insights strictly in JSON:

      {
        "salaryRanges": [
          { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
        ],
        "growthRate": number,
        "demandLevel": "High" | "Medium" | "Low",
        "topSkills": ["skill1", "skill2", "skill3"],
        "marketOutlook": "Positive" | "Neutral" | "Negative",
        "keyTrends": ["trend1", "trend2", "trend3"],
        "recommendedSkills": ["skill1", "skill2", "skill3"]
      }

      Only return valid JSON — no markdown or commentary.
      `;

      const res = await step.ai.wrap(
        "gemini",
        async (p) => {
          try {
            return await model.generateContent(p);
          } catch (err) {
            console.error(`❌ Gemini API failed for ${industry}: ${err.message}`);
            return null; // skip this industry but continue
          }
        },
        prompt
      );

      if (!res) continue;

      const text = res?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

      let insights;
      try {
        insights = JSON.parse(cleanedText);
      } catch (err) {
        console.error(`❌ JSON parse error for ${industry}:`, cleanedText);
        continue;
      }

      await step.run(`Update ${industry} insights`, async () => {
        await db.industryInsight.update({
          where: { industry },
          data: {
            ...insights,
            lastUpdated: new Date(),
            nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });
      });

      console.log(`✅ Updated insights for ${industry}`);
    }
  }
);
