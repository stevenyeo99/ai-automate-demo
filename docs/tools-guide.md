# Tools Guide

## Runtime

- Node.js >= 18
- npm (bundled with Node.js)

## Local Development

- Install dependencies:
  - `npm install`
- Start in production mode:
  - `npm run start`
- Start in development (auto-reload for WSL):
  - `npm run dev`

## Environment

- Copy `.env.example` to `.env` and adjust values.
- `PORT` is used by `src/bin/www`.
- `CORS_ORIGIN` controls allowed origins for CORS.
- `LOG_FORMAT` controls morgan output.
- `IMAP_HOST`, `IMAP_PORT`, `IMAP_USER`, `IMAP_PASSWORD`, `IMAP_TLS` configure Outlook IMAP.
- `IMAP_IMPORT_BASE_DIR` controls where message folders are written.
- `IMAP_IMPORT_LIMIT` controls how many unseen emails are imported per run.

## Common Commands

- `npm run start`: Run the HTTP server.
- `npm run dev`: Run with nodemon and WSL-friendly watch.
- `npm run lint`: Run ESLint.
