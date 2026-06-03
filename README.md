# Atlas.AI 🌍
 
> An AI-powered full-stack web application builder — from idea to deployed app in minutes.

Atlas.AI is not just another AI code generator. It **researches your idea first**, builds a **visual plan you can edit**, then generates production-ready code using a **squad of specialized AI agents** — all the way to one-click deployment.
 
---

## What Makes Atlas Different

| Feature | Atlas.AI | Bolt.new | v0.dev | Lovable |
|---|---|---|---|---|
| Research phase before building | ✅ | ❌ | ❌ | ❌ |
| Visual Intent Graph spec editor | ✅ | ❌ | ❌ | ❌ |
| Pre-build Risk Radar | ✅ | ❌ | ❌ | ❌ |
| Multi-agent parallel code generation | ✅ | ❌ | ❌ | ❌ |
| Complexity tiers (Basic → Pro) | ✅ | ❌ | ❌ | ❌ |
| Forkable App DNA blueprints | ✅ | ❌ | ❌ | ❌ |
| AI usability simulation testing | ✅ | ❌ | ❌ | ❌ |

---

## How It Works

```
User describes idea
       ↓
Atlas researches competitors, features, tech stack
       ↓
Blueprint generated (pages, features, API routes, DB tables)
       ↓
User edits the plan visually (Intent Graph)
       ↓
Risk Radar flags security, cost, compliance issues
       ↓
5 AI agents generate code in parallel (Frontend, Backend, Schema, Security, Tests)
       ↓
Coordinator agent reconciles all outputs
       ↓
One-click deploy to Vercel + GitHub
       ↓
AI personas simulate real users and report UX issues
```

---

## Features

### ✅ Built So Far
- **Research Engine** — AI researches your idea: competitors, features, tech stack, pitfalls, build time estimate
- **Project Foundation** — Next.js 14 app with Supabase auth + database fully connected
- **Database Schema** — All tables created: projects, blueprints, risk reports, generated files, deployments, simulations

### 🔨 In Progress
- **Blueprint Generator** — Structured JSON plan (pages, features, API routes, DB tables) that users can edit
- **Blueprint Editor UI** — Add, edit, delete items from the plan before building

### 📋 Planned
- **Intent Graph** — Visual node-based spec editor using ReactFlow
- **Risk Radar** — Pre-build security, cost, compliance, accessibility audit
- **App DNA** — Forkable public blueprints marketplace
- **Multi-Agent Build Squad** — 5 parallel AI agents generating frontend, backend, schema, security, tests
- **Complexity Dial** — Visual tier slider (Basic → Standard → Pro) with live diff
- **One-Click Deploy** — GitHub repo creation + Vercel deployment pipeline
- **Atlas Studio** — Split-screen Monaco editor + live preview + AI chat
- **Live User Simulation** — AI personas test your deployed app with Playwright

---

## App Tiers

### Tier 1 — Basic
Static HTML + CSS + JS. No backend, no database.
Best for: landing pages, portfolios, simple tools.
Hosting cost: **$0/month**

### Tier 2 — Standard
Next.js + Supabase + REST API + user auth + image uploads.
Best for: SaaS MVPs, internal tools, marketplaces.
Hosting cost: **~$0–25/month**

### Tier 3 — Pro
Next.js + tRPC + PostgreSQL + Redis + Stripe + WebSockets + RBAC.
Best for: production SaaS, enterprise tools.
Hosting cost: **~$50–200/month**

---

## Tech Stack

### Atlas Platform (this app)
| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | JavaScript |
| Styling | Tailwind CSS |
| UI Components | Shadcn/ui (Radix) |
| AI | Groq API (llama-3.3-70b) |
| Auth + Database | Supabase |
| Visual Graph Editor | ReactFlow |
| Code Editor | Monaco Editor |
| Job Queue | BullMQ + Redis |
| Payments | Stripe |
| Email | Resend |
| Deployment | Vercel |

### Generated Apps (what Atlas builds)
| Tier | Stack |
|---|---|
| Tier 1 | HTML + CSS + Vanilla JS |
| Tier 2 | Next.js + Tailwind + Supabase + Prisma |
| Tier 3 | Next.js + tRPC + PostgreSQL + Redis + Stripe |

---

## Getting Started

### Prerequisites
- Node.js 20+
- A Supabase account (free) — [supabase.com](https://supabase.com)
- A Groq API key (free) — [console.groq.com](https://console.groq.com)

### Installation

**1. Clone the repo**
```bash
git clone https://github.com/YOUR_USERNAME/atlas-ai.git
cd atlas-ai
```

**2. Install dependencies**
```bash
npm install
```

**3. Set up environment variables**

Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in your keys:
```env
# AI (free at console.groq.com)
GROQ_API_KEY=gsk_your_key_here

# Supabase (free at supabase.com)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**4. Set up the database**

Go to your Supabase project → SQL Editor → run the schema from `database/schema.sql`.

**5. Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
atlas-ai/
├── app/
│   ├── (auth)/           # Login + signup pages
│   ├── (app)/            # Authenticated pages (dashboard, projects)
│   │   ├── dashboard/
│   │   ├── project/
│   │   └── dna/
│   ├── api/              # Backend API routes
│   │   ├── research/     # ✅ Research engine
│   │   ├── blueprint/    # 🔨 Blueprint generation
│   │   ├── risk/         # 📋 Risk Radar
│   │   ├── generate/     # 📋 Multi-agent code generation
│   │   └── deploy/       # 📋 Deployment pipeline
│   ├── layout.js
│   └── page.js           # ✅ Landing + research UI
├── components/
│   ├── ui/               # Shadcn components
│   ├── blueprint/        # Blueprint editor + Intent Graph
│   ├── generate/         # Build Squad progress UI
│   ├── studio/           # Monaco editor + preview
│   └── deploy/           # Deployment status
├── lib/
│   ├── supabase/         # ✅ Supabase clients (browser + server)
│   ├── claude/           # AI client + agent functions
│   └── queue/            # BullMQ workers
├── proxy.js              # Route protection middleware
├── .env.example          # ✅ Environment variable template
└── .env.local            # ⛔ Never committed (your real keys)
```

---

## Database Schema

9 tables: `profiles`, `projects`, `blueprints`, `risk_reports`, `generation_runs`, `generated_files`, `app_dna`, `deployments`, `simulation_runs`.

Full schema with RLS policies available in the PRD document.

---

## Research Papers

Atlas.AI is being developed alongside academic research contributions:

| # | Paper Title | Target Venue |
|---|---|---|
| 1 | Specification-Driven Full-Stack Code Generation Using Tiered Complexity Models | ICSE 2026 / FSE 2026 |
| 2 | Intent Graphs: A Visual Formalism for Human-AI Collaborative App Specification | CHI 2026 / UIST 2026 |
| 3 | Multi-Agent Code Synthesis: Decomposing Full-Stack Generation Across Specialized LLM Agents | NeurIPS / ICML 2026 |
| 4 | Research-Augmented Program Synthesis: Using Web Search to Ground LLM App Generation | EMNLP 2025 / ACL 2026 |
| 5 | Evaluating AI-Simulated User Testing for Generated Web Applications | CHI 2026 / CSCW 2026 |

---

## Roadmap

- [x] Project setup + environment
- [x] Supabase auth + database
- [x] Research Engine (AI researches your idea)
- [ ] Blueprint Generator + Editor
- [ ] Intent Graph visual editor
- [ ] Risk Radar
- [ ] App DNA marketplace
- [ ] Multi-Agent Build Squad
- [ ] Complexity Dial
- [ ] One-click GitHub + Vercel deployment
- [ ] Atlas Studio (Monaco + live preview)
- [ ] Live User Simulation (Playwright + AI)
- [ ] Stripe billing
- [ ] Public launch

---

## Contributing

This project is currently in active development. If you'd like to contribute or collaborate on the research papers, open an issue or reach out.

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

<p align="center">Built with Atlas.AI 🌍</p>
