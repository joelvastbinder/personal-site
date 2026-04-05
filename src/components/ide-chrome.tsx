"use client"

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
      <span
        className="text-[11px]"
        style={{ color: "var(--ide-text-muted)", fontFamily: "monospace" }}
      >
        joel-lm-5-13
      </span>
    </div>
  )
}
