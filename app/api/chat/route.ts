import Groq from "groq-sdk";
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // 1. Initialize Groq (Hardcode for now, or use process.env.GROQ_API_KEY)
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  try {
    const { message, history } = await req.json();

    const systemInstruction = `You are an AI screener for Cuemath. Your job is to conduct a short, friendly voice interview with a tutor candidate. 
    Assess their communication clarity, patience, and ability to simplify. 
    Start by asking them to explain fractions to a 9-year-old. 
    Keep your responses natural, conversational, and strictly under 2 sentences. 
    Handle choppy or one-word answers gracefully.`;

    // 2. Format history for Groq (it uses 'assistant' instead of 'model')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formattedHistory = history.map((turn: any) => ({
      role: turn.role === 'user' ? 'user' : 'assistant',
      content: turn.content
    }));

    // 3. Send the entire array of messages to Groq
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemInstruction },
        ...formattedHistory,
        { role: "user", content: message }
      ],
      model: "llama-3.1-8b-instant", // Meta's Llama 3 model running on Groq!
    });

    return NextResponse.json({ reply: completion.choices[0]?.message?.content });
  } catch (error) {
    console.error("Chat Error:", error);
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 });
  }
}