# v0 Prompt — Step 1: Static UI Shell

> Build a two-panel personal site layout in Next.js with Tailwind. No backend, no live data — static/mocked content only. The overall aesthetic should feel like a code editor / agentic IDE, loosely inspired by Cursor.

---

## Global Chrome & Layout

- Full viewport height, no page scroll. Two panels side-by-side.
- A persistent status bar along the very bottom of the screen — spans full width, ~24px tall. Shows faint labels like `joeLLM Agent · ready` on the left and `joellm-5-13` on the right in monospace, 11px. Feels like a VS Code status bar.
- A slim top bar with the site title or logo on the left, and a theme switcher on the right — a small segmented control or dropdown with two options: **Dark** and **Solarized Dark**. Minimal, no heavy nav.
- Theme switching only affects the IDE components - **not the preview panel**: top bar, status bar, chat panel, drag handle, and UI controls. The resume preview panel is explicitly excluded — it stays on a clean, neutral white/light background regardless of theme.
- Dark theme base colors: `#1e1e1e` background, `#252526` panels, `#3c3c3c` borders, `#cccccc` text.
- Solarized Dark theme colors: `#002b36` background, `#073642` panels, `#839496` text, `#268bd2` accent, `#b58900` highlights.

---

## Left Panel — Resume Preview

- Roughly 60% of viewport width by default, but becomes scrollable as the right panel is resized. Don't resize the content based on the size of the Right Panel.
- A tab bar at the top styled exactly like a code editor tab — shows a single tab labeled `Joel Site Preview` with a small web/globe icon. Tab has an active indicator (colored bottom border).
- Below the tab bar, a faint line-number gutter on the left edge (static numbers, purely decorative).
- The content area displays a block of raw placeholder markdown as plain monospace text — intentionally unstyled, like reading a `.md` file in a text editor. No markdown rendering.
- Two small disabled arrow buttons `←` `→` sit in the tab bar area on the right side — styled like editor navigation controls, not pagination buttons. Tooltips on hover: "Previous version" and "Next version". Visually dimmed/disabled for now.
- To start, this should feel like a web browser with raw text in the html with no styling.

---

## Right Panel — joeLLM Chat

- Resizable via a drag handle on its left edge — a 4px vertical bar that highlights in the active accent color on hover. Dragging it wider causes it to overlap the left panel (left panel becomes scrollable underneath). Min width 300px, max 70vw.
- Panel header reads **"joeLLM"** in monospace, styled like a terminal process name or editor panel title — not a friendly chatbot label. Small, uppercase or small-caps, muted. Sits in a panel title bar that feels like a Cursor secondary pane.
- Scrollable message history area above. Messages styled as clean linear threads — no chat bubbles. User messages prefixed with a `>` prompt character in the accent color. Agent responses are plain output blocks with a very subtle left border. Monospace font throughout.
- Include 2–3 mocked messages: one visitor asking "What cloud platforms has Joel worked with?" and a short plausible agent response. Add one more exchange of your choice that would make sense on a resume-chat site.
- Fixed bottom input bar: a text input field that looks like a terminal prompt line, with a small **Send** button or `↵` icon on the right. The input should have a blinking cursor aesthetic.
- Slightly darker background than the left panel, consistent with the active theme.

---

## Feel & Constraints

- Monospace font throughout all UI chrome (suggest `JetBrains Mono`, `Fira Code`, or system monospace fallback).
- No gradients, no rounded corners (or very subtle 2px max), no decorative illustrations.
- Icon buttons only where necessary — keep visual noise minimal.
- Do not make this look like a portfolio template. It should feel like an internal tool or agentic IDE that happens to contain a resume.