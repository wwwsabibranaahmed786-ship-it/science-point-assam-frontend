import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = new URL("..", import.meta.url);
const path = name => new URL(name, ROOT).pathname;
const app = await readFile(path("app.js"), "utf8");
const html = await readFile(path("index.html"), "utf8");
const config = await readFile(path("config.js"), "utf8");
const css = await readFile(path("styles.css"), "utf8");
const redirects = await readFile(path("_redirects"), "utf8");
const notFound = await readFile(path("404.html"), "utf8");
const readme = await readFile(path("README.md"), "utf8");

function assert(condition, message) {
  if (!condition) throw new Error(`FAIL: ${message}`);
  console.log(`PASS: ${message}`);
}

const syntax = spawnSync(process.execPath, ["--check", path("app.js")], { encoding: "utf8" });
assert(syntax.status === 0, "app.js syntax");

for (const file of ["index.html", "404.html", "config.js", "styles.css", "_redirects", "README.md", "docs/BACKEND-FRONTEND-CONTRACT.md"]) {
  await readFile(path(file));
  console.log(`PASS: release file ${file}`);
}

for (const route of [
  'state.route==="/"', 'state.route==="/courses"', 'state.route==="/login"',
  'state.route==="/register"', 'state.route==="/student"', 'state.route==="/student/exams"',
  'state.route==="/student/results"', 'state.route==="/student/notifications"',
  'state.route==="/admin"', 'state.route==="/admin/question-bank"',
  'state.route==="/admin/question-import"', 'state.route==="/admin/exams"',
  'state.route==="/admin/results"', 'state.route==="/admin/payments"',
  'state.route==="/admin/settings"'
]) assert(app.includes(route), `route ${route}`);

for (const api of [
  '/api/auth/login', '/api/auth/me', '/api/auth/register',
  '/api/student/dashboard', '/api/student/learning-context',
  '/api/courses', '/api/taxonomy/tree', '/api/exams',
  '/api/exam-centre/start', '/api/exam-centre/attempts/',
  '/api/results', '/api/notifications', '/api/purchases',
  '/api/admin/students', '/api/admin/courses', '/api/admin/course-batches/',
  '/api/admin/questions', '/api/admin/import/upload', '/api/admin/exams',
  '/api/admin/results', '/api/admin/assignments', '/api/admin/announcements',
  '/api/admin/payments', '/api/admin/refunds', '/api/admin/pricing/products',
  '/api/admin/pricing/coupons', '/api/admin/publishing',
  '/api/admin/control-center/settings'
]) assert(app.includes(api), `backend contract ${api}`);

assert(config.includes('API_BASE_URL') && config.includes('https://api.sciencepointassam.com'), "production API base configuration");
assert(app.includes('credentials:"include"'), "cookie credentials included on API requests");
assert(app.includes('cache:"no-store"'), "authenticated/API responses requested without cache");
assert(app.includes('translation_as_question_text') && app.includes('translation_hi_question_text'), "structured Assamese/Hindi Question Bank translations");
assert(app.includes('body.translations='), "translation payload sent as backend array contract");
assert(app.includes('data-edit-id'), "admin edit state supported");
assert(app.includes('course-batches/${editId}'), "batch edit uses backend PATCH contract");
assert(app.includes('control-center/settings') && app.includes('settings:[{key:form.dataset.key,value:data.value}]'), "control-centre settings uses collection PATCH contract");
assert(app.includes('dataset.deadline') && app.includes('Date.parse(paper.dataset.deadline)'), "CBT timer is tied to server deadline");
assert(app.includes('document.visibilityState') || app.includes('document.hidden'), "CBT refreshes on visibility changes");
assert(app.includes('window.addEventListener("online"'), "CBT refreshes after reconnect");
assert(app.includes('target="_blank" rel="noopener noreferrer"'), "external links get opener protection");
assert(app.includes(`const safe=safeUrl(raw)`) && app.includes(`disabled-link`), "backend-controlled navigation URLs are sanitized before href");
assert(app.includes('u.origin === location.origin') && app.includes('u.protocol === "https:"'), "media/navigation URL allowlist is restricted");
assert(app.includes("safeApiUrl") && app.includes("API_ORIGIN"), "protected media URLs resolve against the API origin");
assert(app.includes('crossorigin="use-credentials"'), "protected video requests include credentials");
assert(app.includes('submission_file') && app.includes("FormData"), "assignment file submission transport exists");
assert(app.includes("data-answer-mode") && app.includes("ANSWER_REQUIRED") === false, "assignment answer mode UI is present");
assert(app.includes('questionImage?`<img'), "unsafe question image URLs are not rendered as empty src");
assert(app.includes('el.dataset.actionBusy === "1"'), "action double-submit guard exists");
assert(app.includes('const attempt=Number(paper?.dataset.attempt||0)') && app.includes('const routeAtType=state.route'), "debounced CBT subjective autosave captures attempt context");
assert(redirects.includes('/*    /index.html   200'), "SPA fallback configured for Cloudflare Pages-compatible hosts");
assert(notFound.includes('src="/app.js"') && notFound.includes('src="/config.js"'), "GitHub Pages 404 SPA fallback uses root-relative assets");
assert(html.includes('src="/app.js"') && html.includes('src="/config.js"') && html.includes('href="/site.webmanifest"'), "index.html uses root-relative assets");
assert(readme.includes('same-site HTTPS') && readme.includes('cookie-based authentication'), "deployment cookie topology documented");
assert(css.includes('.course-cover img{'), "course cover images styled");
assert(!/https?:\/\/[^\s"'`]+workers\.dev/.test(config), "no hard-coded worker.dev API origin in production config");

console.log("\nFRONTEND STATIC CHECK PASS");
