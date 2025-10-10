// testGemini.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ Change "gemini-pro" to "gemini-1.5-flash-latest"
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

async function testModel() {
  console.log("🔍 Testing Gemini API (gemini-1.5-flash-latest)…");
  try {
    const result = await model.generateContent("Say hello from Gemini!");
    console.log("✅ Gemini responded:", result.response.text());
  } catch (err) {
    console.error("❌ Gemini API test failed:", err.message);
  }
}

testModel();