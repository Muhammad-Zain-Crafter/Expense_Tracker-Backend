import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI;

const getGeminiClient = () => {
  if (!genAI) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY not found in env");
    }
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
};

const CATEGORIES = [
  "Food",
  "Transportation",
  "Entertainment",
  "Utilities",
  "Healthcare",
  "Education",
  "Shopping",
  "Personal Care",
  "Gifts and Donations",
  "Travel",
  "Rent",
  "Other",
];

const keywordCategory = (text) => {
  const lower = text.toLowerCase();

  if (/food|lunch|dinner|meal|restaurant|cafe|coffee|starbucks|kfc/.test(lower))
    return "Food";

  if (/uber|taxi|bus|fuel|petrol|transport|indrive|bykea/.test(lower))
    return "Transportation";

  if (/movie|netflix|game|spotify/.test(lower))
    return "Entertainment";

  if (/rent|house|apartment|shop|office/.test(lower))
    return "Rent";

  if (/electricity|gas|internet|water|bill/.test(lower))
    return "Utilities";

  if (/doctor|medicine|hospital|pharmacy/.test(lower))
    return "Healthcare";

  if (/school|college|course|tuition|education/.test(lower))
    return "Education";

  if (/shopping|clothes|amazon|daraz|mall/.test(lower))
    return "Shopping";

  return null;
};

export const categorizeExpense = async (title, description = "") => {
  try {
    const text = `${title} ${description}`;

    // 1️⃣ Free keyword match
    const keywordResult = keywordCategory(text);
    if (keywordResult) return keywordResult;

    // 2️⃣ Gemini fallback
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
Map this expense to ONE category from this list:
${CATEGORIES.join(", ")}

Rules:
- Return ONLY the category name exactly as written.
- If unsure, return "Other".

Title: "${title}"
Description: "${description}"
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rawCategory = response.text().trim();

    const normalized = rawCategory.replace(/[^a-zA-Z ]/g, "").toLowerCase();

    const matched = CATEGORIES.find(
      (c) => c.toLowerCase() === normalized
    );

    return matched || "Other";

  } catch (err) {
    console.error("Gemini categorization failed:", err.message);
    return "Other";
  }
};
