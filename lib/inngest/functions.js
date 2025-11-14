
import { db } from "@/lib/prisma";
import { inngest } from "./client";
import { GoogleGenerativeAI } from "@google/generative-ai";


if (!process.env.GEMINI_API_KEY) {
  throw new Error("❌ Missing GEMINI_API_KEY in .env file");
}
console.log("🔑 GEMINI_API_KEY loaded successfully!");


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export const generateIndustryInsights = inngest.createFunction(
  { name: "Generate Industry Insights" },
  { cron: "0 0 * * 0" }, 
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
          "topSkills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
          "marketOutlook": "Positive" | "Neutral" | "Negative",
          "keyTrends": ["trend1", "trend2", "trend3", "trend4", "trend5"],
          "recommendedSkills": ["skill1", "skill2", "skill3", "skill4", "skill5"]
        }

        Only return valid JSON — no markdown, commentary, or explanation.
      `;

      const res = await step.ai.wrap(
        "gemini",
        async (p) => {
          try {
            return await model.generateContent(p);
          } catch (err) {
            console.error(`❌ Gemini API failed for ${industry}: ${err.message}`);
            return null;
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

      
      if (insights.demandLevel)
        insights.demandLevel = insights.demandLevel.toUpperCase();
      if (insights.marketOutlook)
        insights.marketOutlook = insights.marketOutlook.toUpperCase();

      
      await step.run(`Update ${industry} insights`, async () => {
        try {
          const updated = await db.industryInsight.update({
            where: { industry },
            data: {
              ...insights,
              lastUpdated: new Date(),
              nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
          });
          console.log(`Updated insights for ${industry}`);
          return updated; 
        } catch (err) {
          console.error(`Prisma update failed for ${industry}: ${err.message}`);
          return null;
        }
      });
    }
  }
);
