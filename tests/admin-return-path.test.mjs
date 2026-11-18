import { test } from "node:test";
import assert from "node:assert/strict";
import { adminReturnPath } from "../lib/admin-return-path.ts";

test("preserves valid admin destinations and their filters", () => {
  assert.equal(adminReturnPath("/admin/lots/5?notice=ok"), "/admin/lots/5?notice=ok");
  assert.equal(adminReturnPath("/admin"), "/admin");
});
test("rejects external, malformed, encoded and non-admin redirects", () => {
  for (const path of ["//example.com", "/\\example.com", "https://example.com", "/admin/../../outside", "/admin/login?x=1", "/admin%2f..%2foutside", "/admin/\nexample", "/cay-quat", null]) {
    assert.equal(adminReturnPath(path), "/admin", String(path));
  }
});
