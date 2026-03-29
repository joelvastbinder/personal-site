"use client"

import { useState, useRef, useEffect } from "react"
import { CornerDownLeft } from "lucide-react"

type Mode = "auto" | "qa" | "restyle"

interface Message {
  role: "user" | "agent"
  content: string
}

const MOCK_MESSAGES: Message[] = [
  {
    role: "user",
    content: "What cloud platforms has Joel worked with?",
  },
  {
    role: "agent",
    content:
      "Joel has hands-on experience across all three major cloud providers.\n\nOn AWS he has worked with EC2, Lambda, S3, RDS, and EKS. At Vercel he owned the deploy infrastructure spanning AWS, GCP (Cloud Run, BigQuery), and Azure (AKS). His Stripe work also involved cloud-native data pipelines running on managed Kafka and Redshift clusters.",
  },
  {
    role: "user",
    content: "Can you restyle the resume to look like a dark-mode code editor?",
  },
  {
    role: "agent",
    content:
      "Sure — switching to Restyle mode.\n\nI'll apply a dark-mode editor theme to the resume preview: dark background, syntax-highlighted section headers, monospace type, and a subtle accent border on each entry. Give me a moment to render that.",
  },
]

export function ChatPanel() {
  const [messages] = useState<Message[]>(MOCK_MESSAGES)
  const [input, setInput] = useState("")
  const [mode, setMode] = useState<Mode>("auto")
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return
    setInput("")
    // Static shell — no-op for now
  }

  const modeLabels: Record<Mode, string> = {
    auto: "Auto",
    qa: "Q&A",
    restyle: "Restyle",
  }

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: "var(--ide-panel)" }}
    >
      {/* Panel title bar */}
      <div
        className="flex items-center px-3 shrink-0"
        style={{
          height: "36px",
          borderBottom: "2px solid var(--ide-border)",
          background: "var(--ide-panel)",
        }}
      >
        <span
          className="text-xs tracking-widest uppercase"
          style={{ color: "var(--ide-text-muted)", fontVariant: "small-caps" }}
        >
          joelLM
        </span>
      </div>

      {/* Message history */}
      <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-4">
        {messages.map((msg, i) => (
          <div key={i}>
            {msg.role === "user" ? (
              <div className="flex gap-2">
                <span
                  className="shrink-0 text-xs mt-0.5 select-none"
                  style={{ color: "var(--ide-accent)" }}
                  aria-hidden="true"
                >
                  &gt;
                </span>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: "var(--ide-text)" }}
                >
                  {msg.content}
                </p>
              </div>
            ) : (
              <div
                className="pl-3 text-xs leading-relaxed whitespace-pre-line"
                style={{
                  borderLeft: `2px solid var(--ide-border)`,
                  color: "var(--ide-text-muted)",
                }}
              >
                {msg.content}
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div
        className="shrink-0"
        style={{ borderTop: "2px solid var(--ide-border)" }}
      >
        {/* Mode selector row */}
        <div
          className="flex items-center gap-1 px-3 py-1.5"
          style={{ borderBottom: "1px solid var(--ide-border)" }}
        >
          <span
            className="text-xs mr-1"
            style={{ color: "var(--ide-text-muted)" }}
          >
            mode:
          </span>
          {(["auto", "qa", "restyle"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className="px-2 py-0.5 text-xs rounded"
              style={{
                background:
                  mode === m ? "var(--ide-accent)" : "var(--ide-send-bg)",
                color: mode === m ? "#ffffff" : "var(--ide-text-muted)",
                border: `1px solid ${mode === m ? "var(--ide-accent)" : "var(--ide-border)"}`,
                transition: "background 0.1s, color 0.1s",
              }}
            >
              {modeLabels[m]}
            </button>
          ))}
        </div>

        {/* Prompt line */}
        <div className="flex items-center gap-2 px-3 py-2">
          <span
            className="text-xs shrink-0 select-none"
            style={{ color: "var(--ide-accent)" }}
            aria-hidden="true"
          >
            &gt;
          </span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about Joel or request a restyle…"
            aria-label="Chat input"
            className="flex-1 bg-transparent text-xs outline-none"
            style={{
              color: "var(--ide-text)",
              caretColor: "var(--ide-accent)",
            }}
          />
          <button
            onClick={handleSend}
            aria-label="Send message"
            className="flex items-center justify-center w-6 h-6 rounded shrink-0"
            style={{
              background: "var(--ide-send-bg)",
              border: "1px solid var(--ide-border)",
              color: "var(--ide-text-muted)",
            }}
          >
            <CornerDownLeft size={12} />
          </button>
        </div>
      </div>
    </div>
  )
}
