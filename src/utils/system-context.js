import logMessage from "./log.js";
import fs from "fs/promises";
import path from "path";
/**
 * System Context Builder Utility
 *
 * This utility provides shared functionality for building system prompts
 * with knowledge base integration for AI clients.
 */

/**
 * Base system prompt for WhatsApp bot assistant
 */
export const BASE_SYSTEM_PROMPT =
  "Kamu adalah asisten AI yang membantu pengguna melalui WhatsApp. Jawab dengan bahasa Indonesia yang ramah, jelas, dan singkat.";

/**
 * Knowledge instructions for AI models
 */
export const KNOWLEDGE_INSTRUCTIONS = `
PANDUAN MENJAWAB PERTANYAAN:

🎯 PRIORITAS KNOWLEDGE BASE:
1. Jika pertanyaan berkaitan dengan informasi di knowledge base, jawab berdasarkan pengetahuan yang ada
2. Gunakan informasi dari knowledge base sebagai sumber utama dan paling akurat
3. Kutip atau rujuk informasi spesifik dari knowledge base jika memungkinkan

🌐 PERTANYAAN UMUM:
1. Untuk pertanyaan umum yang tidak ada di knowledge base, jawab secara normal sebagai AI
2. Tetap ramah dan helpful untuk topik umum
3. Tidak perlu menghubungkan pertanyaan umum dengan knowledge base

⚖️ KESEIMBANGAN:
- Prioritaskan knowledge base untuk topik spesifik.
- Bersifat fleksibel untuk pertanyaan umum
- Selalu jujur tentang sumber informasi

INGAT: Knowledge base untuk informasi spesifik, tapi tetap jadi asisten AI yang helpful untuk semua pertanyaan!`;

export const knowledgeBase = new Map();

export async function loadKnowledgeBase() {
  try {
    const knowledgeDir = path.join(process.cwd(), "knowledge");
    const files = await fs.readdir(knowledgeDir);

    for (const file of files) {
      if (file.endsWith(".md") || file.endsWith(".txt")) {
        const filePath = path.join(knowledgeDir, file);
        const content = await fs.readFile(filePath, "utf8");
        knowledgeBase.set(file, content);
        logMessage(`📚 Loaded knowledge: ${file}`, "KNOWLEDGE");
      }
    }

    logMessage(
      `✅ Loaded ${knowledgeBase.size} knowledge files`,
      "KNOWLEDGE"
    );
  } catch (error) {
    logMessage(`⚠️ Knowledge base not found: ${error.message}`, "KNOWLEDGE");
  }
}

export function getSystemInstructions() {
  const knowledgeContent = Array.from(knowledgeBase.entries())
    .map(([file, content]) => `Dari ${file}:\n${content}`)
    .join("\n\n");

  return `${BASE_SYSTEM_PROMPT}

${knowledgeContent}

${KNOWLEDGE_INSTRUCTIONS}
`;
}

