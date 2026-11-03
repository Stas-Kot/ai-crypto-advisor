# AI Usage Summary

This document describes how I built the AI Crypto Advisor and how I used AI along the way.

## Tools used

- **Claude (Anthropic)**: used as a guide and pair programmer.

## How I started

I began by reading the assignment and making my own plan before involving any AI:

- **Backend:** Express (Node.js).
- **Frontend:** React with Vite.
- **Features:** registration and login with JWT, an onboarding quiz that saves preferences, a dashboard with four sections, and a feedback (thumbs up/down) endpoint that stores votes.

I started building a first version on my own: an Express server with registration, login (bcrypt and JWT), an onboarding endpoint, a feedback endpoint that stored the section, the vote and a content snippet, and a CoinGecko proxy, plus the first React components for authentication, onboarding and the dashboard. For the database I tried SQLite with Sequelize, simply because I had never used it before and wanted to try it.

## Choosing the database

My original idea was MongoDB, while PostgreSQL is something I have only practiced relatively recently. I talked it through with Claude: the differences between MongoDB and PostgreSQL for this kind of data (users, preferences, votes), and the fact that free hosting such as Render does not keep files between restarts, so a SQLite file would not survive. After that discussion I decided to go with **PostgreSQL** (hosted on Neon) and Prisma as the ORM.

## How I worked with the AI

From that point I worked step by step with Claude. I asked for an implementation plan first, then built the project in small steps. After each step I ran the code, checked the result myself (curl requests, the browser, the database UI) and reported back errors, so the next step was based on real output rather than assumptions.

## What the AI helped with

| Area | How the AI helped |
|---|---|
| Backend | Drafted the Express routes (auth, preferences, dashboard, votes), the JWT middleware and the Prisma schema. |
| External APIs | Drafted the service layer for CoinGecko, news, OpenRouter and memes, including caching and fallbacks. |
| Frontend | Drafted the React pages (login, signup, onboarding quiz, dashboard), the auth context and the voting component. |

## Problems found along the way

These are real problems found while testing, which required fixing or rethinking:

- **Prisma 7 differences.** The first schema was written for an older Prisma version. Prisma 7 needs a config file and a driver adapter (`@prisma/adapter-pg`), and generates a TypeScript client, so the server runs through `tsx`.
- **CryptoPanic became paid.** The planned news source has no free tier anymore, so the news service uses a static fallback and supports a key through an environment variable.
- **Reddit blocked server requests** (HTTP 403 and HTML challenge pages). Memes now come from `meme-api.com` with a static, local fallback.
- **OpenRouter free models.** The first model returned 404 and another returned 429 (rate limit). I switched to a working free model and added a fallback text, a larger token limit and a check for truncated answers.
- **CoinGecko rate limits.** Prices were missing on the deployed app. I checked the Render logs, found HTTP 429 from CoinGecko, and fixed it with a free CoinGecko Demo API key.
- **Deployment fixes.** `tsx` had to move from `devDependencies` to `dependencies` for Render; a file name that differed only in letter case worked on macOS but failed on Vercel's Linux build and had to be renamed; the CORS `CLIENT_URL` must not contain a path.
- **Issues I noticed myself.** Votes could not be removed once set (added a delete endpoint and toggle behavior); the dashboard grid showed three cards in the first row and one in the second (changed to a 2x2 layout); and the dashboard ignored the content types selected in onboarding and always showed all sections, which did not match the assignment (it now shows sections according to the user's choices).

## What I verified myself

- Every endpoint with curl, including error cases (wrong password, missing token, repeated votes).
- That the database stores hashed passwords and that votes are updated instead of duplicated.
- The whole flow on the deployed app: sign up, onboarding, dashboard, voting, page refresh on a deep link.
- Created the fallback memes myself and checked them on the deployed site.
- Created a read-only database role for reviewers and verified that it can read the data but cannot see password hashes or change anything.

## Notes

Secrets are kept in environment variables and are not committed; the repository only contains `.env.example` files.