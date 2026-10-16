import test from "node:test";
import assert from "node:assert/strict";

test("demo login accepts the displayed credentials only outside production", async () => {
  const { isDemoLoginEnabled, isDemoCredentials } = await import(new URL("../lib/demo-auth.ts", import.meta.url).href);

  assert.equal(isDemoLoginEnabled("development"), true);
  assert.equal(isDemoLoginEnabled("test"), true);
  assert.equal(isDemoLoginEnabled("production"), false);
  assert.equal(isDemoCredentials("admin@st.elizabethgirls.ac.ke", "admin123"), true);
  assert.equal(isDemoCredentials("admin@st.elizabethgirls.ac.ke", "incorrect"), false);
});

test("demo session signatures reject tampering and expired tokens", async () => {
  const { signDemoSessionToken, verifyDemoSessionToken } = await import(new URL("../lib/demo-auth.ts", import.meta.url).href);
  const expiresAt = Date.now() + 60_000;
  const token = signDemoSessionToken("test-only-secret", expiresAt);

  assert.equal(verifyDemoSessionToken(token, "test-only-secret"), true);
  assert.equal(verifyDemoSessionToken(token, "different-secret"), false);
  assert.equal(verifyDemoSessionToken(`${token}tampered`, "test-only-secret"), false);
  assert.equal(verifyDemoSessionToken(signDemoSessionToken("test-only-secret", Date.now() - 1), "test-only-secret"), false);
});