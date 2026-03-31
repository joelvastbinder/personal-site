# Joel's Personal Site — Implementation Plan

**Version:** v0.1
**Date:** March 2026

---

## Overview

Two-panel personal site built in React/Next.js, deployed on Vercel via v0. Left panel displays the resume as unstyled HTML (browser defaults only); right panel is a chat interface powered by the Vercel AI SDK. The AI agent answers questions about Joel's experience and dynamically restyles the resume UI on request.

---

## Steps

### Step 1 — Static UI Shell
Build the two-panel layout in v0 with no live functionality. Left panel shows placeholder resume content as unstyled HTML (real tags, zero custom CSS on the content). Right panel is a chat UI with static/mocked messages. Goal is to nail the layout, spacing, and feel before any logic is wired up.


### Step 2 — Basic Agent Q&A
Wire up the Vercel AI SDK with a Next.js API route. The agent gets the resume content (e.g. markdown or plain text from the same source as the site) as system context and answers questions about it conversationally. Chat is now live — messages send, stream back, render in the right panel. No restyling yet.

### Step 3 — AI-driven UI Restyling
Extend the agent to detect restyle requests and return generated HTML/CSS that presents the resume content in the form of apersonal website. The left panel swaps from unstyled HTML into the agent's rendered HTML. Content stays immutable but the form and presentation can change significantly.

### Step 4 - UX Polishing
- Making the "Thinking..." part of the chat more engaging. Let's have the dots loop from ".", "..", "..." and add a seconds counter to the end to make sure the user knows what's going on
- Let's remove the < > arrows at the top right of the preview panel and replace it with an undo button. This should be disabled at first. Then when they do a UI redesign, the new html should be stored in localstorage in a string in a json object. Once this happens the first time and html is available in localstorage, users should be able to click undo and the button should turn into a redo button that would restore it back to the state it was in before they undid it. So we should be storing two things in localstorage - current state and previous state and the button should switch between them if they're available. When a new version is created, the current version should become the old one and new version should become the current one
- Let's add a bio/instructions section at the top left side of the screen similar to a resume summary where it says who I am and why I'm interesting. It should also explain in a lighthearted tone that since I'm not interested in becoming a purely frontend developer, I want people to help me design a more compelling personal site which can be done via the chat interface
- The Chat interface should be prepopulated with instructions explaining that people can either ask questions about me or redesign the UI of my site which will repopulate the preview panel

## Future Development

### Agent Guardrails & Redirects
Add the content guardrails described in the spec — PG filtering on generated themes, friendly refusals with alternative suggestions, and graceful handling of off-topic messages that nudges users back toward the resume.

### Version History (Undo/Redo) - Review and refine `ai_context/specs/version-history.md`
Snapshot each agent-generated UI state into a history store. Wire up ← → controls on the left panel. Cap at 10 versions (FIFO), persist the current version to `localStorage`.


### Resume from External URL
Replace the hardcoded placeholder with a fetch from a static external URL (e.g. a GitHub raw link) at page load. Render the fetched content as unstyled HTML in the left panel (if the source is markdown, convert to HTML without custom styling). Joel can update the file without redeploying.

---

## Key Decisions

| Decision | Resolution |
|---|---|
| **Frontend** | React / Next.js via v0 |
| **Hosting** | Vercel |
| **AI SDK** | Vercel AI SDK + Next.js API route |
| **LLM / API** | [Vercel AI Gateway](https://vercel.com/docs/ai-gateway) via the AI SDK (`streamText`, `provider/model` strings); auth via `AI_GATEWAY_API_KEY` locally, or OIDC when deployed on Vercel (see gateway docs) |
| **Resume source** | Step 6 onward: fetched from external static URL (e.g. GitHub raw). Until then: single canonical file in the repo (e.g. markdown) shared by the resume panel and agent context. |
| **Resume display** | Unstyled HTML — browser defaults only, no custom CSS on the resume until the agent restyles it |
| **Agentic framework** | Deferred — potential future upgrade from Vercel AI SDK to LangChain or similar |
