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

export async function createRndSummaryPdf(result: RndResult, property: RndPropertyContext) {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const first = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);

  first.drawRectangle({x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT, color: rgb(1, 1, 1)});
  first.drawRectangle({x: 0, y: PAGE_HEIGHT - 12, width: PAGE_WIDTH, height: 12, color: BLUE});
  drawText(first, 'RND GUTACHTEN', MARGIN, PAGE_HEIGHT - 72, 11, bold, MUTED);
  drawText(first, 'Unverbindliche', MARGIN, PAGE_HEIGHT - 146, 34, bold, INK);
  drawText(first, 'RND-Ersteinschätzung', MARGIN, PAGE_HEIGHT - 187, 34, bold, INK);
  drawWrapped(first, 'Rechnerische Orientierung auf Grundlage Ihrer Angaben und des hinterlegten ImmoWertV-Modells.', MARGIN, PAGE_HEIGHT - 230, PAGE_WIDTH - MARGIN * 2, 13, regular, MUTED, 20);

  first.drawRectangle({x: MARGIN, y: 410, width: PAGE_WIDTH - MARGIN * 2, height: 175, color: LIGHT_BLUE, borderColor: rgb(0.83, 0.88, 0.96), borderWidth: 1});
  drawText(first, result.modifiedRnd === null ? 'Manuelle Prüfung' : `${result.modifiedRnd} Jahre`, MARGIN + 28, 505, result.modifiedRnd === null ? 28 : 48, bold, INK);
  drawText(first, 'wirtschaftliche Restnutzungsdauer', MARGIN + 28, 472, 12, bold, MUTED);
  drawText(first, `Status: ${result.status === 'calculated' ? 'rechnerisch ermittelt' : 'fachlich zu prüfen'}`, MARGIN + 28, 438, 11, regular, MUTED);

  const summaryRows = [
    ['Gebäudeart', result.buildingTypeLabel],
    ['GND', result.gndYears ? `${result.gndYears} Jahre` : 'individuelle Zuordnung'],
    ['Baujahr / Stichtag', `${result.constructionYear} / ${formatDate(result.referenceDate)}`],
    ['Gebäudealter', `${result.actualAge} Jahre`],
    ['Vorläufige RND', result.preliminaryRnd === null ? '-' : `${result.preliminaryRnd} Jahre`],
    ['Modernisierungspunkte', `${result.modernizationPointsRounded} von 20`],
    ['Objekt', property.address?.trim() || 'Adresse nicht angegeben'],
  ];
  let y = 360;
  for (const [label, value] of summaryRows) {
    drawText(first, label.toUpperCase(), MARGIN, y, 8, bold, MUTED);
    drawWrapped(first, value, MARGIN + 170, y + 1, PAGE_WIDTH - MARGIN * 2 - 170, 11, regular, INK, 15);
    first.drawLine({start: {x: MARGIN, y: y - 12}, end: {x: PAGE_WIDTH - MARGIN, y: y - 12}, thickness: 0.6, color: rgb(0.88, 0.9, 0.94)});
    y -= 39;
  }
  drawText(first, `Modellversion: ${result.modelVersion}`, MARGIN, 58, 8, regular, MUTED);

  const second = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  drawText(second, 'Rechenweg und Hinweise', MARGIN, PAGE_HEIGHT - 78, 26, bold, INK);
  const copy = getResultCopy(result);
  drawText(second, copy.title, MARGIN, PAGE_HEIGHT - 128, 16, bold, INK);
  let secondY = drawWrapped(second, copy.body, MARGIN, PAGE_HEIGHT - 156, PAGE_WIDTH - MARGIN * 2, 11, regular, MUTED, 18);

  drawText(second, 'Rechenweg', MARGIN, secondY - 28, 15, bold, INK);
  secondY -= 58;
  const calculationRows = [
    ['Alter', `${new Date(`${result.referenceDate}T00:00:00`).getFullYear()} - ${result.constructionYear} = ${result.actualAge}`],
    ['Vorläufige RND', result.gndYears === null ? '-' : `${result.gndYears} - ${result.actualAge} = ${result.preliminaryRnd}`],
    ['Modernisierung', `${result.modernizationPointsRaw} Punkte, gerundet ${result.modernizationPointsRounded}`],
    ['Relatives Alter', result.relativeAge === null ? '-' : `${result.relativeAge.toFixed(2).replace('.', ',')} %`],
    ['Methode', methodLabel(result.calculationMethod)],
  ];
  for (const [label, value] of calculationRows) {
    drawText(second, label, MARGIN, secondY, 10, bold, MUTED);
    drawText(second, value, MARGIN + 160, secondY, 10, regular, INK);
    secondY -= 28;
  }

  if (result.warnings.length > 0) {
    drawText(second, 'Prüfhinweise', MARGIN, secondY - 12, 15, bold, INK);
    secondY -= 42;
    for (const warning of result.warnings) {
      secondY = drawWrapped(second, `- ${warning.message}`, MARGIN, secondY, PAGE_WIDTH - MARGIN * 2, 9.5, regular, MUTED, 15) - 6;
    }
  }

  second.drawRectangle({x: MARGIN, y: 72, width: PAGE_WIDTH - MARGIN * 2, height: 112, color: rgb(0.97, 0.98, 1), borderColor: rgb(0.86, 0.89, 0.94), borderWidth: 1});
  drawText(second, 'Wichtiger Hinweis', MARGIN + 18, 158, 11, bold, INK);
  drawWrapped(second, RND_DISCLAIMER, MARGIN + 18, 139, PAGE_WIDTH - MARGIN * 2 - 36, 8.5, regular, MUTED, 13);
  drawText(second, `Erstellt am ${new Date().toLocaleDateString('de-DE')}`, MARGIN, 42, 8, regular, MUTED);

  return pdf.save();
}

function drawText(page: PDFPage, text: string, x: number, y: number, size: number, font: PDFFont, color = INK) {
  page.drawText(sanitizeForFont(text, font), {x, y, size, font, color});
}

function drawWrapped(page: PDFPage, text: string, x: number, y: number, width: number, size: number, font: PDFFont, color: ReturnType<typeof rgb>, lineHeight: number) {
  const words = sanitizeForFont(text, font).split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= width) current = candidate;
    else { if (current) lines.push(current); current = word; }
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

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString('de-DE');
}

function methodLabel(method: RndResult['calculationMethod']) {
  if (method === 'immowertv_formula') return 'ImmoWertV-Formel';
  if (method === 'preliminary') return 'GND minus Gebäudealter';
  return 'Manuelle Prüfung';
}
