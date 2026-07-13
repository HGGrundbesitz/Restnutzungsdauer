export const MAX_PDF_SIZE = 15 * 1024 * 1024;

const DOCUMENT_PATH_PATTERN = /^(?:rnd-estimates|requests\/quick-check)\/[a-z0-9._@/-]+\.pdf$/i;

export function isAllowedDocumentPath(path: string) {
  return (
    path.length > 0 &&
    path.length <= 500 &&
    !path.includes('..') &&
    !path.includes('\\') &&
    DOCUMENT_PATH_PATTERN.test(path)
  );
}

export function safePdfName(path: string) {
  const name = path.split('/').pop() || 'dokument.pdf';
  return name.replace(/[^a-z0-9._-]/gi, '-').slice(-120) || 'dokument.pdf';
}

export function hasPdfMagicBytes(buffer: Buffer) {
  return buffer.length >= 5 && buffer.subarray(0, 5).toString('ascii') === '%PDF-';
}

