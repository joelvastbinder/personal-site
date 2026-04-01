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
            title="Restyled resume"
          />
        ) : (
          <div
            className="resume-content"
            style={{
              padding: "24px 32px",
              fontFamily: "Georgia, 'Times New Roman', serif",
              color: "#000000",
              fontSize: "16px",
              lineHeight: "1.5",
              maxWidth: "780px",
            }}
          >
            <h1>Joel Vastbinder</h1>
            <p>
              <strong>Indianapolis, IN</strong> |{" "}
              <strong>(260) 797-9634</strong> |{" "}
              <strong>jvastbinder513@gmail.com</strong>{" "}
              <a href="https://linkedin.com/in/joel-vastbinder/">LinkedIn</a> |{" "}
              <a href="https://github.com/joelvastbinder">GitHub</a>
            </p>

            <hr />

            <h3>Summary</h3>
            <p>
              Mission-driven software engineer with 6+ years of engineering
              across full-stack development with a background in Security &amp;
              DevOps. As a Lead Engineer and Certified Product Owner, I played a
              key role in launching an education compliance product that serves
              20+ institutions and 10,000+ students.
            </p>

            <hr />

            <h3>Experience</h3>

            <p>
              <strong>Lead Engineer</strong> |{" "}
              <strong>HarperRand-CALRegional</strong> |{" "}
              <em>Sept 2024 – Present</em>
            </p>
            <ul>
              <li>
                Lead full-stack development of Django/GCP applications,
                including a 0-to-1 product launch for compliance automation
                serving 25k+ students.
              </li>
              <li>
                Lead business process automation projects including 80%
                reduction in Tier 1 support volume via RAG-enabled GenAI chat
                agent and streamlining student enrollment workflows projected to
                save $250k+ annually.
              </li>
            </ul>

            <p>
              <strong>Software Engineer</strong> |{" "}
              <strong>HarperRand-CALRegional</strong> |{" "}
              <em>Jun 2023 – Sept 2024</em>
            </p>
            <ul>
              <li>
                Managed full-stack development and product lifecycle tasks
                within a remote team environment focusing on Django and Google
                Cloud Platform.
              </li>
            </ul>

            <p>
              <strong>IT Solutions Engineer</strong> |{" "}
              <strong>The Oaks Academy</strong> |{" "}
              <em>Sept 2021 – Jun 2023</em>
            </p>
            <ul>
              <li>
                Led business process automation projects with various academic
                and business stakeholders using Python and Google App Scripts,
                saving hundreds of hours of manual document generation yearly.
              </li>
              <li>
                Administered accounts, software, and hardware used by 1000+
                students and 200+ employees.
              </li>
            </ul>

            <p>
              <strong>DevOps Engineer</strong> |{" "}
              <strong>Moser Consulting</strong> |{" "}
              <em>Aug 2020 – Sept 2021</em>
            </p>
            <ul>
              <li>
                Administered a highly available Java/Spring Boot platform
                deployed in Kubernetes with 20+ microservices, facilitating the
                secure distribution of $100M+ in social program benefits to
                500K+ individuals.
              </li>
              <li>
                Elevated observability by implementing new telemetry and
                monitoring for microservices using Elasticsearch, Logstash, and
                Kibana, resulting in a reduction of mean time to resolution
                (MTTR) for critical site reliability issues.
              </li>
              <li>
                Collaborated with cross-functional teams and external
                stakeholders to manage the lifecycle and deployment of 20+
                Microservices across 12+ testing and staging environments,
                minimizing production release risk.
              </li>
            </ul>

            <p>
              <strong>Security Engineer / Consultant</strong> |{" "}
              <strong>Flatiron Health</strong> |{" "}
              <em>Feb 2019 – Aug 2022</em>
            </p>
            <ul>
              <li>
                Developed critical security features for platforms in
                Python/Flask and C#/.NET for data protection and ensuring data
                integrity, securing 3+ million patient records and protecting a
                $2B+ organization with 1000+ employees.
              </li>
              <li>
                Automated provisioning and teardown of non-production
                environments using Terraform on AWS, resulting in secure
                repeatable deployments, cost savings, and reducing
                infrastructure spin-up time from minutes to seconds.
              </li>
            </ul>

            <hr />

            <h3>Education</h3>
            <p>
              <strong>Taylor University</strong> |{" "}
              <strong>BS in Computer Science</strong> | <em>Jan 2019</em>
            </p>
            <ul>
              <li>
                <strong>GPA</strong>: 3.9
              </li>
              <li>
                <strong>Coursework</strong>: Machine Learning, Parallel &amp;
                Distributed Computing, Multi-tier Web App Development
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
