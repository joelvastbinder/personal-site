"use client"

import React, { useRef, useEffect, useState, type FormEvent } from "react"
import { CornerDownLeft, X } from "lucide-react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import type { UIMessage } from "ai"
import ReactMarkdown from "react-markdown"
import { FloatingChatWidget } from "./floating-chat-widget"

function messageText(message: UIMessage): string {
  return message.parts
    .filter((part): part is { type: "text"; text: string } => part.type === "text")
    .map((part) => part.text)
    .join("")
}

interface ChatPanelProps {
  onHTMLGenerated?: (html: string) => void
}

const WELCOME_MESSAGE = {
  id: "welcome",
  role: "assistant" as const,
  content: [
    "Hi! I'm here to help you explore Joel's work and redesign this site in real-time.",
    "",
    "You can:",
    "• Ask questions about Joel's projects, skills, and experience",
    "• Request a UI redesign based on a theme  or a different way to present Joel's experience. e.g., \"Create a trivia game to teach me more Joel's experience\" or \"Style it like an 80s terminal.\"",
    "",
    "Get as creative as you want! I'm here to help."
  ].join("\n"),
}

function MarkdownMessage({ children }: { children: string }) {
  return (
    <ReactMarkdown
      components={{
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        strong: ({ children }) => <strong className="font-semibold" style={{ color: "var(--ide-text)" }}>{children}</strong>,
        em: ({ children }) => <em className="italic">{children}</em>,
        h1: ({ children }) => <h1 className="font-bold text-sm mb-1 mt-2 first:mt-0" style={{ color: "var(--ide-text)" }}>{children}</h1>,
        h2: ({ children }) => <h2 className="font-semibold text-xs mb-1 mt-2 first:mt-0" style={{ color: "var(--ide-text)" }}>{children}</h2>,
        h3: ({ children }) => <h3 className="font-semibold text-xs mb-1 mt-2 first:mt-0" style={{ color: "var(--ide-text)" }}>{children}</h3>,
        ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-0.5">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-0.5">{children}</ol>,
        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
        code: ({ children }) => <code className="px-1 rounded text-[11px]" style={{ background: "var(--ide-border)", color: "var(--ide-accent)" }}>{children}</code>,
        a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "var(--ide-accent)" }}>{children}</a>,
      }}
    >
      {children}
    </ReactMarkdown>
  )
}

export function ChatPanel({ onHTMLGenerated }: ChatPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  })
  const [input, setInput] = useState("")
  const [thinkingElapsed, setThinkingElapsed] = useState(0)
  const [dotCount, setDotCount] = useState(1)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const busy = status === "submitted" || status === "streaming"
  const lastMsg = messages[messages.length - 1]
  const isGeneratingHTML = busy &&
    lastMsg?.role === "assistant" &&
    lastMsg.parts.some(p => p.type === "tool-generate_resume_html")

  // Initialize collapse state from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('chat-collapsed')
    const isMobile = window.innerWidth < 768
    
    if (stored !== null) {
      setIsCollapsed(stored === 'true')
    } else {
      // Default: open on desktop, collapsed on mobile
      setIsCollapsed(isMobile)
    }
  }, [])

  // Sync collapse state to localStorage
  useEffect(() => {
    localStorage.setItem('chat-collapsed', isCollapsed.toString())
    // Emit custom event for same-window updates
    window.dispatchEvent(new Event('chat-collapsed-changed'))
  }, [isCollapsed])

  useEffect(() => {
    if (busy) {
      const interval = setInterval(() => {
        setThinkingElapsed(prev => prev + 1)
        setDotCount(prev => prev === 3 ? 1 : prev + 1)
      }, 1000)
      
      return () => clearInterval(interval)
    } else {
      setThinkingElapsed(0)
      setDotCount(1)
    }
  }, [busy])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    const lastMessage = messages[messages.length - 1]
    
    if (lastMessage?.role === "assistant") {
      for (const part of lastMessage.parts) {
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
          
          if (result.success && result.html && onHTMLGenerated) {
            onHTMLGenerated(result.html)
          }
        }
      }
    }
  }, [messages, onHTMLGenerated])

  const adjustHeight = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${el.scrollHeight}px`
  }

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || busy) return
    
    void sendMessage({ text })
    setInput("")
    if (textareaRef.current) {
      textareaRef.current.style.height = ""
    }
  }

  // If collapsed, show floating widget
  if (isCollapsed) {
    return <FloatingChatWidget onClick={() => setIsCollapsed(false)} />
  }

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: "var(--ide-panel)" }}
    >
      {/* Panel title bar */}
      <div
        className="flex items-center justify-between px-3 shrink-0"
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
        <button
          onClick={() => setIsCollapsed(true)}
          aria-label="Close chat"
          className="flex items-center justify-center w-6 h-6 rounded transition-colors"
          style={{
            color: "var(--ide-text)",
            border: "1.5px solid var(--ide-text-muted)",
            background: "var(--ide-send-bg)",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--ide-accent)"
            ;(e.currentTarget as HTMLButtonElement).style.color = "var(--ide-accent)"
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--ide-text-muted)"
            ;(e.currentTarget as HTMLButtonElement).style.color = "var(--ide-text)"
          }}
        >
          <X size={14} strokeWidth={2.5} />
        </button>
      </div>

      {/* Message history */}
      <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-4">
        {/* Welcome message (not sent to AI) */}
        <div>
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
            <MarkdownMessage>{WELCOME_MESSAGE.content}</MarkdownMessage>
          </div>
        </div>
        
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
              messageText(msg) ? (
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
                  <MarkdownMessage>{messageText(msg)}</MarkdownMessage>
                </div>
              ) : null
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
            {isGeneratingHTML
              ? `Generating redesign (should take about a minute)${".".repeat(dotCount)} ${thinkingElapsed}s`
              : `Thinking${".".repeat(dotCount)} ${thinkingElapsed}s`}
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
        {/* Prompt line */}
        <form
          className="flex items-end gap-2 px-3 py-2"
          onSubmit={handleFormSubmit}
        >
          <span
            className="text-xs shrink-0 select-none pb-0.5"
            style={{ color: "var(--ide-accent)" }}
            aria-hidden="true"
          >
            &gt;
          </span>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              adjustHeight()
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleFormSubmit(e as unknown as React.FormEvent<HTMLFormElement>)
              }
            }}
            disabled={busy}
            placeholder={busy ? "Thinking..." : "Ask about Joel's work or request a redesign…"}
            aria-label="Chat input"
            className={`flex-1 bg-transparent text-xs outline-none resize-none ${busy ? "opacity-50 cursor-not-allowed" : ""}`}
            style={{
              color: "var(--ide-text)",
              caretColor: "var(--ide-accent)",
              minHeight: "2lh",
              maxHeight: "4lh",
              overflowY: "auto",
            }}
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            aria-label="Send message"
            className={`flex items-center justify-center w-6 h-6 rounded shrink-0 ${busy ? "opacity-50 cursor-not-allowed" : ""}`}
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
