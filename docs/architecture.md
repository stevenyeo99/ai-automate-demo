# Architecture

## Overview

This service follows a simple, production-ready Express layout with a clear request flow:

routes -> controllers -> services (optional)

## Folder Structure

- src/bin/www: Server bootstrap and HTTP listener.
- src/app.js: Express app configuration and middleware.
- src/routes: Request routing and input mapping.
- src/controllers: Request orchestration and HTTP responses.
- src/services: Business logic or external integrations.
- src/services/imapImportService.js: IMAP unseen import service.

## Request Flow

1. A request hits a route in `src/routes`.
2. The route forwards to a controller in `src/controllers`.
3. The controller invokes a service in `src/services` if needed.
4. The controller sends the HTTP response.

## Configuration

- Environment variables are loaded in `src/bin/www` via dotenv.
- Defaults are documented in `.env.example`.

## Error Handling

- 404 handler returns JSON for unmatched routes.
- Error handler returns JSON with stack traces in non-production environments.

## Observability

- HTTP logs: morgan (`LOG_FORMAT`).
- Health endpoint: `GET /health`.
## IMAP Import

- Service entry: `importUnseenEmails()` in `src/services/imapImportService.js`.
- Imports UNSEEN messages from Outlook IMAP in oldest-first order.
- Saves each message body to `{IMAP_IMPORT_BASE_DIR}/{year}/{month}/{day}/{messageId}/content.md` and marks as seen.
