# Claims Tracker

A web app that helps dental and medical billing staff track insurance claims from submission to payment, manage denials, and work aging AR.

> **Status:** Planning (Unit 11). MVP due end of Unit 12; full release due end of Unit 14.

## Problem
Billing teams track denials and follow-ups across spreadsheets and payer portals. Claims age past filing limits and revenue is lost. Claims Tracker keeps every claim, its status, and its next step in one place.

## Target Users
AR specialists and billing coordinators at small to mid-size dental and medical practices.

## Core Features
- **Claim management:** add, update, search, and filter claims
- **AR aging dashboard:** 0–30, 31–60, 61–90, and 90+ day buckets
- **Denial tracking:** denial codes, notes, and follow-up tasks with due dates
- **AI denial assistant:** plain-language denial explanations, next steps, and draft appeal letters

## Planned Tech Stack
| Layer | Technology |
|-------|------------|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js, Express |
| Database | PostgreSQL (Google Cloud SQL) |
| AI | LLM API called from the backend |
| Testing | Jest, Supertest |
| Containers | Docker |
| CI/CD | GitHub Actions |
| Hosting | Google Cloud Run |

## Getting Started (coming in Sprint 1)
```bash
git clone git clone https://github.com/Londyn03/claims-tracker-final.git
cd claims-tracker-final
npm install
cp .env.example .env   # add DATABASE_URL and AI_API_KEY
npm run dev
```

## Project Links
- Jira board: <paste Jira URL>
- Confluence space: <paste Confluence URL>

## Data Privacy
This project uses fictional demo data only. No real patient information (PHI) is stored or sent to any API.# claims-tracker-final
Web app for tracking dental and medical insurance claims, denials, and AR aging.
