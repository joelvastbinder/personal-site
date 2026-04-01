# Step 5 — Final UI Polishing (spec)

**Version:** v0.1  
**Date:** April 2026  
**Parent:** [implementation-plan.md](../implementation-plan.md) Step 5  
**Product context:** [joel-personal-site-overview.md](../joel-personal-site-overview.md)  
**Prerequisite:** [ux-wrap-up.md](./ux-wrap-up.md) (Step 4)

---

## 1. Goal

Polish the user experience to production-ready state with three key enhancements:

1. **Collapsible chat interface** - Hideable chat panel with floating widget when collapsed
2. **Disabled input during thinking** - Prevent double-message scenarios
3. **Intelligent intent routing** - Automatic Q&A vs restyling detection using cheap model

**What changes from Step 4:**

- Chat panel becomes collapsible with floating circle + chat bubble when hidden
- Input field and send button are disabled while agent is thinking
- Mode switcher UI is removed entirely, replaced by automatic intent detection
- Mobile: chat starts collapsed, pushes resume aside when opened
- Desktop: chat starts fully open, can be collapsed to floating widget

**Explicitly not in this step:** Content guardrails, external resume URL fetching (future steps).

---

## 2. Success Criteria

### Collapsible Chat
- Desktop: chat panel starts fully open (current behavior)
- Mobile: chat panel starts collapsed to floating widget
- Floating widget appears in bottom-right corner with standard spacing (16-24px from edges)
- Floating widget shows custom SVG logo with JV initials + chat bubble with text "JoelLM here - click here to chat"
- Clicking either circle or bubble opens the chat panel
- When chat is collapsed, resume panel expands to full width
- Chat remains floating on top as fixed overlay (doesn't push content)
- Collapsing preserves full message history
- Instant show/hide animations (0ms, no transitions)
- State persists: if user closes chat, stays closed on refresh (localStorage)

### Disabled Input
- Input field is disabled while status === "submitted" or "streaming"
- Send button is disabled during same states
- User can still scroll chat history and see thinking indicator
- Input re-enables when response completes or errors

### Intelligent Routing
- Mode switcher UI removed entirely from interface
- System uses BASIC_MODEL (from env) to detect intent via tool calling
- Model can call either `qa_response` tool or `generate_html` tool
- Single streaming call determines routing and executes appropriate flow
- No visible indication of routing (transparent to user)
- Chat history doesn't mention "modes" - just responds naturally

---

## 3. Architecture

```mermaid
flowchart TD
  subgraph Browser
    FloatingWidget[Floating Circle + Bubble]
    ChatPanel[Chat Panel full or collapsed]
    ResumePanel[Resume Panel adjusts width]
    CollapseState[localStorage collapse state]
  end
  
  subgraph APIRoute[/api/chat]
    BasicModel[BASIC_MODEL routing call]
    QATool[qa_response tool]
    RestyleTool[generate_html tool]
    MainModel[Main model for actual response]
  end
  
  FloatingWidget -->|click| ChatPanel
  ChatPanel -->|collapse| FloatingWidget
  ChatPanel -->|state change| CollapseState
  CollapseState -->|hydrate on load| ChatPanel
  
  ChatPanel -->|stream request| BasicModel
  BasicModel -->|detects Q&A| QATool
  BasicModel -->|detects restyle| RestyleTool
  QATool -->|execute| MainModel
  RestyleTool -->|execute| MainModel
  MainModel -->|stream response| ChatPanel
  
  ChatPanel -.disable input.-> ChatPanel
  ResumePanel -.expands when collapsed.-> ChatPanel
```

---

## 4. Feature 1: Collapsible Chat Interface

### 4.1 Goal

Make the chat interface hideable/collapsible to give users more screen space for viewing the resume. When collapsed, show a floating widget (circle + chat bubble) that reopens the chat.

### 4.2 Visual Design

**Collapsed State (Floating Widget):**

- **Circle**: Custom SVG logo with JV initials, styled like an AI company logo with subtle humor
  - Size: 56x56px
  - Background: Dark navy/dark blue
  - Border: 2px solid lighter blue/accent color
  - Shadow: Subtle drop shadow for elevation
  - Logo: Minimal/geometric AI company style with "JV" initials prominently displayed
  
- **Chat Bubble**: White rounded rectangle with text
  - Text: "JoelLM here - click here to chat"
  - Position: To the left of the circle
  - Background: White
  - Border: 1px solid light gray
  - Arrow/tail pointing to the circle
  
- **Position**: Bottom-right corner, fixed positioning
  - 20px from bottom edge
  - 20px from right edge
  - Fixed (doesn't scroll with page)
  
**Expanded State:**

- Full chat panel as it currently exists
- Close button (X or collapse icon) in top-right corner of chat panel header

### 4.3 Behavior

**Desktop (viewport ≥ 768px):**
- Initial state: Fully open (current behavior)
- User clicks close button → collapses to floating widget
- Resume panel expands to full width when chat collapses
- Floating widget appears as overlay (doesn't affect layout)
- Clicking circle or bubble → expands to full panel
- State persists in localStorage (`chat-collapsed: "true" | "false"`)

**Mobile (viewport < 768px):**
- Initial state: Collapsed to floating widget
- Clicking widget → chat slides in from right, pushes resume panel left/off-screen
- Chat takes full viewport width on mobile
- Close button returns to floating widget state
- Resume panel returns to full viewport width

### 4.4 Implementation Details

**File:** [`src/components/chat-panel.tsx`](src/components/chat-panel.tsx)

**New state:**
```typescript
const [isCollapsed, setIsCollapsed] = useState(false)

// On mount, read from localStorage
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

// Sync to localStorage on change
useEffect(() => {
  localStorage.setItem('chat-collapsed', isCollapsed.toString())
}, [isCollapsed])
```

**Conditional render:**
```typescript
if (isCollapsed) {
  return <FloatingChatWidget onClick={() => setIsCollapsed(false)} />
}

return (
  <div className="chat-panel-full">
    <ChatHeader onClose={() => setIsCollapsed(true)} />
    {/* existing chat UI */}
  </div>
)
```

**File:** [`src/components/floating-chat-widget.tsx`](src/components/floating-chat-widget.tsx) (new)

```typescript
interface FloatingChatWidgetProps {
  onClick: () => void
}

export function FloatingChatWidget({ onClick }: FloatingChatWidgetProps) {
  return (
    <div 
      className="fixed bottom-5 right-5 flex items-center gap-3 cursor-pointer z-50"
      onClick={onClick}
    >
      {/* Chat bubble */}
      <div className="bg-white border border-gray-300 rounded-2xl px-4 py-2 shadow-lg">
        <p className="text-sm text-gray-800 whitespace-nowrap">
          JoelLM here - click here to chat
        </p>
      </div>
      
      {/* Circle with logo */}
      <div className="w-14 h-14 rounded-full bg-slate-800 border-2 border-blue-500 shadow-xl flex items-center justify-center">
        <JVLogo />
      </div>
    </div>
  )
}
```

**File:** [`src/components/jv-logo.tsx`](src/components/jv-logo.tsx) (new)

SVG logo component with JV initials in minimal/geometric AI company style. Design should be:
- Clean lines, simple shapes
- "JV" text prominently featured
- Subtle circular/geometric pattern that vaguely resembles typical AI company logos
- Colors: white/light blue on dark background
- Size: 32x32px viewBox

### 4.5 Layout Changes

**File:** [`src/app/page.tsx`](src/app/page.tsx) or main layout component

When chat is collapsed:
```typescript
<div className="flex h-screen">
  <ResumePanel 
    className={isCollapsed ? "w-full" : "w-1/2"}
    displayedHTML={versionHistory.displayedHTML}
    {/* ... other props */}
  />
  
  {isCollapsed ? null : (
    <ChatPanel 
      className="w-1/2"
      onCollapse={() => setIsCollapsed(true)}
      {/* ... other props */}
    />
  )}
  
  {isCollapsed && (
    <FloatingChatWidget onClick={() => setIsCollapsed(false)} />
  )}
</div>
```

### 4.6 Mobile Responsive Behavior

**CSS approach:**
```css
@media (max-width: 768px) {
  .resume-panel {
    width: 100vw;
    transition: transform 0s; /* instant per user preference */
  }
  
  .resume-panel.chat-open {
    transform: translateX(-100vw);
  }
  
  .chat-panel {
    width: 100vw;
    position: absolute;
    right: 0;
    transform: translateX(100vw);
  }
  
  .chat-panel.expanded {
    transform: translateX(0);
  }
}
```

---

## 5. Feature 2: Disable Input During Thinking

### 5.1 Goal

Prevent users from sending multiple messages while the agent is processing, avoiding race conditions and confusing state.

### 5.2 Behavior

**When disabled (status === "submitted" or "streaming"):**
- Input field is disabled (grayed out, not editable)
- Send button is disabled (grayed out, not clickable)
- User can still:
  - Scroll through message history
  - See the thinking indicator with animated dots and timer
  - View incoming streaming responses

**When enabled (status === "idle" or "error"):**
- Input field is editable
- Send button is clickable
- User can type and send messages normally

### 5.3 Implementation

**File:** [`src/components/chat-panel.tsx`](src/components/chat-panel.tsx)

```typescript
const busy = status === "submitted" || status === "streaming"

return (
  <div className="chat-panel">
    {/* ... message history ... */}
    
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={busy}
        placeholder={busy ? "Thinking..." : "Ask about Joel or request a redesign..."}
        className={busy ? "opacity-50 cursor-not-allowed" : ""}
      />
      
      <button 
        type="submit" 
        disabled={busy || !input.trim()}
        className={busy ? "opacity-50 cursor-not-allowed" : ""}
      >
        <CornerDownLeft size={16} />
      </button>
    </form>
  </div>
)
```

**Visual feedback:**
- Disabled input: 50% opacity, not-allowed cursor
- Disabled button: 50% opacity, not-allowed cursor
- Placeholder text changes to "Thinking..." when disabled

---

## 6. Feature 3: Intelligent Intent Routing

### 6.1 Goal

Remove the manual mode switcher UI and automatically detect whether the user wants Q&A or restyling using a cheap model with tool calling.

### 6.2 Architecture

**Current flow (manual mode selection):**
```
User selects mode → User sends message → API route uses selected mode → Execute flow
```

**New flow (automatic detection):**
```
User sends message → API route calls BASIC_MODEL with tools → Model chooses tool → Execute appropriate flow
```

### 6.3 Tool Definitions

**File:** [`src/app/api/chat/route.ts`](src/app/api/chat/route.ts)

Define two tools for the routing model:

```typescript
const routingTools = {
  qa_response: {
    description: "Answer a question about Joel's resume, experience, skills, or background",
    inputSchema: {
      type: "object" as const,
      properties: {
        question: {
          type: "string",
          description: "The user's question to answer"
        }
      },
      required: ["question"]
    },
    outputSchema: {
      type: "object" as const,
      properties: {
        intent: { type: "string" }
      }
    },
    output: async (args: { question: string }) => {
      return { intent: "qa" }
    }
  },
  
  generate_html: {
    description: "Generate new HTML/CSS to restyle Joel's resume based on a theme, design, or aesthetic request",
    inputSchema: {
      type: "object" as const,
      properties: {
        theme_description: {
          type: "string",
          description: "Description of the requested theme or design style"
        }
      },
      required: ["theme_description"]
    },
    outputSchema: {
      type: "object" as const,
      properties: {
        intent: { type: "string" }
      }
    },
    output: async (args: { theme_description: string }) => {
      return { intent: "restyle" }
    }
  }
}
```

### 6.4 Routing Flow

```typescript
// 1. User message arrives
const userMessage = messages[messages.length - 1]

// 2. Call BASIC_MODEL with routing tools
const routingResult = await streamText({
  model: process.env.BASIC_MODEL!, // e.g., "openai/gpt-4o-mini"
  messages: [{
    role: "system",
    content: "You help route user requests. Call qa_response for questions about Joel's experience. Call generate_html for UI redesign requests."
  }, {
    role: "user",
    content: userMessage.content
  }],
  tools: routingTools,
  stopWhen: stepCountIs(1) // Only need one tool call
})

// 3. Extract tool call result
let detectedIntent = "qa" // default fallback
for await (const part of routingResult.stream) {
  if (part.type === "tool-call") {
    detectedIntent = part.toolName === "generate_html" ? "restyle" : "qa"
  }
}

// 4. Execute appropriate flow
if (detectedIntent === "restyle") {
  // Call main restyling model with HTML generation tool
  return await executeRestyleFlow(messages)
} else {
  // Call main Q&A model
  return await executeQAFlow(messages)
}
```

### 6.5 Environment Variables

**File:** `.env.local`

```bash
BASIC_MODEL=openai/gpt-4o-mini
# or another cheap, fast model for routing
```

**Access in code:**
```typescript
const basicModel = process.env.BASIC_MODEL || "openai/gpt-4o-mini"
```

### 6.6 UI Changes

**Remove mode switcher:**
- Delete the mode selection UI from [`src/components/chat-panel.tsx`](src/components/chat-panel.tsx)
- Remove mode state management (`const [mode, setMode]`)
- Remove mode parameter from API calls

**No visible routing indicator:**
- Routing happens transparently on the backend
- User just sees their question/request and the response
- No "Routing to Q&A" or "Routing to restyle" messages

---

## 7. Component Touch List

| Component | Changes |
|-----------|---------|
| [`src/components/chat-panel.tsx`](src/components/chat-panel.tsx) | Add collapse state, disable input when busy, remove mode switcher UI |
| [`src/components/floating-chat-widget.tsx`](src/components/floating-chat-widget.tsx) (new) | Floating circle + chat bubble component |
| [`src/components/jv-logo.tsx`](src/components/jv-logo.tsx) (new) | Custom SVG logo with JV initials |
| [`src/components/resume-panel.tsx`](src/components/resume-panel.tsx) | Add dynamic width class based on chat collapse state |
| [`src/app/page.tsx`](src/app/page.tsx) or main layout | Manage collapse state, pass to child components |
| [`src/app/api/chat/route.ts`](src/app/api/chat/route.ts) | Add routing layer with BASIC_MODEL + tools, remove mode parameter |

---

## 8. Data Flow

### 8.1 Chat Collapse/Expand

```
User clicks collapse button
  ↓
setIsCollapsed(true)
  ↓
localStorage.setItem("chat-collapsed", "true")
  ↓
ChatPanel unmounts, FloatingChatWidget mounts
  ↓
ResumePanel receives new width class (w-full)
  ↓
User clicks floating widget
  ↓
setIsCollapsed(false)
  ↓
localStorage.setItem("chat-collapsed", "false")
  ↓
FloatingChatWidget unmounts, ChatPanel mounts with preserved history
```

### 8.2 Intent Routing

```
User submits message
  ↓
API route receives message
  ↓
Call BASIC_MODEL with routing tools
  ↓
Model decides: qa_response OR generate_html
  ↓
Extract tool call name → determine intent
  ↓
Execute appropriate flow (Q&A or restyle)
  ↓
Stream response back to client
  ↓
Client renders response in chat
```

---

## 9. Edge Cases

| Case | Behavior |
|------|----------|
| localStorage disabled/unavailable | Fallback to in-memory state only, desktop defaults to open, mobile to collapsed |
| BASIC_MODEL env var missing | Fallback to default "openai/gpt-4o-mini" |
| Routing model fails to call a tool | Default to Q&A flow |
| User sends message while collapsed | Should not be possible (chat input only exists when expanded) |
| Multiple rapid collapse/expand clicks | Debounce or disable button during transition (though instant transition makes this moot) |
| Chat history very long on mobile | Ensure scrolling works properly, consider lazy loading or virtualization (future) |

---

## 10. Testing Checklist

### Collapsible Chat
- [ ] Desktop: chat starts fully open by default
- [ ] Mobile: chat starts collapsed to floating widget by default
- [ ] Clicking collapse button hides chat, shows floating widget
- [ ] Floating widget appears in bottom-right corner with correct spacing
- [ ] Clicking circle opens chat
- [ ] Clicking chat bubble opens chat
- [ ] Resume panel expands to full width when chat collapses (desktop)
- [ ] Resume panel pushes left when chat opens (mobile)
- [ ] Collapse state persists to localStorage
- [ ] Page refresh restores correct collapse state
- [ ] Message history is preserved when collapsing/expanding
- [ ] No animation/transition (instant show/hide)

### Disabled Input
- [ ] Input field is disabled when status === "submitted"
- [ ] Input field is disabled when status === "streaming"
- [ ] Send button is disabled when status === "submitted"
- [ ] Send button is disabled when status === "streaming"
- [ ] User can scroll chat history while disabled
- [ ] Thinking indicator is visible while disabled
- [ ] Input re-enables after response completes
- [ ] Input re-enables after error occurs
- [ ] Visual feedback shows disabled state (opacity, cursor)

### Intelligent Routing
- [ ] Mode switcher UI is completely removed
- [ ] Q&A questions correctly route to Q&A flow
- [ ] Restyle requests correctly route to restyle flow
- [ ] Ambiguous messages default to Q&A flow
- [ ] Routing happens transparently (no visible indicator)
- [ ] BASIC_MODEL env var is read correctly
- [ ] Fallback model works if env var missing
- [ ] Tool calling works correctly for both tools
- [ ] Edge cases (no tool call) default to Q&A

### Regression Testing
- [ ] Q&A mode still works (answers questions accurately)
- [ ] Restyle mode still works (generates valid HTML)
- [ ] Thinking indicator with animated dots and timer works
- [ ] Undo/redo functionality works
- [ ] Bio section displays correctly
- [ ] Welcome message appears on first load
- [ ] Version history persists to localStorage
- [ ] All existing features from Steps 1-4 still work

---

## 11. Open Questions

1. **JV Logo Design** - Need final SVG design for the logo. Should be minimal/geometric AI company style with JV initials. Design should subtly resemble typical AI company logos with playful intent.

2. **Chat bubble arrow/tail** - Should the chat bubble have a CSS arrow/tail pointing to the circle, or just float next to it?

3. **BASIC_MODEL specific choice** - Should we default to a specific model or make it configurable? Current plan: env var with fallback to "openai/gpt-4o-mini"

4. **Routing failure handling** - If routing model fails completely, should we show an error or silently default to Q&A?

5. **Mobile breakpoint** - Using 768px as mobile/desktop breakpoint. Should this be adjustable or configurable?

---

## 12. Out of Scope (Future Work)

- Animated transitions for collapse/expand (user wants instant)
- Chat bubble pulse/bounce animation
- Unread message indicator on floating widget
- Multiple chat conversations/threads
- Drag-and-drop to reposition floating widget
- Keyboard shortcuts (Cmd+K to toggle chat)
- Chat widget position configuration (always bottom-right for MVP)
- Analytics tracking (chat open rate, message volume)
- A/B testing different widget designs

---

## 13. Definition of Done

- Chat panel can be collapsed to floating widget (circle + bubble)
- Desktop: starts open, mobile: starts collapsed
- Floating widget appears bottom-right with correct styling and spacing
- Clicking circle or bubble opens chat
- Resume panel expands to full width when chat collapses (desktop)
- Resume panel slides left when chat opens (mobile)
- Collapse state persists via localStorage
- Message history is preserved during collapse/expand
- Input and send button are disabled while agent is thinking
- User can still scroll and view thinking indicator when disabled
- Mode switcher UI is completely removed
- BASIC_MODEL routes requests to correct flow using tool calling
- Routing is transparent (no visible indicator)
- All items in testing checklist pass
- No regressions in existing functionality from Steps 1-4
- JV logo SVG component created and integrated
