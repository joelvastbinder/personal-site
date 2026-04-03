"use client"

import { FileCode } from "lucide-react"

interface ResumePanelProps {
  displayedHTML?: string | null
}

export function ResumePanel({ displayedHTML }: ResumePanelProps) {
  return (
    <div
      className="flex flex-col h-full"
      style={{ background: "var(--ide-panel)", borderRight: "3px solid var(--ide-border)" }}
    >
      {/* Tab bar */}
      <div
        className="flex items-center justify-between px-2 shrink-0"
        style={{
          height: "36px",
          background: "var(--ide-panel)",
          borderBottom: "2px solid var(--ide-border)",
        }}
      >
        {/* Active tab */}
        <div
          className="flex items-center gap-1.5 px-3 h-full text-xs"
          style={{
            background: "var(--ide-tab-active)",
            borderRight: "2px solid var(--ide-border)",
            borderBottom: `2px solid var(--ide-tab-border)`,
            color: "var(--ide-text)",
            marginBottom: "-2px",
          }}
        >
          <FileCode size={13} style={{ color: "var(--ide-accent)" }} />
          <span>joel-personal-site.html</span>
        </div>
      </div>

      {/* Content area — browser-default styles, white bg */}
      <div className="flex-1 overflow-auto" style={{ background: "#ffffff" }}>
        {displayedHTML ? (
          <iframe
            sandbox="allow-scripts"
            srcDoc={displayedHTML}
            style={{ width: "100%", height: "100%", border: "none" }}
            title="Restyled personal site"
          />
        ) : (
          <div
            style={{
              padding: "48px 32px",
              fontFamily: "system-ui, -apple-system, sans-serif",
              color: "#1a1a1a",
              fontSize: "15px",
              lineHeight: "1.6",
              maxWidth: "680px",
              margin: "0 auto",
            }}
          >
            <h1 style={{ fontSize: "28px", fontWeight: "600", marginBottom: "8px" }}>
              Joel Vastbinder
            </h1>
            <p style={{ color: "#666", marginBottom: "40px" }}>
              Lead Engineer · Indianapolis
            </p>

            <div style={{ marginBottom: "48px", fontSize: "16px", lineHeight: "1.7" }}>
              <p style={{ marginBottom: "16px" }}>
                I get excited solving problems that make a tangible difference in people's lives. 
                I believe good software gets out of the way. It matches how people actually work 
                instead of forcing them to conform to a completely new process.
                That's been the throughline across everything I've built, from a compliance platform
                that serves 25,000+ students across 20+ institutions to security infrastructure protecting millions of patient 
                records.
              </p>
              <p style={{ marginBottom: "16px" }}>
                So when I set out to build a personal site, I didn't want to build a generic template site but 
                I wanted something that was fun for me to build and still communicates who I am and how I work. 
                So try out the chat panel on the right (or bottom right if you're on mobile) and see what it can 
                do. It's an AI agent that knows my background. Ask it anything about my experience, or tell it 
                how you want the page to look or how you want the experience to be presented.
              </p>
            </div>

            <hr style={{ border: "none", borderTop: "1px solid #e0e0e0", marginBottom: "32px" }} />

            <div style={{ marginBottom: "32px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px" }}>
                What I Do
              </h2>
              <p style={{ marginBottom: "12px" }}>
                Currently serving as the Engineering Lead for a 6-person engineering team at 
                HarperRand-CALRegional, working on products like a compliance platform I led 
                the development and launch of serving 25,000+ students across 20+ institutions. 
                I've also worked on process automation projects like a RAG-enabled AI support 
                agent that reduced Tier 1 support volume by 80% and improvements to our 
                enrollment process that reduced the allowed us to enroll 1000 more students 
                in a quarter without additional headcount.
              </p>
              <p>
                Before that: security engineering at a $2B+ healthcare company protecting
                3M+ patient records, DevOps for a platform distributing $100M+ in social
                benefits, and working at school doing automation work that saved organizations 
                hundreds of hours of manual work.
              </p>
            </div>

            <div style={{ marginBottom: "32px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "12px" }}>
                Background
              </h2>
              <p>
                B.S. Computer Science from Taylor University (3.9 GPA) · Google Certified
                Professional Cloud Developer · Professional Scrum Product Owner
              </p>
            </div>

            <div>
              <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "12px" }}>
                Links
              </h2>
              <p>
                <a href="mailto:jvastbinder513@gmail.com" style={{ marginRight: "16px", color: "#0066cc" }}>
                  Email
                </a>
                <a href="https://linkedin.com/in/joel-vastbinder/" style={{ marginRight: "16px", color: "#0066cc" }}>
                  LinkedIn
                </a>
                <a href="https://github.com/joelvastbinder" style={{ color: "#0066cc" }}>GitHub</a>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
