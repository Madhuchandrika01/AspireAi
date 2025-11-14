"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// ======================================================
// FIXED FUNCTION — NOW READS UPLOADED RESUME AND JOB DATA
// ======================================================
export async function generateCoverLetter(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) throw new Error("User not found");

  // Clean and safely embed the resume content
  const resumeText = data.resumeContent?.replace(/\s+/g, " ").trim() || "";

  if (!data.jobTitle || !data.companyName || !data.jobDescription) {
    throw new Error("Missing job title, company name, or job description.");
  }

  if (!resumeText) {
    throw new Error("Missing resume content for personalization.");
  }

  const prompt = `
You are an expert professional career coach and writer.
Using the provided resume, job description, and candidate background, write a fully personalized, realistic cover letter.

Resume:
${resumeText}

User Profile:
- Industry: ${user.industry}
- Years of Experience: ${user.experience}
- Skills: ${user.skills?.join(", ")}
- Professional Summary: ${user.bio || "N/A"}

Job Information:
- Job Title: ${data.jobTitle}
- Company Name: ${data.companyName}
- Job Description: ${data.jobDescription}

Instructions:
1. Tailor the cover letter explicitly to the job and resume.
2. Use strong examples and align their experience with the role.
3. Avoid generic or finance-only language unless truly relevant.
4. Keep it under 400 words and formatted in markdown.
5. Return only the markdown text, do not include explanations or notes.
`;

  try {
    const result = await model.generateContent(prompt);
    const content = result.response.text().trim();

    const coverLetter = await db.coverLetter.create({
      data: {
        content,
        jobDescription: data.jobDescription,
        companyName: data.companyName,
        jobTitle: data.jobTitle,
        userId: user.id,
      },
    });

    return coverLetter;
  } catch (error) {
    console.error("Error generating cover letter:", error.message);
    throw new Error("Failed to generate cover letter");
  }
}

// ======================================================
// Fetch all cover letters for the user
// ======================================================
export async function getCoverLetters() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) throw new Error("User not found");

  return await db.coverLetter.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
}

// ======================================================
// Fetch a single cover letter
// ======================================================
export async function getCoverLetter(id) {
  console.log("--- getCoverLetter ACTION ---");
  console.log("1. ID received:", id);

  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) throw new Error("User not found");

  const coverLetter = await db.coverLetter.findUnique({
    where: { id, userId: user.id },
  });

  console.log("3. Result from DB:", coverLetter);
  console.log("----------------------------");

  return coverLetter;
}

// ======================================================
// Delete a cover letter
// ======================================================
export async function deleteCoverLetter(id) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) throw new Error("User not found");

  return await db.coverLetter.delete({
    where: { id, userId: user.id },
  });
}
