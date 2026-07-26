import {RND_DISCLAIMER} from './result-copy.ts';
import type {RndContact, RndPropertyContext, RndResult} from './types.ts';

export function getPublicResultValue(result: RndResult) {
  return result.modifiedRnd === null
    ? 'Manuelle Prüfung erforderlich'
    : `ca. ${result.modifiedRnd} Jahre`;
}

export function createCustomerEmailHtml(
  contact: Pick<RndContact, 'firstName'>,
  result: RndResult,
) {
  const resultValue = getPublicResultValue(result);

  return `<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#0f172a"><h2>Guten Tag ${escapeHtml(contact.firstName)},</h2><p>vielen Dank für Ihre Angaben.</p><p><strong>Ihre unverbindliche Ersteinschätzung:</strong> ${escapeHtml(resultValue)}</p><ul><li>Gebäudeart: ${escapeHtml(result.buildingTypeLabel)}</li><li>Baujahr: ${result.constructionYear}</li></ul><p>Wenn Sie den Nachweis fachlich prüfen lassen möchten, ist der nächste Schritt die Anfrage eines Gutachtens.</p><p style="font-size:13px;line-height:1.6;color:#64748b">${escapeHtml(RND_DISCLAIMER)}</p><p>Mit freundlichen Grüßen<br>RND Gutachten</p></div>`;
}

export function createInternalEmailHtml({
  contact,
  property,
  result,
  requestId,
  documentCount,
}: {
  contact: RndContact;
  property: RndPropertyContext;
  result: RndResult;
  requestId: string;
  documentCount: number;
}) {
  const resultValue = getPublicResultValue(result);

  return `<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#0f172a"><h2>Neue RND-Ersteinschätzung</h2><p><strong>Anfrage-ID:</strong> ${escapeHtml(requestId)}</p><p><strong>Kontakt:</strong> ${escapeHtml(contact.firstName)} ${escapeHtml(contact.lastName)}<br>${escapeHtml(contact.email)}<br>${escapeHtml(contact.phone || 'Telefon nicht angegeben')}</p><p><strong>Objekt:</strong> ${escapeHtml(property.address || result.buildingTypeLabel)}</p><p><strong>Ergebnis:</strong> ${escapeHtml(resultValue)}<br><strong>Modell:</strong> ${escapeHtml(result.modelVersion)}<br><strong>GND:</strong> ${result.gndYears ?? '-'} Jahre<br><strong>Gebäudealter:</strong> ${result.actualAge} Jahre<br><strong>Modernisierungspunkte:</strong> ${result.modernizationPointsRounded} von 20<br><strong>Methode:</strong> ${escapeHtml(result.calculationMethod)}<br><strong>Dokumente:</strong> ${documentCount}</p></div>`;
}

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    })[character] ?? character,
  );
}
