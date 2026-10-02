# Science Point Assam — Frontend

Production frontend for the Science Point Assam learning/CBT platform.

## Production topology

```text
GitHub Pages
https://app.sciencepointassam.com
        │
        │ HTTPS + credentials
        ▼
Cloudflare Worker
https://api.sciencepointassam.com
        │
        ├── D1
        └── R2
```

## GitHub Pages deployment

1. Publish this repository/directory through GitHub Pages.
2. Configure the custom domain as `app.sciencepointassam.com` in GitHub Pages.
3. Keep the root-level `CNAME` file as the canonical custom-domain file for branch-based Pages publishing; GitHub's UI remains authoritative for the actual Pages configuration.
4. Configure the DNS CNAME for `app` to the GitHub Pages target shown by GitHub.
5. Deploy the backend Worker at `https://api.sciencepointassam.com`.
6. Set the Worker variable `FRONTEND_ORIGIN=https://app.sciencepointassam.com`.
7. Configure all required Worker/D1/R2 secrets, including `MEDIA_ACCESS_SECRET`.

## SPA routing

`404.html` is the GitHub Pages deep-link fallback. All runtime assets are root-relative (`/app.js`, `/config.js`, `/styles.css`, `/site.webmanifest`) so a direct URL such as `/student/exams` does not cause asset requests under `/student/`.

## Security boundary

The browser never uploads directly to R2. Student assignment submissions use the assignment-specific Worker upload route and are bound server-side to the authenticated student's submission. Protected notes/videos use temporary API-origin media URLs and credentialed cross-origin media loading.

## Verification

Run:

```bash
node --check app.js
node tests/frontend-static-check.mjs
```

The release manifest tracks the release contents except the manifest itself (to avoid an impossible self-hash). The release checker validates the GitHub Pages + split-origin contract, including API configuration, root asset paths, 404 fallback, Notes/Videos forms, assignment file flow, protected media, and admin feature routes.
