# Joel's Personal Site — Implementation Plan

**Version:** v0.1
**Date:** March 2026

---

## Overview

Two-panel personal site built in React/Next.js, deployed on Vercel via v0. Left panel displays a raw markdown resume; right panel is a chat interface powered by the Vercel AI SDK. The AI agent answers questions about Joel's experience and dynamically restyles the resume UI on request.

---

## Steps

### Step 1 — Static UI Shell
Build the two-panel layout in v0 with no live functionality. Left panel shows raw placeholder markdown as plain text. Right panel is a chat UI with static/mocked messages. Goal is to nail the layout, spacing, and feel before any logic is wired up.

### Step 2 — Resume from External URL
Replace the hardcoded placeholder text with a fetch from a static external URL (e.g. a GitHub raw link) at page load. The left panel displays whatever raw markdown comes back. Joel can update the file without redeploying.

### Step 3 — Basic Agent Q&A
Wire up the Vercel AI SDK with a Next.js API route. The agent gets the resume markdown as system context and answers questions about it conversationally. Chat is now live — messages send, stream back, render in the right panel. No restyling yet.

### Step 4 — AI-driven UI Restyling
Extend the agent to detect restyle requests and return generated HTML/CSS that presents the resume content. The left panel swaps from raw markdown display into the agent's rendered HTML. Content stays immutable — only presentation changes.

### Step 5 — Version History (Undo/Redo)
Snapshot each agent-generated UI state into a history store. Wire up ← → controls on the left panel. Cap at 10 versions (FIFO), persist the current version to `localStorage`.

### Step 6 — Agent Guardrails & Redirects
Add the content guardrails described in the spec — PG filtering on generated themes, friendly refusals with alternative suggestions, and graceful handling of off-topic messages that nudges users back toward the resume.

---

## Key Decisions

| Decision | Resolution |
|---|---|
| **Frontend** | React / Next.js via v0 |
| **Hosting** | Vercel |
| **AI SDK** | Vercel AI SDK + Next.js API route |
| **Resume source** | Raw markdown fetched from external static URL (e.g. GitHub raw) |
| **Resume display** | Raw markdown as plain text — intentionally unstyled until the agent restyles it |
| **Agentic framework** | Deferred — potential future upgrade from Vercel AI SDK to LangChain or similar |
