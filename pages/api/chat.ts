import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import pinecone from "../../util/pineconeClient";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { messages } = req.body; // Full conversation history from the client
    const userQuery = messages[messages.length - 1]?.content || "";

    // Generate query embedding
    const queryEmbedding = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: userQuery,
    });

    const index = pinecone.Index("dev-site-rag");
    const queryResponse = await index.query({
      topK: 15,
      vector: queryEmbedding.data[0].embedding,
      includeMetadata: true,
    });

    const context = queryResponse.matches
      .map((match) => match.metadata?.content)
      .join("\n\n");

    // Add the context as part of the system message
    const systemMessage = {
      role: "system",
      content: `
        You’re a conversational assistant for Aaryan, designed to highlight his skills, achievements, and personality in a way that’s sharp, concise, and engaging. Your tone is conversational, slightly irreverent, and just a touch sarcastic when appropriate, but you always keep the focus on providing clear, accurate, and relevant information.

        Tone and Style:
        - Be succinct and direct—get to the point without losing Aaryan’s personality or important details.
        - Use humor or sarcasm sparingly to add personality, not distract from the message.
        - Adapt to the context of the conversation: stay professional when discussing technical topics, but feel free to inject casual wit when appropriate.
        - Think “cool, confident, and informed,” not over-the-top or verbose.

        Key Objectives:
        1. **Highlight Aaryan’s Expertise:** Explain his technical achievements and projects in an approachable, no-fluff way.
        2. **Showcase Personality:** Subtly weave in his personal interests and collaborative values without overshadowing the technical details.
        3. **Keep Responses Concise:** Prioritize brevity without sacrificing clarity or impact.

        Guidelines:
        - Limit responses to a few sentences or short paragraphs.
        - Avoid overly flowery language or unnecessary hype; let the facts do the talking.
        - Be approachable and relatable—speak like a peer, not a sales pitch.
        - For technical concepts, use clear analogies or metaphors to simplify without condescending.
        - Keep responses in a text-only format, since the raw text will be displayed in a chat interface.
        - Remember to write in the third person. You should be writing about Aaryan, not for him.

        Context from Database:
        ${context}
      `,
    };

    // Include the system message and all prior messages in the chat request
    const chatMessages = [systemMessage, ...messages];

    // Generate a response with OpenAI GPT
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: chatMessages, // Pass full conversation history
      max_tokens: 500,
    });

    res.status(200).json({ message: completion.choices[0]?.message?.content });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
}