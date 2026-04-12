import Groq from "groq-sdk";
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // 1. PASTE YOUR GROQ KEY HERE
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  try {
    const { transcript } = await req.json();

    // 2. FALLBACK: If the user clicked evaluate without talking
    if (!transcript || transcript.trim() === "") {
        return NextResponse.json({
            evaluation: {
                clarityScore: 0,
                warmthScore: 0,
                overallFeedback: "No interview transcript was detected. Please tap the microphone and speak with the AI before evaluating.",
                evidenceQuotes: []
            }
        });
    }

    const systemPrompt = `You are a STRICT, objective, and highly critical senior hiring manager for an ed-tech company. Your job is to evaluate a raw transcript of an AI screening interview.
    
    CRITICAL RULES:
    1. NO HALLUCINATIONS: Every single string inside the 'evidenceQuotes' array MUST be copied word-for-word exactly as it appears in the transcript. Do not invent quotes.
    2. STRICT GRADING: A score of 10 is almost impossible. An average, acceptable answer is a 5.
    3. You must respond ONLY with a valid JSON object.`;

    const userPrompt = `Evaluate this interview transcript: \n\n[START TRANSCRIPT]\n${transcript}\n[END TRANSCRIPT]\n\n
    Output strictly in this JSON format:
    {
      "clarityScore": 5,
      "warmthScore": 5,
      "overallFeedback": "Critical feedback here...",
      "evidenceQuotes": ["Exact quote 1"]
    }`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      model: "llama-3.1-8b-instant",
      response_format: { type: "json_object" },
      temperature: 0.1, 
    });

    let responseText = completion.choices[0]?.message?.content || "{}";
    
    // 3. THE FIX: Strip out annoying markdown blocks if the AI hallucinated them
    responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    return NextResponse.json({ evaluation: JSON.parse(responseText) });
    
  } catch (error) {
    // 4. PRINT THE REAL ERROR TO THE TERMINAL
    console.error("🚨 EVAL ERROR:", error);
    return NextResponse.json({ error: "Failed to evaluate" }, { status: 500 });
  }
}