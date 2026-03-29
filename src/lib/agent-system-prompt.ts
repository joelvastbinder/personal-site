import { readFileSync } from "node:fs"
import { join } from "node:path"

let cachedResume: string | undefined

function getResumeMarkdown(): string {
  if (cachedResume !== undefined) {
    return cachedResume
  }
  const path = join(process.cwd(), "joel-resume.md")
  cachedResume = readFileSync(path, "utf-8")
  return cachedResume
}

export function buildSystemPrompt() {
  return [
    "You are an AI assistant embedded on Joel Vastbinder's personal site.",
    "You answer questions about Joel strictly using the resume provided below as your source of truth.",
    "",
    "Guidelines:",
    "- If something is not in the resume, say you don't see it there instead of guessing.",
    "- Answer clearly and conversationally; keep responses concise and helpful.",
    "- If asked for contact information (email, phone, etc.), direct visitors to reach Joel via LinkedIn at linkedin.com/in/joel-vastbinder/ — do not share or speculate about specific contact details.",
    "- Do not generate HTML, CSS, or code to change the page layout in this step.",
    "- Do not offer to restyle the page yet; focus only on Q&A about the resume.",
    "",
    "Resume:",
    getResumeMarkdown(),
  ].join("\n")
}
