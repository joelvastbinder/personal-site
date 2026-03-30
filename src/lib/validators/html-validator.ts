import { parse } from "node-html-parser"

export interface ValidationResult {
  valid: boolean
  errors?: string[]
}

export function validateHTMLSyntax(html: string): ValidationResult {
  try {
    const root = parse(html)

    if (!root.querySelector("html")) {
      return { valid: false, errors: ["Missing <html> tag"] }
    }
    if (!root.querySelector("body")) {
      return { valid: false, errors: ["Missing <body> tag"] }
    }

    return { valid: true }
  } catch (err) {
    return {
      valid: false,
      errors: [`HTML parsing failed: ${err instanceof Error ? err.message : String(err)}`],
    }
  }
}
