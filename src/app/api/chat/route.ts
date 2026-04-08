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
      "Generate HTML/CSS to present Joel's content. Use for any creative or generative request — websites, games, quizzes, interactive experiences, themed layouts, visual redesigns, or hypothetical pitches. Use this tool whenever the user wants to CREATE or BUILD anything, even if it doesn't explicitly mention a website.",
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
            "Call generate_html for any request that asks to CREATE, BUILD, MAKE, or GENERATE something — this includes websites, pages, games, quizzes, tools, interactive experiences, themed layouts, visual redesigns, or any other creative/generative output. Also use it for visual themes, aesthetics, or hypothetical pitches. When in doubt between the two tools, prefer generate_html.",
            "",
            "Call qa_response ONLY for straightforward factual questions about Joel — e.g. 'Where did Joel work?', 'What are Joel's skills?', 'Has Joel used Python?' — with no creative, generative, or build request attached.",
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
      
      // If no tool call was made, ask for clarification rather than guessing
      throw new Error("ROUTING_AMBIGUOUS")
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
  const defaultModelId = "anthropic/claude-haiku-4.5"
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
      const clarificationResult = streamText({
        model: gateway.languageModel(defaultModelId),
        system: [
          "You are joeLLM, an AI embedded on Joel Vastbinder's personal site.",
          "You help visitors do exactly two things:",
          "  1. Ask questions about Joel's background, skills, and experience.",
          "  2. Request a visual redesign of the personal site (e.g. 'Make it look like a 90s arcade game').",
          "",
          "The visitor just sent a message you couldn't route to either flow.",
          "Respond briefly and warmly. Acknowledge what they said, explain what you can help with,",
          "and invite them to try one of the two flows. Give a short example of each.",
          "Keep things light and conversational.",
        ].join("\n"),
        messages: modelMessages,
      })
      return (await clarificationResult).toUIMessageStreamResponse()
    }
    throw err
  }

  const modelId = "anthropic/claude-haiku-4.5"
  const userMessage = messageText(parsed.data.messages[parsed.data.messages.length - 1])

  const systemPrompt = buildSystemPrompt(mode)

  const tools =
    mode === "restyle"
      ? {
          generate_resume_html: {
            description: [
              "Generate a complete, self-contained HTML document that showcases Joel's professional",
              "brand and experience in the requested style or according . Create a modern personal brand",
              "website (not a traditional resume layout). CRITICAL: Due to sandbox restrictions, ALL resources",
              "must be inline - generate inline SVG graphics for icons, backgrounds, and decorative elements;",
              "use sophisticated CSS visual effects for depth and polish; use web-safe font stacks only (NO",
              "external CDN libraries, Google Fonts, or external images will load). All factual content must",
              "be accurate. Return a complete, valid HTML5 document.",
            ].join("\n"),
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
    const startTime = Date.now()
    const result = streamText({
      model: gateway.languageModel(modelId),
      system: systemPrompt,
      messages: modelMessages,
      tools,
      onFinish: () => {
        console.log('[chat]', JSON.stringify({
          ts: new Date().toISOString(),
          message: userMessage,
          intent: mode,
          durationMs: Date.now() - startTime,
        }))
      },
      prepareStep: mode === "restyle"
        ? ({ stepNumber }: { stepNumber: number }) => {
            if (stepNumber === 0) {
              return { toolChoice: { type: "tool" as const, toolName: "generate_resume_html" } }
            }
            // step 1+: default auto — model retries if it sees an error, or writes confirmation and stops
          }
        : undefined,
      stopWhen: stepCountIs(5),
    })

    return result.toUIMessageStreamResponse()
  } catch (err) {
    console.error("[API] streamText error:", err)
    throw err
  }
}

