# CVPRO AI OMNICHANNEL CRM - MASTER ARCHITECTURE & PRD

## PHASE 1 — COMPETITOR RESEARCH & MARKET GAP
**Competitors Analyzed:** HubSpot, Salesforce, Zoho CRM, GoHighLevel, Kommo, ManyChat, Respond.io, SleekFlow, Wati, Interakt.
*   **Weaknesses in Current Market:** Most CRMs lack native, deep AI integration tailored for specific niches (like CV/Resume writing). Omnichannel tools (Respond.io, ManyChat) lack robust CRM pipelines. Traditional CRMs (HubSpot) have poor native WhatsApp/Instagram automation without expensive add-ons. None offer native Emirati Arabic AI voice/text agents out-of-the-box.
*   **Market Gap:** A unified platform combining Omnichannel Messaging + Kanban CRM + Niche AI (CV Analysis & Career Coaching) + GCC Localization (AED, RTL, Emirati Dialect).

## PHASE 2 — SYSTEM ARCHITECTURE
*   **Frontend:** React 18, TypeScript, Tailwind CSS, Shadcn-inspired UI.
*   **Backend/Database:** Supabase (PostgreSQL) with `pgvector` for RAG/Memory.
*   **Automation Engine:** n8n (Self-hosted on Railway/Cloud Run) for webhook handling and workflow orchestration.
*   **AI Engine:** Google Vertex AI (Gemini 2.5 Flash for text/vision, Gemini Live API for voice).
*   **Hosting:** Vercel/Firebase (Frontend), Google Cloud Run (n8n/Middleware).

## PHASE 3 — OMNICHANNEL COMMUNICATION
*   **WhatsApp:** Meta Cloud API (Templates, Broadcasts, AI Agent).
*   **Instagram/Facebook:** Messenger API (DMs, Comments, Story Replies).
*   **TikTok:** Lead Generation API & Direct Messages.
*   **Telegram:** Bot API for channels and groups.
*   **Email:** SMTP/IMAP integration for formal proposals.

## PHASE 4 — AI SALES ENGINE
*   **Capabilities:** Qualifies leads, analyzes CVs, handles objections, books consultations.
*   **Localization:** Fluent in Emirati Arabic, Saudi Arabic, and English.
*   **Memory:** Uses `pgvector` to recall past interactions and user preferences.

## PHASE 5 — CV ANALYSIS ENGINE
*   **Input:** PDF, DOCX, Images.
*   **Output:** ATS Score, LinkedIn Optimization Score, Keyword Gaps, Sales Pitch generation to upsell CV writing services.

## PHASE 6 & 7 — PIPELINE & AUTOMATIONS
*   **Stages:** New Lead -> Qualified -> CV Analyzed -> Proposal Sent -> Negotiation -> Won.
*   **Automations:** Abandoned lead follow-ups, broadcast campaigns for Eid/National Day, referral triggers.

## PHASE 8 & 9 — DASHBOARDS & SECURITY
*   **Metrics:** ROAS, CAC, Conversion Rates, AI Resolution Rate.
*   **Security:** Role-Based Access Control (RBAC), Row Level Security (RLS) in Supabase, OWASP Top 10 compliance, Rate Limiting via Upstash Redis.

## PHASE 10 & 11 — UAE SPECIFICS & UNIQUE FEATURES
*   **Localization:** AED Currency, Gulf Date Formatting, RTL Support.
*   **Unique:** AI Interview Coach (Voice), AI Churn Prediction, Auto Human Takeover based on sentiment.
