# NCPOR Polar Outreach and Knowledge Portal

Integrated Polar Science Outreach, Knowledge Repository and Media Dissemination Portal for the **National Centre for Polar and Ocean Research (NCPOR)**, Ministry of Earth Sciences, Government of India.

## Quick Start

```bash
# 1. Install dependencies
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
npm install

# 2. Seed the database (creates SQLite file with sample data)
cd backend && node prisma/seed.js && cd ..

# 3. Start both servers
npm run dev
# Or individually:
cd backend && npm run dev    # http://localhost:3000
cd frontend && npx vite      # http://localhost:5173
```

## Default User Accounts (password: `password123`)

| Email | Role | Permissions |
|-------|------|-------------|
| admin@ncpor.gov.in | Super Admin | Full access — users, settings, all content, analytics |
| editor@ncpor.gov.in | Editor | Create/edit/approve/publish all content types |
| outreach@ncpor.gov.in | Outreach Manager | Content Studio, social media drafts, approve posts, news/events |
| contributor@ncpor.gov.in | Contributor | Create and edit drafts (cannot approve or publish) |
| reviewer@ncpor.gov.in | Reviewer | Read-only admin access, can leave review comments |

## Tech Stack

- **Frontend**: React 18, Vite, React Router, Tailwind CSS 3, React Query, react-i18next
- **Backend**: Node.js, Express, sql.js (SQLite), JWT auth (httpOnly cookies), bcrypt, Zod
- **Database**: SQLite (local file, no Docker needed)
- **No Docker required** — runs entirely locally

## Project Structure

```
ncpor-polar-portal/
  frontend/               React + Vite application
    src/
      api/                API client with auto token refresh
      components/layout/  TopBar, Footer
      i18n/               English and Hindi translations
      layouts/            PublicLayout, AdminLayout
      pages/public/       All public pages
      pages/admin/        Dashboard, ContentStudio, Login
  backend/                Express API server
    src/
      config/             Environment, database setup
      routes/             All API routes (/api/v1/*)
      middleware/         Auth, errors
    prisma/seed.js        Database seeding script
    data/                 SQLite database file (auto-created)
```

## API Endpoints

All routes under `/api/v1/`:

| Endpoint | Description |
|----------|-------------|
| `POST /auth/login` | Login with JWT cookies |
| `POST /auth/register` | Register new user |
| `GET /expeditions` | List published expeditions (filterable) |
| `GET /expeditions/:slug` | Expedition detail with linked data |
| `GET /datasets` | Dataset catalogue with search/filter |
| `GET /datasets/:slug` | Dataset detail with metadata |
| `GET /publications` | Publication list with search/filter |
| `GET /publications/:id/bibtex` | BibTeX export |
| `GET /publications/:id/ris` | RIS export |
| `GET /media` | Media gallery items |
| `GET /news` | News articles |
| `GET /events` | Events list |
| `GET /events/export/ical` | iCal calendar export |
| `GET /education` | Education resources |
| `GET /education/glossary` | Glossary terms |
| `POST /education/questions` | Submit question (moderated) |
| `GET /search?q=term` | Global search across all content |
| `GET /stats` | Public counts |
| `GET /stats/admin` | Admin analytics |
| `POST /studio/generate` | Generate content drafts |
| `PUT /studio/content/:id/approve` | Approve generated content |
| `POST /studio/schedule` | Schedule post |

## Content Studio

The Content Studio generates ready-to-publish content from any portal record:

1. Select a source (expedition, dataset, publication, event, news)
2. System generates drafts for 8 platforms (Website, Press Release, Facebook, X/Twitter, Instagram, LinkedIn, YouTube, Newsletter) in English and Hindi
3. **Template-based fallback** works with no API key
4. **Fact guard** highlights every number and date traced to source fields
5. All drafts labelled "Draft: needs human review"
6. Outreach Manager must approve before publishing

## Workflow States

All content follows: `DRAFT` → `IN_REVIEW` → `APPROVED` → `PUBLISHED` → `ARCHIVED`

## Connecting an External LLM

Set environment variables in `backend/.env`:
```
LLM_PROVIDER=openai
LLM_API_KEY=your_key
LLM_MODEL=gpt-4
```
The template fallback works without any API key configured.
