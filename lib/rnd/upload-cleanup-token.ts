import 'server-only';

import {createHmac, timingSafeEqual} from 'node:crypto';

const TOKEN_LIFETIME_MS = 30 * 60 * 1000;
const UPLOAD_PREFIX = 'rnd-estimates/';

function getSecret() {
  const secret = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) throw new Error('Supabase server secret is not configured.');
  return secret;
}

function signatureFor(payload: string) {
  return createHmac('sha256', getSecret()).update(payload).digest('base64url');
}

export function isRndUploadPath(path: string) {
  return path.startsWith(UPLOAD_PREFIX) && !path.includes('..') && path.length <= 500;
}

export function createUploadCleanupToken(path: string) {
  if (!isRndUploadPath(path)) throw new Error('Invalid upload path.');

  const expiresAt = Date.now() + TOKEN_LIFETIME_MS;
  const payload = Buffer.from(JSON.stringify({path, expiresAt}), 'utf8').toString('base64url');
  return `${payload}.${signatureFor(payload)}`;
}

export function verifyUploadCleanupToken(path: string, token: string) {
  if (!isRndUploadPath(path) || !token) return false;

  const [payload, providedSignature, ...rest] = token.split('.');
  if (!payload || !providedSignature || rest.length > 0) return false;

  const expectedSignature = signatureFor(payload);
  const provided = Buffer.from(providedSignature);
  const expected = Buffer.from(expectedSignature);
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) return false;

  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      path?: string;
      expiresAt?: number;
    };
    return decoded.path === path && typeof decoded.expiresAt === 'number' && decoded.expiresAt >= Date.now();
  } catch {
    return false;
  }
}
