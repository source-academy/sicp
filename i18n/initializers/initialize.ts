import fs from "fs";
import OpenAI from "openai/index.mjs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default async function createAssistant(language: string, ai: OpenAI) {
  const assistant = await ai.beta.assistants.create({
    name: "SICP Translator",
    instructions: `You are a professional translator with high technical skills in computer science.
                You MUST adhere to the following rules strictly:
                1. ALWAYS use the exact translations for technical terms found in the uploaded reference file.
                2. If a term appears in the reference file, you MUST use the provided translation without exception.
                3. Preserve all XML tags and structure exactly as given.
                4. Do not add any additional information or explanatory notes.
                5. When translating, search the reference file first for any technical terms before translating them.
                6. Do not format your response using markdown or any other formatting.`,
    model: process.env.AI_MODEL as string,
    tools: [{ type: "file_search" }]
  });

  const fileStreams = [
    path.resolve(__dirname, "../../dictionary/cn.txt")
  ].map(path => fs.createReadStream(path));

  // Create a vector store including our two files.
  const vectorStore = await ai.vectorStores.create({
    name: "Translation instructions"
  });

  await ai.vectorStores.fileBatches.uploadAndPoll(vectorStore.id, {
    files: fileStreams
  });

  await ai.beta.assistants.update(assistant.id, {
    tool_resources: { file_search: { vector_store_ids: [vectorStore.id] } }
  });

  const updatedAssistant = await ai.beta.assistants.retrieve(assistant.id);
  return updatedAssistant;
}
