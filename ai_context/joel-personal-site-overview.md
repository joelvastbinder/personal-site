# Joel's AI-Powered Personal Site — Product Spec

**Version:** v0.2  
**Date:** March 2026  
**Scope:** MVP

---

## Overview

| | |
|---|---|
| **Concept** | A two-panel personal site where visitors can chat with an AI agent to learn about Joel's experience — and dynamically restyle the entire resume UI in real time. The resume content itself is always fixed; only its presentation changes. |
| **Audience** | Primarily recruiters and technical collaborators, but accessible and interesting to non-technical visitors too. |
| **Agent scope** | Resume Q&A + UI generation + limited general chat. The agent never modifies resume content. |

---

## Layout

### Left panel — Resume preview
Renders the active resume view. Starts as **unstyled HTML** — real markup with browser default styling only (no custom CSS on the resume until a restyle). Updates live when the agent generates new HTML/CSS. The underlying content is always Joel's real experience — only the presentation changes.

### Right panel — Chat interface
Persistent sidebar with message history and a text input. The agent responds in chat before applying any visual changes to the left panel.

---

## Core Features

### 1. Resume Q&A
Visitors can ask natural-language questions about Joel's experience, skills, and background. The agent answers conversationally using the static resume as its sole source of truth.

**Examples:**
- "What cloud platforms has Joel worked with?"
- "Tell me about his AI tooling experience."
- "How many years of TypeScript experience does he have?"

### 2. AI-driven UI restyling
Visitors can prompt the agent to retheme or restructure the resume display. The agent generates new HTML/CSS and applies it to the left panel. The underlying content data is never altered — only how it is rendered changes.

**Examples:**
- "Make it look like a LinkedIn profile"
- "Show this as a SpongeBob scene"
- "Use a dark terminal aesthetic"
- "Style it like an old newspaper"

### 3. Version history (undo / redo)
Every agent-generated UI change is saved as a snapshot, up to 10 past versions. A history control (← →) at the top or bottom of the left panel lets users step backward and forward through versions. The oldest version is pruned when the 10-version cap is reached (FIFO). The current version is persisted to localStorage so it survives a page refresh.

### 4. Limited general chat
The agent handles light off-topic messages gracefully and redirects the conversation toward the resume when it strays too far. It is not a general-purpose assistant.

---

## Agent Behavior

| Trigger | Behavior |
|---|---|
| Resume question | Answers in chat panel. No change to the resume panel. |
| Restyle request | Confirms intent in chat, generates new HTML/CSS, applies it to the left panel, saves a new version entry. |
| Out-of-scope question | Responds briefly, then nudges the user back toward the resume experience. |
| Inappropriate theme request | Responds with a friendly refusal and suggests an alternative theme. |

### Content guardrails
Humorous and creative themes are welcome. Generated HTML must stay PG-rated — explicit, violent, or inappropriate content is blocked. The agent responds with a friendly refusal and suggests an alternative.

---

## Resolved Decisions

| Decision | Resolution |
|---|---|
| **Resume content** | Read-only and immutable from the visitor's perspective. The AI agent can only change how content is displayed, never what it says. |
| **Resume source** | Fetched from static external storage (e.g. S3, GitHub raw, or similar) at page load. Joel can update the source file (often markdown) without redeploying the site; it is shown as unstyled HTML in the panel until restyled. Content is treated as fixed for the duration of any visitor session. |
| **Session persistence** | The current UI version is saved to localStorage and restored on page refresh. Chat history is ephemeral (session only). |
| **Version history limit** | 10 past versions stored per session. When the cap is reached, the oldest version is pruned (FIFO). |
| **Content guardrails** | Best-effort PG filter on generated HTML themes. Humorous and unconventional styles are encouraged; explicit or inappropriate content is blocked with a friendly fallback. |

---

## Out of Scope (MVP)

| Item | Status |
|---|---|
| Resume content editing by visitor | Not allowed — content is read-only |
| Auth / login | Not included |
| Persistent chat history | Not included — chat is session only |
| Export to PDF / DOCX | Not included |
| Multi-resume support | Not included |
| Analytics / tracking | Not included |
| Mobile-optimized layout | Stretch goal |
