"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { ResumePanel } from "@/components/resume-panel"
import { ChatPanel } from "@/components/chat-panel"
import { TopBar, StatusBar } from "@/components/ide-chrome"

type Theme = "dark" | "solarized"

const MIN_CHAT_WIDTH = 300
const MAX_CHAT_VW = 0.7

export default function Page() {
  const [theme, setTheme] = useState<Theme>("solarized")
  const [chatWidth, setChatWidth] = useState(380)
  const [displayedHTML, setDisplayedHTML] = useState<string | null>(null)
  const [isChatCollapsed, setIsChatCollapsed] = useState(false)
  const isDragging = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Sync with ChatPanel's collapse state via localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem('chat-collapsed')
      if (stored !== null) {
        setIsChatCollapsed(stored === 'true')
      }
    }
    
    // Initial load
    handleStorageChange()
    
    // Listen for changes (e.g., from ChatPanel)
    window.addEventListener('storage', handleStorageChange)
    
    // Custom event for same-window updates
    const handleLocalUpdate = () => handleStorageChange()
    window.addEventListener('chat-collapsed-changed', handleLocalUpdate)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('chat-collapsed-changed', handleLocalUpdate)
    }
  }, [])

  const handleThemeChange = (t: Theme) => {
    setTheme(t)
  }

  const handleHTMLGenerated = useCallback((html: string) => {
    setDisplayedHTML(html)
  }, [])

  const onDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    isDragging.current = true
    document.body.style.cursor = "col-resize"
    document.body.style.userSelect = "none"
  }, [])

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const maxWidth = rect.width * MAX_CHAT_VW
      const newWidth = rect.right - e.clientX
      setChatWidth(Math.min(maxWidth, Math.max(MIN_CHAT_WIDTH, newWidth)))
    }

    const onMouseUp = () => {
      isDragging.current = false
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }

    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseup", onMouseUp)
    return () => {
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", onMouseUp)
    }
  }, [])

  return (
    <div
      data-theme={theme === "solarized" ? "solarized" : undefined}
      className="flex flex-col"
      style={{ height: "100dvh", background: "var(--ide-bg)" }}
    >
      {/* Top bar */}
      <TopBar theme={theme} onThemeChange={handleThemeChange} />

      {/* Main two-panel area */}
      <div
        ref={containerRef}
        className="flex flex-1 overflow-hidden relative"
      >
        {/* Left — Site Preview */}
        <div className={`overflow-hidden min-w-0 transition-all duration-0 ${isChatCollapsed ? "flex-1" : "flex-1"}`}>
          <ResumePanel 
            displayedHTML={displayedHTML}
          />
        </div>

        {/* Drag handle - hidden on mobile */}
        {!isChatCollapsed && (
          <div
            onMouseDown={onDragStart}
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize chat panel"
            className="drag-handle shrink-0 items-center justify-center group relative hidden md:flex"
            style={{
              width: "6px",
              background: "var(--ide-border)",
              cursor: "col-resize",
              zIndex: 10,
            }}
          >
            {/* Hover highlight */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: "var(--ide-accent)" }}
            />
            {/* Grip dots */}
            <div
              className="relative flex flex-col gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-hidden="true"
            >
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    width: "3px",
                    height: "3px",
                    borderRadius: "50%",
                    background: "#ffffff",
                    opacity: 0.8,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Right — Chat Panel (or FloatingWidget when collapsed) */}
        <div
          className={`${isChatCollapsed ? '' : 'shrink-0 overflow-hidden w-full md:w-auto'}`}
          style={isChatCollapsed ? {} : {
            width: `${chatWidth}px`,
            border: "2px solid var(--ide-border)",
            borderBottom: "none",
            borderTop: "none",
          }}
        >
          <ChatPanel onHTMLGenerated={handleHTMLGenerated} />
        </div>
      </div>

      {/* Status bar */}
      <StatusBar />
    </div>
  )
}
