

# 🎙️ AI Tutor Screener

A full-stack, voice-activated AI screening tool built for the **Cuemath AI Builder Challenge**. 

[cite_start]This application conducts automated, conversational interviews with prospective math tutors and evaluates them on critical soft skills (clarity, patience, warmth, and the ability to simplify complex concepts)[cite: 307, 308, 311].

### 🔗 Quick Links
* **Live Application:** [https://cuemath-ai-screener.vercel.app/] (use chrome browser)
* **Video Walkthrough:** [https://www.loom.com/share/817dd1a06d5344c8a97a9325429b4df7]

---

## 🛠️ Tech Stack
* **Frontend:** Next.js (React), Tailwind CSS
* **Backend / AI Engine:** Meta Llama 3.1 (8B) via Groq API
* **Deployment:** Vercel

---

## 🧠 Architecture & Engineering Decisions

As an AI/NLP systems developer, I focused heavily on ensuring the evaluation output was objective, strictly structured, and highly available.

### 1. The Groq Migration (High Availability)
The application was initially prototyped using Google's Gemini API on the free tier. During stress testing, the backend encountered severe rate-limiting and `503 Server Overloaded` errors. Knowing that a recruitment screener must be highly available, I executed a live migration to run **Meta's Llama 3.1 model on Groq's custom inferencing hardware**. This pivot eliminated latency and ensured lightning-fast conversational interactions.

### 2. Zero-Hallucination Evaluation (Prompt Engineering)
A major challenge with smaller open-source LLMs is their tendency to "hallucinate" positive quotes or deviate from strict grading rubrics. To solve this:
* **Temperature Control:** The evaluation endpoint runs at `temperature: 0.1` to strip out creativity and enforce strict, analytical grading.
* [cite_start]**Strict JSON Enforcement:** The model is constrained to output pure JSON, extracting exact, word-for-word quotes from the transcript to justify its scoring[cite: 320]. 

### 3. Security First
All LLM inferences are executed strictly on the server-side. [cite_start]API keys are managed securely via environment variables and are completely hidden from the browser and public repositories[cite: 348].

---

## 🚀 Running Locally

To run this application on your own machine:

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/YourUsername/cuemath-ai-screener.git](https://github.com/YourUsername/cuemath-ai-screener.git)
   cd cuemath-ai-screener

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
