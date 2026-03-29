# v0 Prompt — Step 1: Static UI Shell (v2)

> Build a two-panel personal site layout in Next.js with Tailwind. No backend, no live data — static/mocked content only. The overall aesthetic should feel like a cartoony, slightly exaggerated version of a code editor / agentic IDE — think Cursor or VS Code but with more visual personality. It should be immediately legible as a portfolio site to non-technical visitors, but clearly doing something unusual and fun.

---

## Global Chrome & Layout

- Full viewport height, no page scroll. Two panels side-by-side.
- All UI panels and chrome elements should have **pronounced, solid 2px borders** in a slightly more contrasting (darker for solarized theme; lighter for dark theme) shade of the panel color — like a cartoon or lo-fi UI drawing attention to its own structure. Nothing should feel borderless or floating.
- A persistent status bar along the very bottom of the screen — spans full width, ~24px tall. Shows faint labels like `joelLM · ready` on the left and `joel-lm-5-13` on the right in monospace, 11px. Styled like an IDE status bar but with the same pronounced border treatment on top.
- A slim top bar with the site title or logo on the left, and a theme switcher on the right — a small segmented control or dropdown with two options: **Dark** and **Solarized Dark**. The top bar should also have a solid bottom border.
- Theme switching only affects the chrome: top bar, status bar, chat panel, drag handle, and UI controls. The resume preview panel is explicitly excluded from theming.
- Dark theme base colors: `#1e1e1e` background, `#252526` panels, `#3c3c3c` borders, `#cccccc` text.
- Solarized Dark theme colors: `#002b36` background, `#073642` panels, `#839496` text, `#268bd2` accent, `#b58900` highlights.

---

## Left Panel — Resume Preview

- Roughly 60% of viewport width by default, but shrinks as the right panel is resized.
- Has a pronounced border on its right edge (the panel divider) — thicker than a hairline, closer to 2–3px, solid.
- A tab bar at the top styled like a code editor tab — shows a single tab labeled `resume.html` with a small file icon. Tab has an active indicator (colored bottom border). The tab bar itself has a solid bottom border separating it from the content area.
- The content area displays the resume as **plain, unstyled HTML** — real browser defaults only. Think `<h1>`, `<h2>`, `<ul>`, `<li>`, `<p>` tags with zero custom CSS applied. It should look exactly like what you'd see if you opened an HTML file with no stylesheet: black serif/system text, blue underlined links, bulleted lists, browser-default heading sizes. Clean white background (`#ffffff`).
- This "browser default" look is intentional — it sets up the contrast when the AI agent later restyling it. It should feel like an unstyled document, not a designed layout.
- Two small disabled arrow buttons `←` `→` sit in the tab bar area on the right side — styled like editor navigation controls. Tooltips: "Previous version" / "Next version". Visually dimmed for now.
- The placeholder resume content should be realistic: name as `<h1>`, a short tagline as `<p>`, sections like Experience, Skills, and Education as `<h2>` headers with `<ul>` lists beneath them. Enough content to fill the panel.

---

## Right Panel — joelLM Chat

- Resizable via a drag handle on its left edge — a visible, pronounced 4px vertical bar (not subtle) that highlights in the active accent color on hover. Dragging it wider causes it to overlap the left panel, which becomes scrollable underneath. Min width 300px, max 70vw.
- The entire panel has a solid border on all visible edges, consistent with the cartoony border treatment elsewhere.
- Panel header reads **"joeLLM"** in monospace, styled like a terminal process name or editor panel title — small, uppercase or small-caps, muted. Sits in a panel title bar with a solid bottom border.
- Scrollable message history area above. Messages styled as clean linear threads — no chat bubbles. User messages prefixed with a `>` prompt character in the accent color. Agent responses are plain output blocks with a subtle left border. Monospace font throughout.
- Include 2–3 mocked messages: one visitor asking "What cloud platforms has Joel worked with?" and a short plausible agent response. Add one more exchange — something like a visitor asking to restyle the resume and the agent confirming it's about to apply a new theme.
- Fixed bottom input bar with a solid top border: a text input field styled like a terminal prompt line, with a small **Send** button or `↵` icon on the right.
- Have a dropdown option on the bottom for mode. Auto, Q&A, Restyle. This will let users switch between an automatic mode where they the agent will decide what action gets taken. Q&A mode will just let them ask questions about my experience. Restyle will let them make changes to the way my experience is shown in the preview box

---

## Feel & Constraints

- Monospace font throughout all UI chrome (suggest `JetBrains Mono`, `Fira Code`, or system monospace fallback).
- The border treatment is the key personality detail — lean into it. Panels should look chunky and deliberate, not airy or minimal.
- No gradients. Rounded corners only on interactive elements like buttons, max 4px.
- The left panel content (the unstyled HTML resume) should use the browser's default serif/system font stack — do not apply monospace or any custom font to the resume content itself.
- The overall impression: someone built a little IDE just to show you their resume, and it's doing something clever. Approachable and a little playful, not sterile.
