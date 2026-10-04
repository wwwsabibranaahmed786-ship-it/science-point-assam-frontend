# Science Point Assam — Final Split-Origin Frontend Release

This is the deploy-ready, dependency-free Science Point Assam single-page frontend for Cloudflare Pages/static hosting.

## Included

- Public course catalogue and course details
- Student authentication, registration, recovery, profile and security
- Learning context, enrolled courses, notes, protected video, assignments
- Central Exam Centre / CBT with palette, mark-for-review, clear response, objective + subjective answers, autosave, server-deadline timer, reconnect/visibility refresh and submit
- Student results, notifications and purchase history
- Admin control room, analytics, integration audit, students, courses/batches, taxonomy, notes/videos/media
- Question Bank with revisions, archive, objective/subjective support and Assamese/Hindi translations
- Import Centre for CSV/DOCX/PDF batches with validation/commit controls
- Exam Management and question-set builder
- Live attempt monitoring and subjective grading
- Assignments/submissions, announcements, payments/refunds, pricing/coupons, publishing and access/enrollment
- Mobile-responsive navigation and layouts

## Backend contract

The frontend calls the centralized `/api/...` routes implemented by the locked Science Point Assam Worker backend. Browser state is not the authority for authentication, payments, entitlements, exam answers or the CBT timer.

`config.js` controls the API origin:

```js
window.SPA_CONFIG = {
  API_BASE_URL: "https://api.sciencepointassam.com"
};
```

Leave it empty when the frontend and Worker API are exposed on the same origin (for example through a same-origin `/api` proxy or a Worker asset deployment). For a separate API hostname, prefer a same-site HTTPS hostname such as `https://api.sciencepointassam.com` rather than a different-site `workers.dev` origin. The backend uses cookie-based authentication with SameSite protections, so deployment topology matters.

## Deployment / SPA routing

Production uses `https://app.sciencepointassam.com` for the static frontend and `https://api.sciencepointassam.com` for the Worker API. `404.html` is included for GitHub Pages deep-link fallback, while `_redirects` is retained for hosts that support the Cloudflare Pages redirects file. `index.html` and `404.html` use root-relative `/app.js`, `/config.js` and `/site.webmanifest` paths so deep links do not resolve assets relative to `/student/` or `/admin/`.

Upload the contents of this directory as the Pages site output. No npm install or build step is required for this static release.

## Payments

Razorpay Checkout is loaded at runtime from the provider checkout URL only when a student starts payment. The server remains authoritative for quotes, order creation, provider verification and entitlement.

## Protected learning media

The frontend never manufactures protected note/video URLs. It asks the Worker to authorize and release the temporary API-origin URL, then opens/plays it with the session credentials required by the protected media endpoint. The Worker also applies CORS and same-site resource policy to the tokenized media response.

## Deployment checklist

1. Configure the frontend API origin in `config.js`.
2. Ensure the Worker has its D1/R2 bindings and required production secrets configured.
3. Run the backend migrations required for the current database before using upgraded functionality.
4. Test student login and admin login from the deployed frontend.
5. Test one course purchase through a real payment provider in a controlled environment.
6. Test a complete CBT attempt, including refresh/reconnect, subjective answer autosave and submission.
7. Test protected note/video access for both authorized and unauthorized students.
8. Test assignment submissions in text, file and mixed modes, including an unauthorized student's inability to read another student's submission file.
9. Test a direct GitHub Pages deep link such as `/student/exams` and confirm `/app.js` loads from the site root.

## Verification

Run:

```bash
node tests/frontend-static-check.mjs
```

The test is dependency-free and checks syntax, required routes, API contract references, security-sensitive frontend behaviors and release files.
