# Science Point Assam — Backend / Frontend Contract Map

## Authentication

| Frontend capability | Backend route |
|---|---|
| Student login | `POST /api/auth/login` |
| Student logout | `POST /api/auth/logout` |
| Student session | `GET /api/auth/me` |
| Student registration | `POST /api/auth/register` |
| Password reset request | `POST /api/auth/password-reset/request` |
| Password reset confirmation | `POST /api/auth/password-reset/confirm` |
| Change password | `POST /api/auth/change-password` |
| Admin login | `POST /api/admin/login` |
| Admin logout | `POST /api/admin/logout` |
| Admin session | `GET /api/admin/me` |

## Student learning

| Capability | Backend route |
|---|---|
| Dashboard | `GET /api/student/dashboard` |
| Learning context | `GET/PUT /api/student/learning-context` |
| Enrolled courses | `GET /api/student/courses` |
| Course detail | `GET /api/courses/:id` |
| Course batches | `GET /api/courses/:id/batches` |
| Taxonomy tree | `GET /api/taxonomy/tree` |
| Notes | `GET /api/notes` and `GET /api/notes/:id` |
| Open protected note | `POST /api/notes/:id/open` |
| Videos | `GET /api/videos` and `GET /api/videos/:id` |
| Start playback | `POST /api/videos/:id/play` |
| Video progress | `PUT /api/videos/:id/progress` |
| Assignments | `GET /api/assignments` and `GET /api/assignments/:id` |
| Assignment submission | `POST /api/assignments/:id/submit` |

## CBT / results

| Capability | Backend route |
|---|---|
| Published exams | `GET /api/exams` |
| Start attempt | `POST /api/exam-centre/start` |
| Attempt state | `GET /api/exam-centre/attempts/:id` |
| Save answer | `PUT /api/exam-centre/attempts/:attempt/questions/:question/answer` |
| Save current question | `PUT /api/exam-centre/attempts/:attempt/progress` |
| Submit attempt | `POST /api/exam-centre/attempts/:id/submit` |
| Student results | `GET /api/results` |
| Result detail | `GET /api/results/:id` |
| Performance summary | `GET /api/results/performance` |

The exam UI uses the server-provided `ends_at`/`seconds_remaining` and re-fetches state after reconnect/visibility changes. Browser-local countdown state is not treated as authoritative.

## Admin

The admin UI follows the backend's centralized services for courses, taxonomy, content, Question Bank, import, exams, results, notifications, payments, pricing, publishing, access and platform control. Server-side authorization remains authoritative even when the frontend hides or disables an action.

## Configuration / cookies

The backend uses cookie-based sessions. Separate-site frontend/API deployments can break cookie delivery because of SameSite policy. Use same-origin or same-site HTTPS deployment topology and verify it in the browser before production traffic.


## Split-origin production contract

- Frontend origin: `https://app.sciencepointassam.com`
- API origin: `https://api.sciencepointassam.com`
- Browser API requests use `credentials: include`.
- Backend CORS permits only the exact frontend origin for credentialed requests.
- Browser mutations require the exact frontend `Origin`; payment provider webhooks are server-to-server and are exempt from this browser-origin gate while retaining provider signature verification and webhook idempotency.
- Protected media URLs are API-origin URLs and are consumed with session credentials.
- Assignment submissions may contain text, a validated document file, or both according to the server-owned `answer_mode`.
