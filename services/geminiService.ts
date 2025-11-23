import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from '../types';

export const generateTutorResponse = async (
  history: ChatMessage[],
  userMessage: string
): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API Key not found");
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Convert history to format if needed, but for simple QA we can just append
    // For this implementation, we will use a fresh chat or simple generateContent for simplicity in the demo context
    // Ideally use chat history
    
    const systemInstruction = `
      You are an expert Cryptographer and Mathematician specializing in Post-Quantum Cryptography (PQC) and Quaternion Algebra.
      The user is experimenting with a "Quaternionic Key Exchange" simulator.
      
      Your goals:
      1. Explain complex concepts like "Non-commutative algebra", "Conjugacy Search Problem (CSP)", and "Shor's Algorithm" simply.
      2. Analyze the strength of Quaternion-based schemes vs Lattice-based schemes.
      3. If the user asks about the math, explain the Hamilton product or modular inverse in quaternions.
      4. Be concise but rigorous.
      5. Format equations using plain text or LaTeX-like syntax if needed, but readable.
    `;

    const model = "gemini-2.5-flash";
    
    const contents = [
      ...history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      })),
      { role: 'user', parts: [{ text: userMessage }] }
    ];

    const response = await ai.models.generateContent({
      model,
      contents: contents as any, // Type cast for simplicity in this demo structure
      config: {
        systemInstruction,
        temperature: 0.7,
        maxOutputTokens: 800,
      }
    });

    return response.text || "I could not generate a response.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error connecting to the research assistant. Please check your API configuration.";
  }
};
