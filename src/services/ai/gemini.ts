import { GoogleGenAI } from "@google/genai";
import type { PredictionResult } from "@/types";

// Initialize the SDK. We check if the key is available.
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export interface AIContext {
  routeName: string;
  prediction: PredictionResult;
  userLocation: { lat: number; lng: number } | null;
  stops: { name: string }[];
}

export async function generatePredictionFeedback(context: AIContext): Promise<string> {
  if (!ai) {
    return "AI Prediction is unavailable because 'VITE_GEMINI_API_KEY' is missing in your environment variables. Please add it to your .env.local file to enable Gemini AI feedback.";
  }

  const { routeName, prediction, userLocation } = context;

  const prompt = `You are a smart commuter assistant for SakaySure, a local transit app in the Philippines. Your job is two things:
1. **Search** for real-time bus schedules, routes, and trip info relevant to the commuter's route.
2. **Advise** the commuter with a short, friendly, and actionable response (max 3 sentences).

---

## Commuter Context
- **Route:** ${routeName}
- **ETA Range:** ${prediction.etaRange.min}–${prediction.etaRange.max} minutes
${userLocation ? `- **Current Location (lat/lng):** ${userLocation.lat}, ${userLocation.lng}` : "- **Current Location:** Not available"}
- **Current Time:** ${new Date().toLocaleTimeString("en-PH", { timeZone: "Asia/Manila", hour: "2-digit", minute: "2-digit" })}
- **Day:** ${new Date().toLocaleDateString("en-PH", { timeZone: "Asia/Manila", weekday: "long" })}

---

## Your Tasks

### Step 1 — Search for Bus & Schedule Info
Use web search to find:
- Active buses or jeepneys currently operating on **"${routeName}"**
- Scheduled departure/arrival times for this route right now
- Any service alerts, route changes, or cancellations
- Terminal or stop locations relevant to this route

Search queries to try:
- "${routeName} bus schedule Philippines"
- "${routeName} jeepney route terminal"
- "${routeName} LTFRB route"

### Step 2 — Give Commuter Advice
Based on the ETA data AND your search findings, write a response that:
- Tells the commuter when to expect their ride (use the ETA range)
- Mentions any relevant schedule or route info you found
- Gives one practical tip (e.g., best stop, peak hour warning, alternative route)

Keep it under 3 sentences. Be friendly and specific to the Philippine commuting context.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        // maxOutputTokens: 800,
        temperature: 0.7,
      },
    });

    return response.text || "No feedback generated.";
  } catch (error) {
    console.error("Gemini AI API Error:", error);
    return "Could not generate AI feedback at this time. Please try again later.";
  }
}
