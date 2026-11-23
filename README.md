# Claims Tracker

A web app that helps dental and medical billing staff track insurance claims from submission to payment, log denials, and work aging AR.

> **Status:** MVP complete (Unit 12, Sprint 1). Full release with search/filters, follow-ups, payer reports, and the AI denial assistant is planned for Sprint 2 (Unit 14).

## Project Links
- Jira board: PASTE-JIRA-LINK-HERE
- Confluence space: PASTE-CONFLUENCE-LINK-HERE
- Live app (Google Cloud Run): PASTE-CLOUD-RUN-URL-HERE

> Note: Atlassian's free plan doesn't allow public/anonymous viewing for Jira or Confluence. Happy to add you as a viewer — just reply with the email you'd like me to use.

## MVP Features (Sprint 1)
| Feature | Jira story | Status |
|---------|------------|--------|
| Add a new claim with required-field validation | CT-4 | Done |
| View all claims (newest first, with age in days) | CT-5 | Done |
| Update claim status (Submitted, Pending, Paid, Denied, Appealed) | CT-6 | Done |
| App containerized and deployed to Cloud Run | CT-8 | Deployment attempted |
| AR aging dashboard (0–30, 31–60, 61–90, 90+ days) | CT-32 | Done |
| Log a denial code and notes on a claim | CT-33 | Done |

## Tech Stack
| Layer | Technology |
|-------|------------|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js, Express |
| Data | In-memory store with fictional demo data (PostgreSQL planned for Sprint 2) |
| Testing | Jest, Supertest |
| Containers | Docker |
| CI | GitHub Actions (runs tests on every pull request and push to main) |
| Hosting | Google Cloud Run |

## Project Structure
```
claims-tracker-final/
├── public/              # Frontend (index.html, style.css, app.js)
├── tests/               # Jest + Supertest API tests
├── .github/workflows/   # GitHub Actions CI
├── server.js            # Express API
├── Dockerfile
└── package.json
```

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/claims` | List all claims, newest first |
| POST | `/api/claims` | Add a claim |
| PUT | `/api/claims/:id` | Update a claim's status |
| POST | `/api/claims/:id/denials` | Log a denial code and notes |
| GET | `/api/claims/aging` | Unpaid claims grouped by aging bucket |

## Setup

### Run locally
```bash
git clone https://github.com/Londyn03/claims-tracker-final.git
cd claims-tracker-final
npm install
npm start
```
Open http://localhost:8080

### Run tests
```bash
npm test
```

### Run with Docker
```bash
docker build -t claims-tracker .
docker run -p 8080:8080 claims-tracker
```
Open http://localhost:8080

### Deploy to Google Cloud Run (manual)
```bash
gcloud run deploy claims-tracker --source . --region us-central1 --allow-unauthenticated
```

## Development Workflow
- Each feature was built on its own branch (`feature/claims-api`, `feature/frontend-dashboard`, `feature/docker-ci`, `docs/readme-update`) and merged into `main` through a pull request.
- GitHub Actions runs the test suite on every pull request.

## AI Tool Usage
| Tool | What I used it for |
|------|--------------------|
| Claude (Anthropic) | Generated the starting Express API, frontend, Jest tests, Dockerfile, GitHub Actions workflow, and README draft from my Jira user stories and acceptance criteria |
| Claude (Anthropic) | Planned the Jira epics, user stories, subtasks, and sprints in Unit 11 |

I reviewed and tested all AI-generated code, ran the test suite locally, and adjusted it to match my acceptance criteria.

## Data Privacy
This project uses fictional demo data only. No real patient information (PHI) is stored or sent anywhere.
