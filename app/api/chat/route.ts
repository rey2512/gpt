import { google } from "@ai-sdk/google";
import { streamText } from "ai";

export const maxDuration = 30;
export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    // Safety check for empty messages array
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Invalid messages format" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    // Check if the user is asking who made KIITGPT
    const lastMessage = messages[messages.length - 1];
    if (
      lastMessage && 
      lastMessage.role === 'user' && 
      lastMessage.content && 
      typeof lastMessage.content === 'string' &&
      (
        lastMessage.content.toLowerCase().includes('who made you') ||
        lastMessage.content.toLowerCase().includes('who created you') ||
        lastMessage.content.toLowerCase().includes('who developed you') ||
        lastMessage.content.toLowerCase().includes('who built you') ||
        lastMessage.content.toLowerCase().includes('who is your creator') ||
        lastMessage.content.toLowerCase().includes('who is your developer') ||
        lastMessage.content.toLowerCase().includes('who makes you')
      )
    ) {
      // Create a custom stream for the response
      const encoder = new TextEncoder();
      const customResponse = "I am KIITGPT, developed by Prasenjeet Singh.";
      
      const stream = new ReadableStream({
        async start(controller) {
          try {
            // Simulate streaming by sending the response character by character
            for (let i = 0; i < customResponse.length; i++) {
              const char = customResponse[i];
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: char, done: false })}\n\n`));
              // Add a small delay to simulate typing
              await new Promise(resolve => setTimeout(resolve, 20));
            }
            
            // Send the done event
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: "", done: true })}\n\n`));
            controller.close();
          } catch (error) {
            controller.error(error);
          }
        }
      });
      
      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });
    }
    
    // Otherwise, use the normal AI model
    try {
      const result = await streamText({
        model: google("gemini-2.0-flash"),
        messages,
        temperature: 0.7,
      });
      
      return result.toDataStreamResponse();
    } catch (aiError) {
      console.error("AI model error:", aiError);
      
      // Create a fallback response if the AI model fails
      const encoder = new TextEncoder();
      const fallbackResponse = "I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again later.";
      
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: fallbackResponse, done: false })}\n\n`));
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: "", done: true })}\n\n`));
          controller.close();
        }
      });
      
      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });
    }
  } catch (error) {
    console.error("Chat API error:", error);
    
    // Return a friendly error response
    return new Response(
      JSON.stringify({ 
        error: "Something went wrong processing your request. Please try again." 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}