# Backend ↔ Frontend Production Contract

## Origins

- Frontend: `https://app.sciencepointassam.com`
- API: `https://api.sciencepointassam.com`
- Frontend sends credentialed fetches.

## Media

Protected media URLs must be API-origin URLs. The frontend rejects a protected media URL whose final origin is not the API origin. Protected video uses `crossorigin="use-credentials"`.

## Assignments

Student answer modes: `text`, `file`, `mixed`. Legacy `text_or_file` is normalized to `mixed`. Students upload through `/api/assignments/:id/submission-file`; the frontend never posts a raw `submission_file_key` to `/submit`. Submission review uses the admin submission detail endpoint.

## Admin content

Notes and Videos are opened through the existing `content:Notes` and `content:Videos` modal definitions. Note type is `note` (not `notes`).

## Pricing

Frontend covers pricing products, offers and coupons through their dedicated admin endpoints and state actions.

## Notifications

Frontend uses the announcement contract (`announcement_type`, `audience_type`, `audience_ids`, `channels`, scheduling, priority 0–100) and the separate validate/materialize/dispatch/state actions.

## GitHub Pages

The release contains `404.html`, `CNAME`, and root-relative runtime asset paths. `_redirects` and `_headers` are intentionally not required for the production GitHub Pages path.

## Release manifest
The frontend release manifest intentionally excludes its own file from the hash list because a self-referential SHA-256 cannot be stable.
