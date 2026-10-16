import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

export const DEMO_SESSION_COOKIE = "kendi-demo-session";
export const DEMO_EMAIL = "admin@st.elizabethgirls.ac.ke";
export const DEMO_PASSWORD = "admin123";
const DEMO_SESSION_TTL_MS = 8 * 60 * 60 * 1000;
let demoSecretPromise: Promise<Buffer> | undefined;

export function isDemoLoginEnabled(nodeEnvironment = process.env.NODE_ENV) {
  return nodeEnvironment !== "production";
}

export function signDemoSessionToken(secret: string, expiresAt: number) {
  const payload = String(expiresAt);
  const signature = createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}.${signature}`;
}

export function verifyDemoSessionToken(token: string, secret: string, now = Date.now()) {
  const [payload, signature, extra] = token.split(".");
  const expiresAt = Number(payload);
  if (
    extra !== undefined
    || !Number.isSafeInteger(expiresAt)
    || expiresAt <= now
    || expiresAt > now + DEMO_SESSION_TTL_MS
    || !/^[a-f0-9]{64}$/.test(signature ?? "")
  ) {
    return false;
  }

  const expected = Buffer.from(createHmac("sha256", secret).update(payload).digest("hex"), "hex");
  const actual = Buffer.from(signature, "hex");
  return timingSafeEqual(expected, actual);
}

async function getDemoSessionSecret(): Promise<Buffer> {
  if (!demoSecretPromise) {
    demoSecretPromise = (async () => {
      const configuredSecret = process.env.DEMO_SESSION_SECRET;
      if (configuredSecret) {
        if (configuredSecret.length < 32) {
          throw new Error("DEMO_SESSION_SECRET must contain at least 32 characters");
        }
        return Buffer.from(configuredSecret);
      }

      const secretPath = resolve(process.cwd(), "data", ".demo-session-secret");
      await mkdir(resolve(process.cwd(), "data"), { recursive: true });
      try {
        return await readFile(secretPath);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      }

      const generatedSecret = randomBytes(32);
      try {
        await writeFile(secretPath, generatedSecret, { flag: "wx", mode: 0o600 });
        return generatedSecret;
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
        return readFile(secretPath);
      }
    })();
  }

  return demoSecretPromise;
}

export async function createDemoSessionToken() {
  const expiresAt = Date.now() + DEMO_SESSION_TTL_MS;
  const secret = await getDemoSessionSecret();
  return signDemoSessionToken(secret.toString(), expiresAt);
}

export async function hasDemoSessionCookie(cookieHeader?: string | null) {
  if (!cookieHeader) return false;
  const cookie = cookieHeader.split(";").map((part) => part.trim())
    .find((part) => part.startsWith(`${DEMO_SESSION_COOKIE}=`));
  if (!cookie) return false;

  const token = cookie.slice(DEMO_SESSION_COOKIE.length + 1);
  const secret = await getDemoSessionSecret();
  return verifyDemoSessionToken(token, secret.toString());
}

export function isDemoCredentials(email: unknown, password: unknown) {
  return typeof email === "string"
    && email.trim().toLowerCase() === DEMO_EMAIL
    && typeof password === "string"
    && password === DEMO_PASSWORD;
}