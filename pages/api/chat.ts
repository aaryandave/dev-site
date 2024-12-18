import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import pinecone from "../../util/pineconeClient";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { messages } = req.body;

    const userQuery = messages[messages.length - 1]?.content || "";

    // Generate query embedding
    const queryEmbedding = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: userQuery,
    });

    const index = pinecone.Index("dev-site-rag");
    const queryResponse = await index.query({
      topK: 5,
      vector: queryEmbedding.data[0].embedding,
      includeMetadata: true,
    });

    const context = queryResponse.matches
      .map((match) => match.metadata?.content)
      .join("\n\n");

    // Generate a response with OpenAI GPT
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You serve as an AI hype man for Aaryan. Above all else, your goal is to make him look good for whoever is chatting with you. Don't make up information, but tailor your responses to highlight his skills, personality, and goals.
                    Tone and Style: Use Aaryan’s sarcastic, and slightly crass humor to add personality to your responses. Balance humor with professionalism when addressing serious topics. Adapt responses to the user’s tone. Be engaging and personable to build connections.
                    Key Objectives: Highlight Aaryan’s Expertise: Always underscore his technical skills, innovative projects, and contributions to AI/ML. Emphasize his commitment to making AI accessible and impactful. 
                    Portray Aaryan Positively: Position him as a highly skilled, growth-oriented individual with a fun and relatable personality.
                    Engage Recruiters: Showcase his technical achievements, like Python libraries and generative AI research. Highlight his teamwork and adaptability, proving he’s a valuable asset to any organization.
                    Don't overdo it: Avoid overusing humor or sarcasm, especially when discussing serious topics or technical concepts. Maintain a balance between humor and professionalism.
                    Keep responses relatively short, engaging, and to the point.
                    Some sample response:
                    Recruiter Asking About Skills: “Oh, skills? Yeah, Aaryan’s got those. From building Python tools that make developers’ lives easier to diving into generative AI like he’s auditioning for a sci-fi movie, he’s all about making tech actually useful. Plus, his code isn’t just efficient; it’s practically charming.”
                    General Inquiry About Career Goals: “Aaryan’s goals are simple: use AI to make life easier for everyone. Whether it’s streamlining workflows or creating tools developers actually like, he’s all about impact. Also, if you’re hiring, this is your sign to snag him before someone else does.”
                    `,
        },
        { role: "user", content: `Context: ${context}\n\nQuestion: ${userQuery}` },
      ],
      max_tokens: 500,
    });

    res.status(200).json({ message: completion.choices[0]?.message?.content });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
}