import { generateText } from "ai"
import { createGateway } from "@ai-sdk/gateway"

export interface ValidationResult {
  valid: boolean
  errors?: string[]
}

function stripHTMLTags(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove script tags
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "") // Remove style tags
    .replace(/<[^>]+>/g, " ") // Remove all other tags
    .replace(/&nbsp;/g, " ")
    .replace(/&[a-z]+;/gi, " ") // Decode common entities
    .replace(/\s+/g, " ")
    .trim()
}

export async function validateContentAccuracy(
  sourceMarkdown: string,
  generatedHTML: string,
  apiKey: string
): Promise<ValidationResult> {
  const htmlText = stripHTMLTags(generatedHTML)

  const validationPrompt = `You are a content validation assistant. Your job is to verify that generated HTML does NOT fabricate hard facts about experience that don't exist in the source resume.

SOURCE RESUME (markdown):
${sourceMarkdown}

GENERATED HTML (stripped of tags):
${htmlText}

CRITICAL: You are validating a THEMED/STYLED resume. The HTML will use creative language and presentation.

VALIDATION RULES - ONLY FLAG FABRICATIONS:

1. HARD FACTS (these must not be fabricated or invented):
   - Company names that cannot be traced to the source (allow minor variations like "Google Inc." → "Google")
   - Completely different job titles that misrepresent the role (allow variations like "Software Engineer" → "Engineer" → "Full Stack Engineer")
   - Dates or time periods that contradict the source (allow formatting variations)
   - Educational institutions that don't exist in the source
   - Skills or technologies that are completely unrelated and not mentioned

2. ACCEPTABLE (these are NOT fabrications):
   - Creative section titles ("Today's Specials" for Summary, "Career Menu" for Experience, etc.)
   - Thematic rephrasing ("led team" → "captained crew", "developed" → "crafted")
   - Reordering, grouping, or restructuring content
   - Omitting details (missing info is fine)
   - Adding decorative or thematic elements
   - Paraphrasing responsibilities and achievements
   - Combining or splitting information for design purposes

3. EXAMPLES OF WHAT TO FLAG:
   - "Worked at Apple" when source says "Worked at Microsoft"
   - "2020-2023" when source says "2018-2021"
   - "PhD in Computer Science" when source says "BS in Computer Science"
   - "Expert in Rust and blockchain" when source only mentions JavaScript and React

4. EXAMPLES OF WHAT NOT TO FLAG:
   - "Senior Full Stack Developer" when source says "Senior Software Engineer" (reasonable variation)
   - "Today's Specials" as a section title (creative theming)
   - "Crafted scalable APIs" when source says "Built REST APIs" (thematic rephrasing)
   - Missing minor details or bullet points (omission is OK)

Your task: Identify ONLY hard fabrications - invented companies, dates, or skills that cannot reasonably be tied back to the source. Be lenient with creative presentation.

Return your analysis as a JSON object (without markdown code fences):
{
  "valid": true/false,
  "fabricated_content": ["only list hard fabrications like invented companies/dates/skills"],
  "reasoning": "brief explanation"
}

If fabricated_content array is empty, set valid: true.
If fabricated_content has items, set valid: false.`

  try {
    const gateway = createGateway({ apiKey })
    
    const result = await generateText({
      model: gateway.languageModel("openai/gpt-4o-mini"),
      prompt: validationPrompt,
      temperature: 0,
    })

    // Strip markdown code fences if present
    let jsonText = result.text.trim()
    if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```(?:json)?\s*\n/, "").replace(/\n```\s*$/, "")
    }

    const response = JSON.parse(jsonText)

    if (!response.valid) {
      const errors: string[] = []
      
      if (response.fabricated_content?.length > 0) {
        errors.push("Hard fabrications detected (invented facts not in source):")
        errors.push(...response.fabricated_content.map((f: string) => `  - ${f}`))
      }

      if (response.reasoning) {
        errors.push(`Reasoning: ${response.reasoning}`)
      }

      return { valid: false, errors }
    }

    return { valid: true }
  } catch (err) {
    return {
      valid: false,
      errors: [
        `Content validation failed: ${err instanceof Error ? err.message : String(err)}`,
      ],
    }
  }
}
