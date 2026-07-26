import type {RndResult} from './types.ts';

export const RND_DISCLAIMER =
  'Unverbindliche rechnerische Ersteinschätzung. Kein Gutachten, keine Verkehrswertermittlung, kein Bauzustands- oder Schadensgutachten und keine Steuerberatung. Es besteht keine Garantie für eine bestimmte Restnutzungsdauer oder die Anerkennung durch das Finanzamt. Maßgeblich ist die spätere fachliche Prüfung des Einzelfalls.';

export function getResultCopy(result: RndResult) {
  if (result.status === 'manual_review' || result.modifiedRnd === null) {
    return {
      title: 'Fachliche Prüfung erforderlich',
      body:
        'Für diese Gebäudeart oder Objektkonstellation ist eine rein automatische Einordnung nur eingeschränkt möglich. Wir können Ihre Angaben speichern und die weitere Berechnung individuell prüfen.',
    };
  }

  return {
    title: 'Ihre Ersteinschätzung',
    body: `Auf Basis Ihrer Angaben berechnet sich eine wirtschaftliche RND von ${result.modifiedRnd} Jahren. Wir gehen davon aus, dass der Nachweis einer kürzeren RND im Sinne des § 7 EStG zu erbringen ist. Eine höhere steuerliche Abschreibung kann abhängig von den jeweiligen Voraussetzungen des Einzelfalls möglich sein.`,
  };
}
