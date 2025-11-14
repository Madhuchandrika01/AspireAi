"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { generateAIInsights } from "./dashboard";

export async function updateUser(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    // 1) Make sure we have an industryInsight for this industry.
    //    Do NOT wrap the AI call in a Prisma transaction.
    let industryInsight = await db.industryInsight.findUnique({
      where: { industry: data.industry },
    });

    if (!industryInsight) {
      // Slow part: call Gemini to generate insights
      const insights = await generateAIInsights(data.industry);

      try {
        industryInsight = await db.industryInsight.create({
          data: {
            industry: data.industry,
            ...insights,
            nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });
      } catch (createError) {
        // In case of a race condition where another request created it first,
        // just read the existing record.
        console.error(
          "Error creating industry insight, attempting to re-fetch:",
          createError
        );
        industryInsight = await db.industryInsight.findUnique({
          where: { industry: data.industry },
        });
      }
    }

    // 2) Update user profile (simple DB query, no long transaction needed)
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        industry: data.industry,
        experience: data.experience,
        bio: data.bio,
        skills: data.skills,
      },
    });

    return { success: true, updatedUser, industryInsight };
  } catch (error) {
    console.error("Error updating user and industry:", error?.message || error);
    throw new Error(
      "Failed to update profile: " + (error?.message || "Unknown error")
    );
  }
}

export async function getUserOnboardingStatus() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: { industry: true },
  });

  if (!user) {
    return { isOnboarded: false };
  }

  try {
    return { isOnboarded: !!user.industry };
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    throw new Error("Failed to check onboarding status");
  }
}
