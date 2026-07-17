import { NextResponse } from "next/server";

export const revalidate = 3600;

const fallbackSuggestions = ["What are your skills?", "Tell me about your projects", "What services do you offer?", "Are you available for work?", "How can I contact you?"];

// Fetches starter questions from the Python server with a local fallback.
export async function GET() {
  if (!process.env.CHATBOT_API_URL) {
    return NextResponse.json(fallbackSuggestions);
  }
  try {
    const response = await fetch(`${process.env.CHATBOT_API_URL}/api/suggestions`, {
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      return NextResponse.json(fallbackSuggestions);
    }

    return NextResponse.json(await response.json());
  } catch {
    return NextResponse.json(fallbackSuggestions);
  }
}
