// scripts/upsertEmbeddings.ts
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import pinecone from '../util/pineconeClient';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Directory containing your text files
const directoryPath = path.join(process.cwd(), 'content/documents');

// Function to read text files from the directory
const readTextFiles = async () => {
  const fileNames = fs.readdirSync(directoryPath);
  const documents = fileNames.map((fileName) => {
    const filePath = path.join(directoryPath, fileName);
    const content = fs.readFileSync(filePath, 'utf-8');
    return { fileName, content };
  });
  return documents;
};

// Function to split text into chunks
const splitTextIntoChunks = (text: string, chunkSize = 1000) => {
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
};

// Function to generate embeddings
const generateEmbedding = async (text: string) => {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return response.data[0].embedding;
};

// Function to upsert embeddings into Pinecone
const upsertEmbedding = async (id: string, vector: number[], metadata: object) => {
  const index = pinecone.Index('dev-site-rag');
  await index.upsert([
    {
      id,
      values: vector,
    },
  ]);
};

// Main function to process and upload documents
const processAndUploadDocuments = async () => {
  try {
    const documents = await readTextFiles();

    for (const { fileName, content } of documents) {
      const chunks = splitTextIntoChunks(content);

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const embedding = await generateEmbedding(chunk);
        const id = `${fileName}-${i}`;
        const metadata = { fileName, chunkIndex: i , content: chunk};

        await upsertEmbedding(id, embedding, metadata);
      }
    }
    console.log('Documents processed and uploaded successfully.');
  } catch (error) {
    console.error('Error processing documents:', error);
  }
};

processAndUploadDocuments();