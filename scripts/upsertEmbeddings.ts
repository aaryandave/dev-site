import fs from "fs";
import path from "path";
import OpenAI from "openai";
import pinecone from "../util/pineconeClient";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
const directoryPath = path.join(process.cwd(), "content/documents");
const logFilePath = path.join(process.cwd(), "embedding_log.txt");

// Read and parse text files into sections
const parseTextFile = (filePath: string) => {
  const content = fs.readFileSync(filePath, "utf-8");
  const sections = content.split(/^## /gm).filter((section) => section.trim()); // Split by `##` headers
  return sections.map((section) => {
    const [title, ...body] = section.split("\n");
    return { title: title.trim(), content: body.join("\n").trim() };
  });
};

// Generate embeddings for text
const generateEmbedding = async (text: string) => {
  const response = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: text,
  });
  return response.data[0].embedding;
};

// Upsert embedding into Pinecone
const upsertEmbedding = async (id: string, vector: number[], metadata: Record<string, any>) => {
  const index = pinecone.Index("dev-site-rag");
  await index.upsert([
    {
      id,
      values: vector,
      metadata,
    },
  ]);
};

// Append section details to log file
const appendToLogFile = (fileName: string, title: string, content: string) => {
  const logEntry = `File: ${fileName}\nSection: ${title}\nContent:\n${content}\n\n`;
  fs.appendFileSync(logFilePath, logEntry);
};

// Process and upload documents to Pinecone
const processAndUploadDocuments = async () => {
  try {
    const fileNames = fs.readdirSync(directoryPath);

    // Clear the log file before appending new entries
    fs.writeFileSync(logFilePath, ""); // Clear the log file at the start

    for (const fileName of fileNames) {
      const filePath = path.join(directoryPath, fileName);
      const sections = parseTextFile(filePath);

      for (let i = 0; i < sections.length; i++) {
        const { title, content } = sections[i];

        console.log(`Processing section: "${title}" from file: "${fileName}"`);
        appendToLogFile(fileName, title, content); // Write to log file

        const embedding = await generateEmbedding(content);
        const id = `${fileName}-${i}`;
        const metadata = {
          fileName,
          section: title,
          content,
        };

        await upsertEmbedding(id, embedding, metadata);
        console.log(`Successfully upserted: "${title}"`);
      }
    }
    console.log("All documents processed, logged, and uploaded successfully.");
  } catch (error) {
    console.error("Error processing documents:", error);
  }
};

processAndUploadDocuments();