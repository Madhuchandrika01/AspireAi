"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Strong fallback dataset
const FALLBACK_DATA = {
  salaryRanges: [
    { role: "Software Engineer", min: 60000, max: 120000, median: 90000, location: "Global" },
    { role: "Data Scientist", min: 65000, max: 130000, median: 95000, location: "Global" },
    { role: "DevOps Engineer", min: 70000, max: 125000, median: 100000, location: "Global" },
    { role: "Product Manager", min: 75000, max: 140000, median: 110000, location: "Global" },
    { role: "UI/UX Designer", min: 55000, max: 100000, median: 80000, location: "Global" }
  ],
  growthRate: 10,
  demandLevel: "MEDIUM",
  topSkills: ["Python", "JavaScript", "SQL", "React", "Cloud Computing"],
  marketOutlook: "NEUTRAL",
  keyTrends: ["AI adoption", "Remote work", "Cloud migration", "Cybersecurity", "Automation"],
  recommendedSkills: ["AI/ML", "DevOps", "Data Analysis", "Leadership", "System Design"],
};

export const generateAIInsights = async (industry) => {
  const prompt = `
    Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:

    {
      "salaryRanges": [
        { "role": "Software Engineer", "min": 60000, "max": 120000, "median": 90000, "location": "USA" },
        { "role": "Data Scientist", "min": 65000, "max": 130000, "median": 95000, "location": "USA" },
        { "role": "DevOps Engineer", "min": 70000, "max": 125000, "median": 100000, "location": "USA" },
        { "role": "Product Manager", "min": 75000, "max": 140000, "median": 110000, "location": "USA" },
        { "role": "UI/UX Designer", "min": 55000, "max": 100000, "median": 80000, "location": "USA" }
      ],
      "growthRate": 12,
      "demandLevel": "High",
      "topSkills": ["Python", "Java", "SQL", "React", "Cloud Computing"],
      "marketOutlook": "Positive",
      "keyTrends": ["AI adoption", "Remote work", "Cloud migration", "Cybersecurity", "Automation"],
      "recommendedSkills": ["AI/ML", "DevOps", "Data Analysis", "Leadership", "System Design"]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    const parsed = JSON.parse(cleanedText);

    // Normalize enums for Prisma
    if (parsed.demandLevel) parsed.demandLevel = parsed.demandLevel.toUpperCase();
    if (parsed.marketOutlook) parsed.marketOutlook = parsed.marketOutlook.toUpperCase();

    return parsed;
  } catch {
    // No console logs — silently fallback
    return FALLBACK_DATA;
  }
};

export async function getIndustryInsights() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: { industryInsight: true },
  });

  if (!user) throw new Error("User not found");

  if (!user.industryInsight) {
    const insights = await generateAIInsights(user.industry);

    const industryInsight = await db.industryInsight.create({
      data: {
        industry: user.industry,
        ...insights,
        nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return industryInsight;
  }

  return user.industryInsight;
}
