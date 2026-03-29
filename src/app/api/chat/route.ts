import { NextRequest } from "next/server"
import { z } from "zod"
import { streamText, convertToModelMessages, type UIMessage } from "ai"
import { createGateway } from "@ai-sdk/gateway"
import { buildSystemPrompt } from "@/lib/agent-system-prompt"

const MAX_BODY_CHARS = 200_000

const chatBodySchema = z.object({
  id: z.string().optional(),
  messages: z.array(z.custom<UIMessage>()),
  trigger: z.string().optional(),
  messageId: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const modelId = process.env.VERCEL_MODEL
  const apiKey =
    process.env.AI_GATEWAY_API_KEY ?? process.env.VERCEL_AI_SDK_API_KEY

  if (!modelId) {
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

  const systemPrompt = buildSystemPrompt()
  const gateway = createGateway({ apiKey })

  const modelMessages = await convertToModelMessages(parsed.data.messages)

  const result = streamText({
    model: gateway.languageModel(modelId),
    system: systemPrompt,
    messages: modelMessages,
  })

  return result.toUIMessageStreamResponse()
}

