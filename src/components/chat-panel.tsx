"use client"

import { useRef, useEffect, useState, type FormEvent } from "react"
import { CornerDownLeft } from "lucide-react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import type { UIMessage } from "ai"

type Mode = "qa" | "restyle"

function messageText(message: UIMessage): string {
  return message.parts
    .filter((part): part is { type: "text"; text: string } => part.type === "text")
    .map((part) => part.text)
    .join("")
}

interface ChatPanelProps {
  onHTMLGenerated?: (html: string) => void
}

export function ChatPanel({ onHTMLGenerated }: ChatPanelProps) {
  const [mode, setMode] = useState<Mode>("qa")
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  })
  const [input, setInput] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)

  const busy = status === "submitted" || status === "streaming"

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    const lastMessage = messages[messages.length - 1]
    
    // #region agent log
    fetch('http://127.0.0.1:7456/ingest/8db02ffb-715e-4f78-a63b-00c78a95fcab',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'4c57ba'},body:JSON.stringify({sessionId:'4c57ba',location:'chat-panel.tsx:35',message:'Messages updated',data:{messageCount:messages.length,lastMessageRole:lastMessage?.role,lastMessagePartCount:lastMessage?.parts?.length},timestamp:Date.now(),hypothesisId:'H4'})}).catch(()=>{});
    // #endregion
    
    if (lastMessage?.role === "assistant") {
      for (const part of lastMessage.parts) {
        // #region agent log
        fetch('http://127.0.0.1:7456/ingest/8db02ffb-715e-4f78-a63b-00c78a95fcab',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'4c57ba'},body:JSON.stringify({sessionId:'4c57ba',location:'chat-panel.tsx:42',message:'Checking message part',data:{partType:part.type,partState:'state' in part ? part.state : 'no-state'},timestamp:Date.now(),hypothesisId:'H4'})}).catch(()=>{});
        // #endregion
        
        if (
          part.type === "tool-generate_resume_html" &&
          part.state === "output-available"
        ) {
          const result = part.output as {
            success?: boolean
            html?: string
            theme_description?: string
            error?: string
          }
          
          // #region agent log
          fetch('http://127.0.0.1:7456/ingest/8db02ffb-715e-4f78-a63b-00c78a95fcab',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'4c57ba'},body:JSON.stringify({sessionId:'4c57ba',location:'chat-panel.tsx:57',message:'Tool result found',data:{success:result.success,hasHTML:!!result.html,htmlLength:result.html?.length,hasError:!!result.error,errorPreview:result.error?.substring(0,100)},timestamp:Date.now(),hypothesisId:'H4'})}).catch(()=>{});
          // #endregion
          
          if (result.success && result.html && onHTMLGenerated) {
            // #region agent log
            fetch('http://127.0.0.1:7456/ingest/8db02ffb-715e-4f78-a63b-00c78a95fcab',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'4c57ba'},body:JSON.stringify({sessionId:'4c57ba',location:'chat-panel.tsx:64',message:'Calling onHTMLGenerated',data:{htmlLength:result.html.length},timestamp:Date.now(),hypothesisId:'H5'})}).catch(()=>{});
            // #endregion
            onHTMLGenerated(result.html)
          }
        }
      }
    }
  }, [messages, onHTMLGenerated])

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || busy) return
    
    // #region agent log
    fetch('http://127.0.0.1:7456/ingest/8db02ffb-715e-4f78-a63b-00c78a95fcab',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'4c57ba'},body:JSON.stringify({sessionId:'4c57ba',location:'chat-panel.tsx:72',message:'Sending message',data:{mode:mode,text:text.substring(0,50)},timestamp:Date.now(),hypothesisId:'H1'})}).catch(()=>{});
    // #endregion
    
    void sendMessage({ text }, { body: { mode } })
    setInput("")
  }

  const modeLabels: Record<Mode, string> = {
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
        {messages.map((msg) => (
          <div key={msg.id} className={msg.role === "user" ? "flex justify-end" : ""}>
            {msg.role === "user" ? (
              <p
                className="text-xs leading-relaxed px-3 py-2"
                style={{
                  background: "var(--ide-user-bubble)",
                  color: "var(--ide-user-bubble-text)",
                  borderRadius: "12px 12px 2px 12px",
                  maxWidth: "80%",
                }}
              >
                {messageText(msg)}
              </p>
            ) : (
              <div
                className="rounded text-xs leading-relaxed whitespace-pre-line px-3 py-2"
                style={{
                  background: "var(--ide-agent-bg)",
                  color: "var(--ide-text)",
                }}
              >
                <span
                  className="block text-xs mb-1 select-none"
                  style={{ color: "var(--ide-accent)" }}
                >
                  joelLM
                </span>
                {messageText(msg)}
              </div>
            )}
          </div>
        ))}
        {busy && (
          <div
            className="rounded text-xs leading-relaxed px-3 py-2"
            style={{
              background: "var(--ide-agent-bg)",
              color: "var(--ide-text)",
            }}
          >
            <span
              className="block text-xs mb-1 select-none"
              style={{ color: "var(--ide-accent)" }}
            >
              joelLM
            </span>
            Thinking…
          </div>
        )}
        {error && (
          <div
            className="pl-3 text-xs leading-relaxed"
            style={{ color: "var(--ide-accent)" }}
          >
            Something went wrong. Please try again.
          </div>
        )}
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
          {(["qa", "restyle"] as Mode[]).map((m) => (
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
        <form
          className="flex items-center gap-2 px-3 py-2"
          onSubmit={handleFormSubmit}
        >
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
            placeholder="Ask about Joel or request a restyle…"
            aria-label="Chat input"
            className="flex-1 bg-transparent text-xs outline-none"
            style={{
              color: "var(--ide-text)",
              caretColor: "var(--ide-accent)",
            }}
          />
          <button
            type="submit"
            disabled={busy}
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
        </form>
      </div>
    </div>
  )
}
