"use client"

import { Info } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useIsMobile } from "@/hooks/use-mobile"

const ASSISTANT_DISCLAIMER =
  "Joel set this up as carefully as he could, but it's still an AI which means it might occasionally get things slightly wrong or fill in gaps with a best guess. When in doubt, cross-reference with or reach out directly on LinkedIn."

const disclaimerTriggerClassName =
  "inline-flex items-center justify-center rounded p-0.5 text-[var(--ide-text-muted)] hover:text-[var(--ide-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--ide-accent)]"

function AssistantDisclaimerTrigger() {
  const isMobile = useIsMobile()

  const trigger = (
    <button type="button" aria-label="About this assistant" className={disclaimerTriggerClassName}>
      <Info size={12} strokeWidth={2} aria-hidden />
    </button>
  )

  if (isMobile) {
    return (
      <Popover>
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>
        <PopoverContent
          side="top"
          align="end"
          sideOffset={8}
          className="max-w-xs border-[var(--ide-border)] bg-[var(--ide-panel)] p-3 text-xs text-balance text-[var(--ide-text)] shadow-lg"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {ASSISTANT_DISCLAIMER}
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{trigger}</TooltipTrigger>
      <TooltipContent side="top" sideOffset={6} className="max-w-xs text-balance">
        {ASSISTANT_DISCLAIMER}
      </TooltipContent>
    </Tooltip>
  )
}

type Theme = "dark" | "solarized"

interface TopBarProps {
  theme: Theme
  onThemeChange: (t: Theme) => void
}

export function TopBar({ theme, onThemeChange }: TopBarProps) {
  return (
    <div
      className="flex items-center justify-between px-4 shrink-0"
      style={{
        height: "38px",
        background: "var(--ide-panel)",
        borderBottom: "2px solid var(--ide-border)",
      }}
    >
      {/* Logo / site title */}
      <span
        className="text-sm tracking-tight"
        style={{ color: "var(--ide-text)" }}
      >
        <span style={{ color: "var(--ide-accent)", fontWeight: 700 }}>
          joelv
        </span>
        <span style={{ color: "var(--ide-text-muted)", fontWeight: 400 }}>
          .tech
        </span>
      </span>

      {/* Theme segmented control */}
      <div
        className="flex items-center rounded overflow-hidden"
        style={{ border: "2px solid var(--ide-border)" }}
        role="group"
        aria-label="Theme switcher"
      >
        {(["solarized", "dark"] as Theme[]).map((t) => (
          <button
            key={t}
            onClick={() => onThemeChange(t)}
            aria-pressed={theme === t}
            className="px-3 text-xs h-6"
            style={{
              background: theme === t ? "var(--ide-accent)" : "transparent",
              color: theme === t ? "#ffffff" : "var(--ide-text-muted)",
              borderRight:
                t === "solarized" ? "1px solid var(--ide-border)" : "none",
              transition: "background 0.15s, color 0.15s",
            }}
          >
            {t === "dark" ? "Dark" : "Solarized"}
          </button>
        ))}
      </div>
    </div>
  )
}

export function StatusBar() {
  return (
    <div
      className="flex items-center justify-between px-4 shrink-0"
      style={{
        height: "24px",
        background: "var(--ide-panel)",
        borderTop: "2px solid var(--ide-border)",
      }}
    >
      <span
        className="text-[11px]"
        style={{ color: "var(--ide-text-muted)", fontFamily: "monospace" }}
      >
        joelLM · ready
      </span>
      <div className="flex items-center gap-1">
        <span
          className="text-[11px]"
          style={{ color: "var(--ide-text-muted)", fontFamily: "monospace" }}
        >
          joel-lm-5-13
        </span>
        <AssistantDisclaimerTrigger />
      </div>
    </div>
  )
}
