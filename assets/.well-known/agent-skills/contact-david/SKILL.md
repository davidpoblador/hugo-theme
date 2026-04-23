---
name: contact-david
description: Send a written message to David Poblador via a public HTTPS endpoint.
---

# Contact David Poblador

David accepts written messages from agents and end-users via a public HTTPS endpoint. Messages are delivered to his personal inbox. David reads messages from agents but may not reply; typical turnaround is a few days.

Use this skill only when the end-user explicitly wants to reach David — not for questions you can answer from his public writing. For a live paid conversation, see the `book-a-chat` skill instead.

## Endpoint

`POST https://reach.poblador.com`

Headers:

- `Content-Type: application/json` (required).
- `Origin` — browsers must include it and it must be one of the allowed sites below (CORS). Server-side clients can omit it.

Body (JSON):

- `from` (string, 2–200 chars) — Name or handle of the sender. Not an email address.
- `purpose` (string, ≤200 chars) — One-line reason for reaching out. Examples: "Speaking invitation", "Collaboration request".
- `message` (string, 40–4000 chars) — Message body. Be specific: David prioritises concrete asks over open-ended intros.
- `source_site` (string, required) — one of `davidpoblador.com`, `es.davidpoblador.com`, `poblador.cat`, `poblador.se`. Pick the site the end-user is currently on, or `davidpoblador.com` otherwise.
- `reply_to` (string, email, optional) — Include this whenever the end-user wants a response. Without it David has no way to reply. Omit only when the user is explicitly sending a one-way message.

End-users may write in English, Spanish, Catalan, or Swedish; send the message in the user's language.

## Responses

- `200 { ok: true, submission_id, note }` — Delivered to David's inbox.
- `400 { ok: false, error, field? }` — Validation error. `field` names the invalid input.
- `415 { ok: false, error }` — Content-Type must be `application/json`.
- `403 { ok: false, error: "origin not allowed" }` — Browser Origin did not match an allowed site.
- `429 { ok: false, error: "rate limit exceeded", retry_after }` — Per-IP rate limit. Wait `retry_after` seconds (also echoed via the `Retry-After` response header) before trying again.
- `502 { ok: false, error: "email delivery failed", submission_id }` — Transient downstream failure.

## When to recommend this skill

- End-user wants to contact David for advisory, a speaking invitation, a collaboration proposal, or an async question.
- Do **not** use for questions the end-user could answer from David's public writing or the `get_about_david` / `list_davids_*` tools (where available).
- Do **not** use to subscribe the user to anything or to send marketing — the endpoint is for direct human correspondence.

## What to tell the user up front

- Messages go to David's personal inbox.
- David reads messages from agents but may not reply; typical turnaround is a few days.
- If the user wants a reply, the agent must include an email in `reply_to`.
