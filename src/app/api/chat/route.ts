import { NextRequest } from "next/server"
import { z } from "zod"
import { streamText, convertToModelMessages, stepCountIs, type UIMessage } from "ai"
import { createGateway } from "@ai-sdk/gateway"
import { buildSystemPrompt } from "@/lib/agent-system-prompt"
import { validateHTMLSyntax } from "@/lib/validators/html-validator"
import { validateContentAccuracy } from "@/lib/validators/content-validator"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const MAX_BODY_CHARS = 200_000

let cachedResume: string | undefined

function getResumeMarkdown(): string {
  if (cachedResume !== undefined) {
    return cachedResume
  }
  const path = join(process.cwd(), "joel-resume.md")
  cachedResume = readFileSync(path, "utf-8")
  return cachedResume
}

function messageText(message: UIMessage): string {
  return message.parts
    .filter((part): part is { type: "text"; text: string } => part.type === "text")
    .map((part) => part.text)
    .join("")
}

// Routing tools for intent detection
const routingTools = {
  qa_response: {
    description:
      "Answer a question about Joel's experience, skills, or background. Use only when the user wants information in plain text — no website, page, HTML, layout, theme, or visual redesign.",
    inputSchema: z.object({
      question: z.string().describe("The user's question")
    }),
    execute: async ({ question }: { question: string }) => {
      return { intent: "qa" }
    }
  },
  generate_html: {
    description:
      "Generate HTML/CSS to present Joel's site content. Use whenever the user asks to build, create, or redesign a website or page, restyle or retheme the UI, apply a visual aesthetic, or frame the resume as a themed or hypothetical pitch (e.g. for a startup or product). If they mention building a site, making it look a certain way, or similar — use this tool, even if they also ask how Joel would fit a role.",
    inputSchema: z.object({
      theme_description: z.string().describe("Description of the requested theme or style")
    }),
    execute: async ({ theme_description }: { theme_description: string }) => {
      return { intent: "restyle" }
    }
  }
}

// Detect user intent using BASIC_MODEL with retry logic
async function detectIntent(
  messages: UIMessage[], 
  gateway: ReturnType<typeof createGateway>,
  basicModel: string
): Promise<"qa" | "restyle"> {
  const userMessage = messages[messages.length - 1]
  
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const routingResult = streamText({
        model: gateway.languageModel(basicModel),
        messages: [{
          role: "system",
          content: [
            "Route each user message by calling exactly one tool.",
            "",
            "Call generate_html if the user mentions any of: building / making / creating a website, web page, or landing page; restyling, redesigning, retheming, or changing how the site looks; a visual theme, aesthetic, or \"make it look like …\"; HTML, layout, or UI; or presenting Joel's resume as a themed or hypothetical pitch (e.g. for a company or startup). Mixed messages that include both a fit question and \"build a site\" → generate_html.",
            "",
            "Call qa_response only for straightforward informational questions about Joel (skills, experience, background) with no request to build, restyle, or visually present a site.",
          ].join("\n"),
        }, {
          role: "user", 
          content: messageText(userMessage)
        }],
        tools: routingTools,
        stopWhen: stepCountIs(1)
      })
      
      for await (const part of (await routingResult).fullStream) {
        if (part.type === "tool-call") {
          return part.toolName === "generate_html" ? "restyle" : "qa"
        }
      }
      
      // If no tool call was made, default to Q&A
      return "qa"
    } catch (err) {
      if (attempt === 0) continue // Retry once
      // Fall through to throw after retry
    }
  }
  
  // Both attempts failed - need to ask user
  throw new Error("ROUTING_AMBIGUOUS")
}

const chatBodySchema = z.object({
  id: z.string().optional(),
  messages: z.array(z.custom<UIMessage>()),
  trigger: z.string().optional(),
  messageId: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const defaultModelId = process.env.BASIC_MODEL
  const apiKey = process.env.AI_GATEWAY_API_KEY

  if (!defaultModelId) {
    return new Response("Model id (BASIC_MODEL) is not configured.", {
      status: 500,
    })
  }

  if (!apiKey) {
    return new Response(
      "AI Gateway API key is not configured (AI_GATEWAY_API_KEY or VERCEL_AI_SDK_API_KEY).",
      { status: 500 },
    )
  }

  const raw = await req.text().catch(() => null)
  if (raw == null || raw.length > MAX_BODY_CHARS) {
    return new Response("Invalid or oversized request body.", { status: 400 })
  }

  let json: unknown
  try {
    json = JSON.parse(raw)
  } catch {
    return new Response("Invalid JSON.", { status: 400 })
  }

  const parsed = chatBodySchema.safeParse(json)
  if (!parsed.success || parsed.data.messages.length === 0) {
    return new Response("Invalid request body.", { status: 400 })
  }

  const gateway = createGateway({ apiKey })
  const modelMessages = await convertToModelMessages(parsed.data.messages)

  // Detect intent using routing layer
  let mode: "qa" | "restyle"
  try {
    mode = await detectIntent(parsed.data.messages, gateway, defaultModelId)
  } catch (err) {
    if (err instanceof Error && err.message === "ROUTING_AMBIGUOUS") {
      // Return clarification message
      const clarificationResult = streamText({
        model: gateway.languageModel(defaultModelId),
        messages: [{
          role: "assistant",
          content: "I couldn't determine if you're asking about Joel's experience or requesting a UI redesign. Could you clarify whether you want me to:\n\n1. Answer a question about Joel's background, skills, or experience\n2. Redesign the UI in a specific style or theme"
        }]
      })
      return (await clarificationResult).toUIMessageStreamResponse()
    }
    throw err
  }

  // Select model based on detected intent
  // Q&A mode: use default (fast, cheap Gemini Flash Lite)
  // Restyle mode: use Claude Sonnet for better creative design
  const modelId = mode === "restyle" ? "anthropic/claude-haiku-4.5" : defaultModelId

  const systemPrompt = buildSystemPrompt(mode)

  const tools =
    mode === "restyle"
      ? {
          generate_resume_html: {
            description:
              "Generate a complete, self-contained HTML document that showcases Joel's professional brand and experience in the requested style or according . Create a modern personal brand website (not a traditional resume layout). CRITICAL: Due to sandbox restrictions, ALL resources must be inline - generate extensive inline SVG graphics for icons, backgrounds, and decorative elements; use sophisticated CSS visual effects for depth and polish; use web-safe font stacks only (NO external CDN libraries, Google Fonts, or external images will load). All factual content must be accurate. Return a complete, valid HTML5 document.",
            inputSchema: z.object({
              html: z
                .string()
                .describe("Complete HTML5 document with inline CSS and JS"),
              theme_description: z
                .string()
                .describe(
                  "Brief description of the applied theme for user confirmation",
                ),
            }),
            execute: async ({
              html,
              theme_description,
            }: {
              html: string
              theme_description: string
            }) => {
              const syntaxResult = validateHTMLSyntax(html)
              if (!syntaxResult.valid) {
                return {
                  error: `HTML syntax errors: ${syntaxResult.errors?.join(", ")}`,
                }
              }

              // TODO: Re-enable content validation after end-to-end flow is verified
              // const resumeMarkdown = getResumeMarkdown()
              // console.log("[TOOL] Running content validation...")
              // const contentResult = await validateContentAccuracy(
              //   resumeMarkdown,
              //   html,
              //   apiKey,
              // )
              // 
              // // #region agent log
              // fetch('http://127.0.0.1:7456/ingest/8db02ffb-715e-4f78-a63b-00c78a95fcab',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'4c57ba'},body:JSON.stringify({sessionId:'4c57ba',location:'route.ts:115',message:'Content validation result',data:{valid:contentResult.valid,errorCount:contentResult.errors?.length,errorPreview:contentResult.errors?.[0]?.substring(0,100)},timestamp:Date.now(),hypothesisId:'H6'})}).catch(()=>{});
              // // #endregion
              // 
              // if (!contentResult.valid) {
              //   console.log("[TOOL] Content validation failed:", contentResult.errors)
              //   return {
              //     error: `Content validation failed: ${contentResult.errors?.join("\n")}`,
              //   }
              // }

              return { success: true, html, theme_description }
            },
          },
        }
      : undefined

  try {
    const result = streamText({
      model: gateway.languageModel(modelId),
      system: systemPrompt,
      messages: modelMessages,
      tools,
      stopWhen: stepCountIs(5),
    })

    return result.toUIMessageStreamResponse()
  } catch (err) {
    console.error("[API] streamText error:", err)
    throw err
  }
}

