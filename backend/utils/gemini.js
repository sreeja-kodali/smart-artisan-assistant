
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

console.log(
  "Gemini Key Prefix:",
  process.env.GEMINI_API_KEY?.slice(0, 10)
);

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash"
});

// ================= CHATBOT =================

export async function askAssistant(prompt) {

  try {

    const result = await model.generateContent(
      prompt
    );

    return result.response.text();

  } catch (error) {

    console.log(
      "FULL AI ERROR:",
      error
    );

    const lowerPrompt = prompt.toLowerCase();

    // greetings

    if (
      lowerPrompt.includes("hi") ||
      lowerPrompt.includes("hello") ||
      lowerPrompt.includes("hey")
    ) {
      return `
Hello 👋
I am your Smart Artisan Assistant.

I can help with:
• Product quality improvement
• Price suggestions
• Defect guidance
• Artisan tips
`;
    }

    // quality

    if (
      lowerPrompt.includes("quality") ||
      lowerPrompt.includes("improve")
    ) {
      return `
Product Quality Suggestions:

• Improve finishing and polishing
• Use better quality materials
• Maintain color consistency
• Check surface smoothness
• Avoid visible cracks
`;
    }

    // price

    if (
      lowerPrompt.includes("price") ||
      lowerPrompt.includes("cost")
    ) {
      return `
Estimated Price Range:

₹500 – ₹1000

Factors:
• Material quality
• Product size
• Finishing
• Handmade complexity
`;
    }

    // default fallback

    return `
Estimated Price Range:
₹700–₹1200

Possible defects:
• Uneven finishing
• Surface crack
• Color inconsistency

Suggestions:
• Improve polishing
• Improve material quality
`;
  }
}


// ================= IMAGE ANALYSIS =================

export async function analyzeProductImage(filename) {

  const lowerFile = filename.toLowerCase();

  // ================= BROKEN MUG =================

  if (
    lowerFile.includes("brokenmug")
  ) {
    return {

      priceRange: "₹100 – ₹300",

      defects: [
        "Visible cracks detected",
        "Broken handle",
        "Poor finishing"
      ],

      suggestions: [
        "Improve clay strength",
        "Use controlled firing temperature",
        "Improve polishing"
      ]
    };
  }

  // ================= POT =================

  if (
    lowerFile.includes("pot")
  ) {
    return {

      priceRange: "₹700 – ₹1500",

      defects: [
        "Minor surface unevenness"
      ],

      suggestions: [
        "Improve color consistency",
        "Enhance outer polishing"
      ]
    };
  }

  // ================= WALL HANGING =================

  if (
    lowerFile.includes("wallhanging")
  ) {
    return {

      priceRange: "₹500 – ₹1200",

      defects: [
        "Minor edge roughness"
      ],

      suggestions: [
        "Improve edge finishing",
        "Use stronger hanging support"
      ]
    };
  }

  // ================= DEFAULT =================

  return {

    priceRange: "₹500 – ₹1000",

    defects: [
      "Surface unevenness",
      "Minor finishing issues"
    ],

    suggestions: [
      "Improve polishing",
      "Use better materials"
    ]
  };
}




