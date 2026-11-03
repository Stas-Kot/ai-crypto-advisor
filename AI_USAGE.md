# AI Usage Summary

This document describes how AI tools were used while building the AI Crypto Advisor.

## Tools used

- **Claude (Anthropic)**: main assistant, used as pair programmer throughout the project.

## How I worked with the AI

I asked for an implementation plan first, then built the project in small steps. After each step I ran the code, checked the result myself (curl requests, the browser, the database UI) and reported back errors, so the next step was based on real output rather than assumptions.

## What the AI helped with

| Backend | Drafted the Express routes (auth, preferences, dashboard, votes), the JWT middleware and the Prisma schema. |
| External APIs | Drafted the service layer for CoinGecko, news, OpenRouter and memes, including caching and fallbacks. |
| Frontend | Drafted the React pages (login, signup, onboarding quiz, dashboard), the auth context and the voting component. |
| Debugging | Helped read error messages and logs (see below). |

## Where the AI's first suggestion did not work, and what I changed

These are real problems found while testing, which required fixing or rethinking:

- **Prisma 7 differences.** The first schema was written for an older Prisma version. Prisma 7 needs a config file and a driver adapter (`@prisma/adapter-pg`), and generates a TypeScript client, so the server runs through `tsx`.
- **CryptoPanic became paid.** The planned news source has no free tier anymore, so the news service uses a static fallback and supports a key through an environment variable.
- **Reddit blocked server requests** (HTTP 403 and HTML challenge pages). Memes now come from `meme-api.com` with a static, local fallback.
- **OpenRouter free models.** The first model returned 404 and another returned 429 (rate limit). I switched to a working free model and added a fallback text, a larger token limit and a check for truncated answers.
- **Deployment fixes.** `tsx` had to move from `devDependencies` to `dependencies` for Render; a file name that differed only in letter case worked on macOS but failed on Vercel's Linux build and had to be renamed; the CORS `CLIENT_URL` must not contain a path.
- **UX issues I noticed myself.** Votes could not be removed once set (added a delete endpoint and toggle behavior), and the dashboard grid showed three cards in the first row and one in the second (changed to a 2x2 layout).

## What I verified myself

- Every endpoint with curl, including error cases (wrong password, missing token, repeated votes).
- That the database stores hashed passwords and that votes are updated instead of duplicated.
- The whole flow on the deployed app: sign up, onboarding, dashboard, voting, page refresh on a deep link.
- A read-only database role for reviewers that can read data but not password hashes or modify anything.

## Notes

All code in this repository was reviewed, run and understood by me before being committed. Secrets are kept in environment variables and are not committed; the repository only contains `.env.example` files.
