import {PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage} from 'pdf-lib';
import {getResultCopy, RND_DISCLAIMER} from './result-copy.ts';
import type {RndPropertyContext, RndResult} from './types.ts';

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 54;
const INK = rgb(0.06, 0.09, 0.16);
const MUTED = rgb(0.33, 0.39, 0.49);
const BLUE = rgb(0.15, 0.39, 0.92);
const LIGHT_BLUE = rgb(0.94, 0.97, 1);

export function getPublicSummaryRows(
  result: RndResult,
  property: RndPropertyContext,
): Array<[string, string]> {
  const rows: Array<[string, string]> = [
    ['Gebäudeart', result.buildingTypeLabel],
    ['Baujahr', String(result.constructionYear)],
  ];
  if (property.address?.trim()) rows.push(['Objekt', property.address.trim()]);
  if (property.area) rows.push(['Fläche', `${property.area} m²`]);
  if (property.units) rows.push(['Nutzungseinheiten', String(property.units)]);
  return rows;
}

export async function createRndSummaryPdf(result: RndResult, property: RndPropertyContext) {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const copy = getResultCopy(result);

  page.drawRectangle({x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT, color: rgb(1, 1, 1)});
  page.drawRectangle({x: 0, y: PAGE_HEIGHT - 12, width: PAGE_WIDTH, height: 12, color: BLUE});
  drawText(page, 'RND GUTACHTEN', MARGIN, PAGE_HEIGHT - 72, 11, bold, MUTED);
  drawText(page, 'Unverbindliche', MARGIN, PAGE_HEIGHT - 138, 32, bold, INK);
  drawText(page, 'RND-Ersteinschätzung', MARGIN, PAGE_HEIGHT - 178, 32, bold, INK);
  drawWrapped(
    page,
    'Ihre persönliche Orientierung auf Grundlage der Angaben im Online-Check.',
    MARGIN,
    PAGE_HEIGHT - 218,
    PAGE_WIDTH - MARGIN * 2,
    12,
    regular,
    MUTED,
    19,
  );

  page.drawRectangle({
    x: MARGIN,
    y: 470,
    width: PAGE_WIDTH - MARGIN * 2,
    height: 150,
    color: LIGHT_BLUE,
    borderColor: rgb(0.83, 0.88, 0.96),
    borderWidth: 1,
  });
  drawText(
    page,
    result.modifiedRnd === null ? 'Fachliche Prüfung' : `${result.modifiedRnd} Jahre`,
    MARGIN + 28,
    548,
    result.modifiedRnd === null ? 27 : 46,
    bold,
    INK,
  );
  drawText(page, 'wirtschaftliche Restnutzungsdauer', MARGIN + 28, 512, 12, bold, MUTED);

  let y = 424;
  for (const [label, value] of getPublicSummaryRows(result, property)) {
    drawText(page, label.toUpperCase(), MARGIN, y, 8, bold, MUTED);
    drawWrapped(page, value, MARGIN + 170, y + 1, PAGE_WIDTH - MARGIN * 2 - 170, 11, regular, INK, 15);
    page.drawLine({
      start: {x: MARGIN, y: y - 12},
      end: {x: PAGE_WIDTH - MARGIN, y: y - 12},
      thickness: 0.6,
      color: rgb(0.88, 0.9, 0.94),
    });
    y -= 39;
  }

  const copyY = Math.min(y - 12, 262);
  drawText(page, copy.title, MARGIN, copyY, 15, bold, INK);
  drawWrapped(page, copy.body, MARGIN, copyY - 26, PAGE_WIDTH - MARGIN * 2, 10.5, regular, MUTED, 17);

  page.drawRectangle({
    x: MARGIN,
    y: 74,
    width: PAGE_WIDTH - MARGIN * 2,
    height: 116,
    color: rgb(0.97, 0.98, 1),
    borderColor: rgb(0.86, 0.89, 0.94),
    borderWidth: 1,
  });
  drawText(page, 'Nächster Schritt: Gutachten anfragen', MARGIN + 18, 164, 11, bold, INK);
  drawWrapped(page, RND_DISCLAIMER, MARGIN + 18, 143, PAGE_WIDTH - MARGIN * 2 - 36, 8.3, regular, MUTED, 13);
  drawText(page, `Erstellt am ${new Date().toLocaleDateString('de-DE')}`, MARGIN, 42, 8, regular, MUTED);

  return pdf.save();
}

function drawText(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  size: number,
  font: PDFFont,
  color = INK,
) {
  page.drawText(sanitizeForFont(text, font), {x, y, size, font, color});
}

function drawWrapped(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  width: number,
  size: number,
  font: PDFFont,
  color: ReturnType<typeof rgb>,
  lineHeight: number,
) {
  const words = sanitizeForFont(text, font).split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= width) current = candidate;
    else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  lines.forEach((line, index) => drawText(page, line, x, y - index * lineHeight, size, font, color));
  return y - lines.length * lineHeight;
}

function sanitizeForFont(value: string, font: PDFFont) {
  const normalized = value
    .normalize('NFC')
    .replace(/[\u2010\u2011\u2012\u2013\u2014\u2212]/g, '-')
    .replace(/[\u00a0\u202f]/g, ' ')
    .replace(/\u2026/g, '...');

  return Array.from(normalized, (character) => {
    try {
      font.encodeText(character);
      return character;
    } catch {
      return '?';
    }
  }).join('');
}
