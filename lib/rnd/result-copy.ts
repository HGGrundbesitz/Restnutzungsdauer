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
    title: 'Ihre rechnerische Ersteinschätzung',
    body: `Auf Grundlage Ihrer Angaben ergibt sich nach dem hinterlegten ImmoWertV-Modell eine modifizierte wirtschaftliche Restnutzungsdauer von rund ${result.modifiedRnd} Jahren. Ob dieser Wert im konkreten Fall fachlich tragfähig ist, hängt insbesondere vom Objektzustand, den Unterlagen und der sachverständigen Würdigung ab.`,
  };
}
