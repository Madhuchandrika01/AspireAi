# AspireAI – Your AI-Powered Career Coach

AspireAI is a full-stack **Next.js** application that helps job seekers streamline their career journey with AI assistance. It combines **AI-powered resume and cover letter generation**, **mock interviews**, and **industry insights** into a single, modern web app.


## ✨ Features

### 🧭 Onboarding & Profile
- Guided onboarding flow where users:
  - Select their **industry** (e.g., Tech, Finance, Healthcare, etc.).
  - Provide **experience level** and **key skills**.
- Stores user profile in a PostgreSQL database via **Prisma**.
- Personalized experience based on the selected industry.

### 📄 AI Resume Builder
- Rich **resume editor** with structured sections (summary, experience, skills, etc.).
- Markdown-based editing with live preview.
- Resume content is stored per user in the database.
- Designed to create **ATS-friendly** resumes.

### 📨 AI Cover Letter Generator
- Two-step flow:
  1. **Upload or paste your resume**  
     - Supports **PDF**, **DOCX**, and **TXT** files, or plain text paste.
  2. Enter **job details** (job title, company, job description).
- Uses **Google Gemini** (via `@google/generative-ai`) to generate a tailored cover letter.
- Saves generated cover letters so users can:
  - View previously generated letters.
  - Open an individual cover letter by ID.

### 🎤 Interview Preparation & Mock Interview
- **Interview dashboard** with:
  - Past assessment history.
  - Basic stats and charts showing performance over time.
- **Mock interview page**:
  - AI-generated, industry-specific quiz questions.
  - Users answer questions and get a score.
  - Results are stored as assessments for tracking progress.

### 📊 Industry Insights Dashboard
- Dashboard that shows:
  - Salary ranges and demand levels for key roles in the chosen industry.
  - Market outlook and recommended skills.
- Uses **Gemini**-powered insights with a **strong fallback dataset** stored in the database.
- Background job support via **Inngest** to (re)generate and persist insights.

### 🔐 Authentication & Access Control
- Authentication handled by **Clerk** (`@clerk/nextjs`):
  - Sign in / Sign up pages under `(auth)` routes.
  - Protected routes for:
    - `/dashboard`
    - `/resume`
    - `/interview`
    - `/ai-cover-letter`
    - `/onboarding`
- `middleware.js` ensures only authenticated users can access main app features.

### 🎨 UI & UX
- Built with the **Next.js App Router**.
- Styling with **Tailwind CSS** and reusable **shadcn/ui** components.
- Responsive layout with a fixed header and modern landing page.
- Data visualizations with **Recharts**.
- Toast notifications with **sonner**.
- Light/dark mode via `next-themes`.

---

## 🧰 Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** JavaScript / React
- **Auth:** Clerk (`@clerk/nextjs`)
- **Database:** PostgreSQL with **Prisma**
- **AI Model:** Google Gemini (`@google/generative-ai`)
- **Background Jobs:** Inngest
- **Styling:** Tailwind CSS, shadcn/ui, custom components
- **Charts:** Recharts
- **Form Handling & Validation:** `react-hook-form` + `zod`
- **Notifications:** sonner
