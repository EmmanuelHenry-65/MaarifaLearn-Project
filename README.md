<div align="center">

# 📚 Maarifa Learn

**AI-powered learning, built for Kenya's Competency-Based Curriculum.**

*Maarifa* — Swahili for "knowledge"

[![Stack](https://img.shields.io/badge/stack-React%2019%20%2B%20TypeScript-0891b2)](#tech-stack)
[![Backend](https://img.shields.io/badge/backend-Supabase-3ecf8e)](#tech-stack)
[![AI](https://img.shields.io/badge/AI-OpenAI%20%2B%20RAG-412991)](#how-it-works)
[![Status](https://img.shields.io/badge/status-live%20pilot-brightgreen)](#-live-demo)

[Live demo](https://maarifalearn-q88b.onrender.com) · [Report an issue](../../issues) · [Roadmap](#-roadmap)

</div>

---

## The problem

Kenya's shift to Competency-Based Education (CBE) asks a lot of Grade 10 students — but personalized academic support is scarce, official study material is scattered across PDFs and photocopies, and one-size-fits-all tutoring doesn't adapt to what a student has already learned, where they're stuck, or how fast they're progressing.

## What Maarifa Learn does about it

Maarifa Learn puts a Kenyan Grade 10 student's entire academic life in one place — and makes the AI in it actually *know* the curriculum, not just guess at it:

| | |
|---|---|
| 🧑‍🏫 **A Socratic AI Tutor** | Guides students toward answers with hints and questions instead of just handing over the solution — and shows exactly which official document it grounded each answer in. |
| 📝 **Real exam practice** | Interactive quizzes auto-grade instantly; short-answer and essay questions get a genuine AI grading pass against the real marking scheme. |
| 📄 **Authentic paper mode** | Download the real past paper, complete it on paper like the real exam, upload a photo — get it AI-marked against the official scheme. |
| 📊 **Progress that's actually real** | Every streak, mastery score, and "topics completed" number is computed from real study activity — never a placeholder. |
| 🗂️ **A living resource library** | Curriculum notes, pamphlets, and videos across all 9 subjects, searchable and downloadable. |
| 🔔 **Smart study planning** | A real task planner with due-date reminders and achievement tracking. |

---

## How it works

The part that makes the AI Tutor trustworthy rather than a generic chatbot is **Retrieval-Augmented Generation (RAG)**: every answer is anchored to real curriculum content, not just the model's general training knowledge.

```
Student asks a question
        │
        ▼
Question is converted into a numeric "meaning fingerprint" (embedding)
        │
        ▼
Compared — by MEANING, not keywords — against every chunk of the official
curriculum (already embedded and stored in a vector database, pgvector on
Postgres) and the student's own uploaded material
        │
        ▼
The closest-matching real passages + the student's own grade, progress,
and history are handed to the AI model (OpenAI gpt-5-mini)
        │
        ▼
A grounded, personalized, Socratic answer comes back — with the exact
source document cited underneath it
```

This means a student can ask the AI Tutor to explain *anything in the actual curriculum* and get an answer that's traceable back to a real document — shown live in the app as **"Sourced from"** chips under every reply.

---

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | React 19 + TypeScript + Vite | Fast, type-safe, built on the team's existing UI foundation |
| Styling | Tailwind CSS | Rapid, consistent UI across a fast-moving codebase |
| Backend | Supabase (Postgres + Auth + Storage + Edge Functions) | One platform for database, auth, files, and serverless functions — no infrastructure to manage |
| Database security | Row Level Security on every table | A student's data is protected at the database layer, not just in application code |
| AI | OpenAI `gpt-5-mini` + `text-embedding-3-small` | Chat/reasoning model + embeddings for RAG, chosen after a head-to-head comparison against Gemini |
| Vector search | `pgvector` inside Postgres | No separate vector database to run or pay for |
| Hosting | Render (app) + Supabase (backend) | Simple, fast to deploy, generous free tiers |

---

## Getting started

```bash
git clone <this-repo-url>
cd MaarifaLearn-Project
npm install
cp .env.example .env   # already contains the project's public Supabase URL/key
npm run dev
```

The app runs at `http://localhost:5173` (or the port Vite prints).

### Environment variables

Only two are needed client-side — both safe to be public (they're protected by Row Level Security, not secrecy):

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

Server-side secrets (`OPENAI_API_KEY`, the Supabase **service role** key) live only in **Supabase Edge Function secrets** — never in this repo, never shipped to the browser.

### Building for production

```bash
npm run build   # outputs a single static dist/index.html
```

---

## Database

All schema lives in [`database/schema/`](database/schema), applied in numeric order. Highlights:

- Every public table has **Row Level Security** enabled — a student can only ever read or write their own data, enforced by Postgres itself.
- `knowledge_documents` holds the RAG vector index — official curriculum chunks (`profile_id IS NULL`) alongside each student's own uploads, kept separate by the same security model.
- `get_review_questions()` and column-level grants keep marking schemes and answer keys hidden from students until after they submit.
- See [`database/README.md`](database/README.md) for the full breakdown and the entity relationship diagram.

## Supabase Edge Functions

Four serverless functions in [`supabase/functions/`](supabase/functions) handle everything that needs a secret key or admin-level database access:

| Function | Purpose |
|---|---|
| `ai-tutor-chat` | RAG retrieval + Socratic chat, with source citations |
| `ai-mark-exam` | AI-marks an uploaded "Authentic Paper Exam" against the real marking scheme |
| `ai-grade-attempt` | AI-grades short-answer/essay questions on interactive quiz attempts |
| `delete-account` | Full, permanent account + data deletion, on request |

Deploy with the Supabase CLI: `supabase functions deploy <name>`.

---

## Project structure

```
src/
├── views/         # One feature area per page (Dashboard, Exams, AI Tutor, ...)
├── components/     # Shared and feature-scoped UI pieces
├── services/       # All Supabase/data-access logic — views never call Supabase directly
├── context/        # Auth, theme, achievement-celebration providers
├── hooks/          # Data-fetching hooks
└── data/           # Static curriculum taxonomy (subject names, icons, units)

database/schema/    # Numbered SQL migrations, applied in order
supabase/functions/ # Edge Functions (Deno)
```

---

## 🚧 Roadmap

Built and verified working: authentication, the AI Tutor with RAG + citations, both exam modes with AI marking, study planning, notifications, achievements, and a real resource library.

Honestly not built yet (shown as "coming soon" in the app, never faked):
- A grade/subject onboarding flow for new signups
- Structured, replayable AI-generated quizzes and flashcard decks (today's "Generate Quiz" is a great chat answer, not a saved deck)
- Practice mode and worksheets (no data model yet)
- Google Sign-In is wired up but gated on provider setup per deployment

## Team

Built by a small student team, each owning one feature area on their own branch, merged via Pull Request into `main`.

| Area | Owner |
|---|---|
| Authentication & Database | Emmanuel Henry (project lead) |
| Dashboard | Keisha |
| My Learning | Emmanuel C |
| Resources | Mulenga |
| Past Papers & Exams | Sinethemba |
| Settings | Innocentia |

Technical mentorship: **Bilal Ashfaq**, MBZUAI.

## License

Not yet decided — treat as all rights reserved for now. Reach out before reusing.

---

<div align="center">

*Jifunze. Kuelewa. Kufanikiwa.*
**Learn. Understand. Succeed.**

</div>
