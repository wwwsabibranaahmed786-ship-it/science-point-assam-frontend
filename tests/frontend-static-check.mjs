import fs from "node:fs";
import path from "node:path";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const read = f => fs.readFileSync(path.join(root, f), "utf8");
const exists = f => fs.existsSync(path.join(root, f));
const assert = (ok,msg) => { if(!ok) throw new Error(`FAIL: ${msg}`); console.log(`PASS: ${msg}`); };

const html = read("index.html");
const app = read("app.js");
const config = read("config.js");
const read404 = read("404.html");
const manifest = read("FRONTEND-RELEASE-MANIFEST.json");

assert(exists("index.html"), "release file index.html");
assert(exists("404.html"), "GitHub Pages SPA fallback 404.html exists");
assert(exists("CNAME"), "GitHub Pages CNAME exists");
assert(!exists("_headers") && !exists("_redirects"), "GitHub Pages release has no Cloudflare Pages-only routing/header artifacts");
assert(exists("styles.css"), "release file styles.css");
assert(exists("config.js"), "release file config.js");
assert(exists("app.js"), "release file app.js");
assert(html.includes('href="/styles.css"'), "index loads styles.css from root");
assert(html.includes('href="/site.webmanifest"'), "index loads root manifest");
assert(html.includes('src="/config.js"'), "index loads root config.js");
assert(html.includes('src="/app.js"'), "index loads root app.js");
assert(!html.includes('./app.js') && !html.includes('./config.js') && !html.includes('./site.webmanifest'), "index has no relative SPA runtime paths");
assert(read404.includes('src="/app.js"') && read404.includes('src="/config.js"') && read404.includes('href="/styles.css"'), "404 uses root-relative SPA assets");
assert(read("CNAME").trim() === "app.sciencepointassam.com", "CNAME matches production frontend origin");
assert(config.includes('API_BASE_URL: "https://api.sciencepointassam.com"'), "production API_BASE_URL is the API origin");
assert(!config.includes("workers.dev"), "production config has no workers.dev endpoint");
assert(app.includes('credentials:"include"'), "API wrapper sends credentials");
assert(app.includes('Cache-Control","no-store'), "API wrapper sends no-store cache directive");
assert(app.includes('/api/assignments/${assignmentId}/submission-file'), "student assignment file upload uses dedicated Worker endpoint");
assert(app.includes('body.submission_id=submissionId'), "assignment submit binds a server-created submission ID");
assert(!app.includes('body.submission_file_key='), "frontend never posts a raw submission_file_key on assignment submit");
assert(app.includes('crossorigin="use-credentials"'), "protected video uses credentialed cross-origin media");
assert(app.includes('safeMediaUrl'), "protected media is constrained to API origin");
assert(app.includes('content:Notes'), "Notes modal definition exists");
assert(app.includes('content:Videos'), "Videos modal definition exists");
assert(app.includes('note_type') && app.includes('"note"'), "Notes use the backend note type contract");
assert(app.includes('function adminAssignmentSubmissions'), "assignment submissions admin page is implemented");
assert(app.includes('function openAssignmentSubmissionReview'), "assignment submission review UI is implemented");
assert(app.includes('function adminNotifications'), "announcements admin page is implemented");
assert(app.includes('function adminPayments'), "payments admin page is implemented");
assert(app.includes('function adminPricing'), "pricing admin page is implemented");
for (const fn of ["adminAssignmentSubmissions","adminNotifications","adminPayments","adminPricing","assignmentSubmissionCard","openAssignmentSubmissionReview"]) {
  assert(new RegExp(`function ${fn}\\s*\\(`).test(app), `runtime function ${fn} exists`);
}
assert(app.includes('answer_mode') && app.includes('normalizeFrontendAnswerMode'), "assignment answer-mode contract is rendered");
assert(app.includes('if(mode==="text"&&!answerText)') && app.includes('if(mode==="file"&&!submissionId)') && app.includes('if(mode==="mixed"&&!answerText&&!submissionId)'), "assignment answer-mode client enforcement exists");
assert(app.includes('document.addEventListener("input",e=>{const t=e.target;if(t instanceof HTMLTextAreaElement'), "subjective textarea autosave listens to input events");
assert(app.includes('document.getElementById("exam-index")'), "exam question index is updated after refresh");
assert(app.includes('original_filename') && app.includes('content_type') && app.includes('size_bytes'), "admin media uses normalized backend media fields");
assert(app.includes('copy-media-key'), "admin media exposes a safe copy-key action for resource binding");
assert(app.includes('api(`/api/admin/courses/${courseId}/batches`)'), "batch editing reads from the backend-supported course batch list route");
assert(!app.includes('api(`/api/admin/course-batches/${Number(el.dataset.id)}`)'), "frontend does not call a nonexistent batch detail GET route");
assert(app.includes('/api/admin/pricing/offers'), "admin pricing covers offers");
assert(app.includes('/api/admin/announcements/'), "admin announcements uses detail/action routes");
assert(app.includes('audience_type') && app.includes('channels') && app.includes('priority'), "announcement form matches backend payload contract");

const data = JSON.parse(manifest);
const releaseFiles = [];
function walk(dir, rel="") {
  for (const entry of fs.readdirSync(dir,{withFileTypes:true})) {
    const r=path.join(rel,entry.name), full=path.join(dir,entry.name);
    if(entry.isDirectory()) walk(full,r); else if(!["node_modules"].includes(entry.name)) releaseFiles.push(r.replaceAll(path.sep,"/"));
  }
}
walk(root);
const ignored = new Set(["package.json","tests/frontend-static-check.mjs","FRONTEND-RELEASE-MANIFEST.json"]);
const listed = new Set(data.files.map(x=>x.path));
const actual = new Set(releaseFiles);
assert(data.file_count === data.files.length, "release manifest file_count matches files array");
for (const p of data.files) assert(actual.has(p.path), `manifest file exists: ${p.path}`);
for (const p of releaseFiles) if(!ignored.has(p) && !p.startsWith("docs/")) assert(listed.has(p), `release manifest lists: ${p}`);
console.log("FRONTEND PRODUCTION SPLIT-ORIGIN CHECK: PASS");
