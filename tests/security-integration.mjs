// Run only against the isolated local Worker with disposable QA accounts.
import assert from "node:assert/strict";
const base = process.env.SECURITY_TEST_URL;
if (base !== "http://127.0.0.1:8799") throw new Error("This test requires the isolated local Worker on 127.0.0.1:8799.");
const password = "TestPassword987!";
async function request(path, options = {}) { return fetch(base + path, { redirect: "manual", ...options }); }
async function login(user, pass, destination = "/admin") {
  const html = await (await request("/admin/login?return_to=" + encodeURIComponent(destination))).text();
  const action = html.match(/name="(\$ACTION_ID_[^"]*loginAction)"/)?.[1];
  assert.ok(action, "login action");
  const body = new FormData();
  for (const [k, v] of [[action, ""], ["username", user], ["password", pass], ["return_to", destination]]) body.set(k, v);
  return request("/admin/login", { method: "POST", headers: { origin: base }, body });
}
for (const path of ["/admin", "/admin/lots", "/admin/users"]) assert.equal((await request(path)).status, 307, path);
assert.equal((await request("/api/upload", { method: "POST" })).status, 403);
const home = await request("/");
assert.equal(home.status, 200);
for (const name of ["content-security-policy", "x-frame-options", "x-content-type-options", "referrer-policy", "permissions-policy"]) assert.ok(home.headers.get(name), name);
const redirected = await login("qa_owner", password, "/\\example.com");
assert.equal(redirected.status, 303);
assert.equal(new URL(redirected.headers.get("location"), base).origin, base);
const cookie = redirected.headers.get("set-cookie")?.split(";")[0];
assert.ok(cookie);
const users = await request("/admin/users", { headers: { cookie } });
assert.equal(users.status, 200);
const html = await users.text();
const action = html.match(/name="(\$ACTION_ID_[^"]*createUserAction)"/)?.[1];
assert.ok(action);
function staffForm() { const body = new FormData(); for (const [k, v] of [[action, ""], ["username", "qa_staff"], ["display_name", "QA"], ["password", password], ["role", "staff"]]) body.set(k, v); return body; }
assert.equal((await request("/admin/users", { method: "POST", headers: { cookie, origin: "https://example.com" }, body: staffForm() })).status, 403);
assert.equal((await request("/admin/users", { method: "POST", headers: { cookie, origin: base }, body: staffForm() })).status, 303);
const staffLogin = await login("qa_staff", password);
const staffCookie = staffLogin.headers.get("set-cookie")?.split(";")[0];
assert.ok(staffCookie);
const forbidden = await request("/admin/users", { headers: { cookie: staffCookie } });
assert.equal(forbidden.status, 307);
assert.match(forbidden.headers.get("location"), /forbidden/);
const denied = await request("/admin/users", { method: "POST", headers: { cookie: staffCookie, origin: base }, body: staffForm() });
assert.equal(denied.status, 303);
assert.match(denied.headers.get("location"), /forbidden/);
const failures = await Promise.all(Array.from({ length: 8 }, () => login("qa_staff", "bad-password")));
assert.ok(failures.every((r) => r.status === 303));
const locked = await login("qa_staff", password);
assert.match(locked.headers.get("location"), /error=invalid/);
assert.equal(locked.headers.get("set-cookie"), null);
console.log("PASS: anonymous access, security headers, safe login redirect, CSRF, staff permissions, concurrent login lock");
