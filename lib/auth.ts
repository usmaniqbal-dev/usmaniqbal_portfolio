import { createHmac, timingSafeEqual } from "crypto";

const minimumSecretLength = 32;
const minimumPasswordLength = 8;

type SessionPayload = {
  username: string;
  expiresAt: number;
};

function getSecret() {
  const secret = process.env.AUTH_SECRET;

  if (!secret || secret.length < minimumSecretLength) {
    return null;
  }

  return secret;
}

function base64Url(input: string) {
  return Buffer.from(input).toString("base64url");
}

function sign(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export const cookieName = "nurax_admin_session";

export function authConfigReady() {
  return Boolean(
      process.env.ADMIN_USERNAME &&
      process.env.ADMIN_PASSWORD &&
      process.env.ADMIN_PASSWORD.length >= minimumPasswordLength &&
      getSecret()
  );
}

export function getAuthSetupMessage() {
  return "Set ADMIN_USERNAME, ADMIN_PASSWORD with at least 8 characters, and AUTH_SECRET with at least 32 characters in .env.local.";
}

export function createSessionToken(username: string) {
  const secret = getSecret();

  if (!secret) {
    throw new Error(getAuthSetupMessage());
  }

  const payload: SessionPayload = {
    username,
    expiresAt: Date.now() + 1000 * 60 * 60 * 8
  };
  const body = base64Url(JSON.stringify(payload));

  return `${body}.${sign(body, secret)}`;
}

export function verifySessionToken(token?: string) {
  const secret = getSecret();

  if (!token || !secret) {
    return null;
  }

  const [body, signature] = token.split(".");

  if (!body || !signature || !safeEqual(signature, sign(body, secret))) {
    return null;
  }

  const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;

  if (payload.expiresAt < Date.now()) {
    return null;
  }

  return payload;
}

export function credentialsMatch(username: string, password: string) {
  return (
    authConfigReady() &&
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  );
}
