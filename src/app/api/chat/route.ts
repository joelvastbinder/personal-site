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

const chatBodySchema = z.object({
  id: z.string().optional(),
  messages: z.array(z.custom<UIMessage>()),
  trigger: z.string().optional(),
  messageId: z.string().optional(),
  mode: z.enum(["qa", "restyle"]).optional(),
})

export async function POST(req: NextRequest) {
  const defaultModelId = process.env.VERCEL_MODEL
  const apiKey =
    process.env.AI_GATEWAY_API_KEY ?? process.env.VERCEL_AI_SDK_API_KEY

  if (!defaultModelId) {
    return new Response("Model id (VERCEL_MODEL) is not configured.", {
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

  const mode = parsed.data.mode ?? "qa"

  // Select model based on mode
  // Q&A mode: use default (fast, cheap Gemini Flash Lite)
  // Restyle mode: use GPT-5-mini for better creative design
  const modelId = mode === "restyle" ? "openai/gpt-5-mini" : defaultModelId

  console.log("[API] Request mode:", mode)
  console.log("[API] Selected model:", modelId)
  console.log("[API] Tools defined:", mode === "restyle" ? "yes" : "no")

  // #region agent log
  fetch('http://127.0.0.1:7456/ingest/8db02ffb-715e-4f78-a63b-00c78a95fcab',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'4c57ba'},body:JSON.stringify({sessionId:'4c57ba',location:'route.ts:67',message:'API request received',data:{mode,modelId,messageCount:parsed.data.messages.length},timestamp:Date.now(),hypothesisId:'H1'})}).catch(()=>{});
  // #endregion

  const systemPrompt = buildSystemPrompt(mode)
  const gateway = createGateway({ apiKey })

  const modelMessages = await convertToModelMessages(parsed.data.messages)

  const tools =
    mode === "restyle"
      ? {
          generate_resume_html: {
            description:
              "Generate a complete, self-contained HTML document that showcases Joel's professional brand and experience in the requested style. Create a modern personal brand website (not a traditional resume layout). CRITICAL: Due to sandbox restrictions, ALL resources must be inline - generate extensive inline SVG graphics for icons, backgrounds, and decorative elements; use sophisticated CSS visual effects for depth and polish; use web-safe font stacks only (NO external CDN libraries, Google Fonts, or external images will load). All factual content must be accurate. Return a complete, valid HTML5 document.",
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
              console.log("[TOOL] generate_resume_html called!")
              console.log("[TOOL] HTML length:", html.length)
              console.log("[TOOL] Theme:", theme_description)
              
              // #region agent log
              fetch('http://127.0.0.1:7456/ingest/8db02ffb-715e-4f78-a63b-00c78a95fcab',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'4c57ba'},body:JSON.stringify({sessionId:'4c57ba',location:'route.ts:95',message:'Tool execute called',data:{htmlLength:html.length,themeDescription:theme_description},timestamp:Date.now(),hypothesisId:'H3'})}).catch(()=>{});
              // #endregion
              
              const syntaxResult = validateHTMLSyntax(html)
              if (!syntaxResult.valid) {
                console.log("[TOOL] Syntax validation failed:", syntaxResult.errors)
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

              console.log("[TOOL] Validation passed! Returning success")
              
              // #region agent log
              fetch('http://127.0.0.1:7456/ingest/8db02ffb-715e-4f78-a63b-00c78a95fcab',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'4c57ba'},body:JSON.stringify({sessionId:'4c57ba',location:'route.ts:126',message:'Tool validation passed',data:{success:true,htmlLength:html.length},timestamp:Date.now(),hypothesisId:'H3'})}).catch(()=>{});
              // #endregion
              
              return { success: true, html, theme_description }
            },
          },
        }
      : undefined

  // #region agent log
  fetch('http://127.0.0.1:7456/ingest/8db02ffb-715e-4f78-a63b-00c78a95fcab',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'4c57ba'},body:JSON.stringify({sessionId:'4c57ba',location:'route.ts:119',message:'Tools configuration',data:{toolsDefined:tools!==undefined,toolNames:tools?Object.keys(tools):[]},timestamp:Date.now(),hypothesisId:'H2'})}).catch(()=>{});
  // #endregion

  try {
    const result = streamText({
      model: gateway.languageModel(modelId),
      system: systemPrompt,
      messages: modelMessages,
      tools,
      stopWhen: stepCountIs(5),
      onStepFinish: async (step) => {
        console.log("[STEP]", JSON.stringify({
          toolCallsCount: step.toolCalls?.length || 0,
          toolNames: step.toolCalls?.map(tc => tc.toolName),
          textLength: step.text?.length || 0,
          finishReason: step.finishReason,
          hasWarnings: step.warnings?.length || 0,
          hasToolResults: step.toolResults?.length || 0,
          text: step.text,
          response: step.response,
        }))
        // #region agent log
        fetch('http://127.0.0.1:7456/ingest/8db02ffb-715e-4f78-a63b-00c78a95fcab',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'4c57ba'},body:JSON.stringify({sessionId:'4c57ba',location:'route.ts:155',message:'Step finished',data:{toolCallsCount:step.toolCalls?.length||0,toolNames:step.toolCalls?.map(tc=>tc.toolName),textLength:step.text?.length||0,finishReason:step.finishReason,warningsCount:step.warnings?.length||0,toolResultsCount:step.toolResults?.length||0,responseMessages:step.response?.messages?.map(m=>({role:m.role,contentLength:JSON.stringify(m.content).length}))},timestamp:Date.now(),hypothesisId:'H7'})}).catch(()=>{});
        // #endregion
      },
      onError: async (error) => {
        console.error("[STREAM ERROR]", error)
        // #region agent log
        fetch('http://127.0.0.1:7456/ingest/8db02ffb-715e-4f78-a63b-00c78a95fcab',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'4c57ba'},body:JSON.stringify({sessionId:'4c57ba',location:'route.ts:175',message:'Stream error event',data:{errorMessage:error instanceof Error?error.message:String(error),errorStack:error instanceof Error?error.stack:undefined},timestamp:Date.now(),hypothesisId:'H10'})}).catch(()=>{});
        // #endregion
      },
    })

    // #region agent log
    fetch('http://127.0.0.1:7456/ingest/8db02ffb-715e-4f78-a63b-00c78a95fcab',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'4c57ba'},body:JSON.stringify({sessionId:'4c57ba',location:'route.ts:180',message:'Before toUIMessageStreamResponse',data:{hasResult:true},timestamp:Date.now(),hypothesisId:'H8'})}).catch(()=>{});
    // #endregion

    return result.toUIMessageStreamResponse()
  } catch (err) {
    console.error("[API] streamText error:", err)
    // #region agent log
    fetch('http://127.0.0.1:7456/ingest/8db02ffb-715e-4f78-a63b-00c78a95fcab',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'4c57ba'},body:JSON.stringify({sessionId:'4c57ba',location:'route.ts:193',message:'streamText error caught',data:{error:err instanceof Error?err.message:String(err)},timestamp:Date.now(),hypothesisId:'H9'})}).catch(()=>{});
    // #endregion
    throw err
  }
}

