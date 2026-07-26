export type SeoTopicSection = {
  heading: string;
  paragraphs: readonly string[];
};

export type SeoTopic = {
  slug: string;
  primaryKeyword: string;
  title: string;
  metaDescription: string;
  eyebrow: string;
  heading: string;
  lead: string;
  sections: readonly SeoTopicSection[];
  checklistTitle: string;
  checklist: readonly string[];
  caution: string;
};

export const SEO_TOPICS: readonly SeoTopic[] = [
  {
    slug: 'restnutzungsdauer-gutachten',
    primaryKeyword: 'Restnutzungsdauer Gutachten',
    title: 'Restnutzungsdauer-Gutachten für Immobilien',
    metaDescription:
      'Was ein Restnutzungsdauer-Gutachten leistet, welche Unterlagen wichtig sind und wie eine objektbezogene Herleitung für vermietete Immobilien vorbereitet wird.',
    eyebrow: 'Gutachten verstehen',
    heading: 'Restnutzungsdauer-Gutachten: Ablauf, Nachweise und Einordnung',
    lead:
      'Ein Restnutzungsdauer-Gutachten untersucht, wie lange ein Gebäude unter Berücksichtigung seines Alters, Zustands und seiner Modernisierungen voraussichtlich wirtschaftlich nutzbar bleibt. Entscheidend ist nicht eine pauschale Zahl, sondern eine nachvollziehbare Herleitung am konkreten Objekt.',
    sections: [
      {
        heading: 'Was wird in einem Gutachten untersucht?',
        paragraphs: [
          'Ausgangspunkt sind Gebäudeart, Baujahr und die für diese Objektart typische Gesamtnutzungsdauer. Hinzu kommen der tatsächliche bauliche Zustand, durchgeführte Modernisierungen, erkennbare Schäden und funktionale Einschränkungen. Diese Faktoren müssen zusammenpassen und durch Unterlagen oder eine fachliche Prüfung plausibilisiert werden.',
          'Die digitale Ersteinschätzung auf dieser Website ist deshalb nur ein Orientierungswert. Sie hilft, die Ausgangslage zu strukturieren, ersetzt aber weder die fachliche Prüfung noch das fertige Gutachten.',
        ],
      },
      {
        heading: 'Wie läuft die Bearbeitung ab?',
        paragraphs: [
          'Nach dem ersten Check werden vorhandene Unterlagen gesichtet. Offene Punkte und Widersprüche werden geklärt, bevor Angaben in eine fachliche Berechnung einfließen. Je nach Objekt und Dokumentenlage kann zusätzlich eine Vor-Ort-Prüfung sinnvoll oder erforderlich sein.',
          'Erst nach dieser Prüfung lässt sich entscheiden, ob eine kürzere Restnutzungsdauer ausreichend begründet werden kann. Sie erhalten vor einem kostenpflichtigen Auftrag eine transparente Einordnung des notwendigen Umfangs.',
        ],
      },
      {
        heading: 'Was bedeutet nachvollziehbar?',
        paragraphs: [
          'Eine belastbare Herleitung erklärt die verwendeten Annahmen, nennt die Objektmerkmale und trennt belegte Tatsachen von Schätzungen. Sie dokumentiert außerdem, welche Quellen verwendet wurden und welche Grenzen die Aussage hat.',
          'Eine Anerkennung durch Finanzbehörden kann nicht garantiert werden. Die steuerliche Nutzung und Einreichung sollte mit der eigenen Steuerberatung abgestimmt werden.',
        ],
      },
    ],
    checklistTitle: 'Typische Unterlagen für die fachliche Prüfung',
    checklist: [
      'Baujahr, Gebäudeart und Flächenangaben',
      'Grundrisse, Baubeschreibung und Kaufunterlagen',
      'Nachweise zu Modernisierungen und Sanierungen',
      'Aussagekräftige Objektfotos und Schadenshinweise',
      'Bei Bedarf ergänzende Vor-Ort-Feststellungen',
    ],
    caution:
      'Ein Gutachten ist keine Steuerberatung und keine Zusage einer bestimmten steuerlichen Wirkung. Maßgeblich bleiben der Einzelfall und die Entscheidung der zuständigen Stellen.',
  },
  {
    slug: 'afa-immobilie',
    primaryKeyword: 'Gebäude AfA erhöhen',
    title: 'AfA bei Immobilien und Restnutzungsdauer',
    metaDescription:
      'Verständlich erklärt: Wie Nutzungsdauer und Gebäudewert den jährlichen AfA-Betrag beeinflussen können – mit unverbindlichem Rechenbeispiel.',
    eyebrow: 'AfA verstehen',
    heading: 'AfA bei Immobilien: Welche Rolle die Nutzungsdauer spielt',
    lead:
      'Die Absetzung für Abnutzung verteilt den abschreibungsfähigen Gebäudewert auf einen Zeitraum. Wird im Einzelfall eine kürzere tatsächliche Nutzungsdauer fachlich nachgewiesen, kann sich der rechnerische Abschreibungsbetrag pro Jahr verändern.',
    sections: [
      {
        heading: 'Gebäudewert und Nutzungsdauer sind getrennt zu betrachten',
        paragraphs: [
          'Für die AfA ist nicht automatisch der gesamte Kaufpreis maßgeblich. Grund und Boden wird grundsätzlich anders behandelt als der Gebäudeanteil. Deshalb ist die Kaufpreisaufteilung ein eigener wichtiger Baustein.',
          'Die Nutzungsdauer bestimmt anschließend, über welchen Zeitraum der relevante Gebäudewert verteilt wird. Ein kürzerer Zeitraum führt rechnerisch zu einem höheren Jahresbetrag, ohne den zugrunde gelegten Gebäudewert zu verändern.',
        ],
      },
      {
        heading: 'Warum ein Rechenbeispiel keine Steuerprognose ist',
        paragraphs: [
          'Beispielwerte können den Mechanismus erklären, sagen aber nichts Verbindliches über die persönliche Steuerlast aus. Einkommen, Steuersatz, Erwerbszeitpunkt, Nutzung, Kaufpreisaufteilung und weitere steuerliche Faktoren unterscheiden sich von Fall zu Fall.',
          'Aus diesem Grund zeigt RND Gutachten keine pauschale Steuerersparnis. Die fachliche Herleitung der Restnutzungsdauer und die steuerliche Bewertung bleiben getrennte Aufgaben.',
        ],
      },
      {
        heading: 'Wann eine fachliche Prüfung sinnvoll sein kann',
        paragraphs: [
          'Anhaltspunkte können ein höheres Gebäudealter, ein erkennbarer Instandhaltungsrückstand, funktionale Mängel oder nur teilweise erfolgte Modernisierungen sein. Sehr junge oder umfassend kernsanierte Gebäude sprechen häufig gegen eine deutlich verkürzte Restnutzungsdauer.',
          'Der digitale Check hilft bei der ersten Einordnung. Eine tragfähige Aussage erfordert jedoch objektbezogene Nachweise und gegebenenfalls zusätzliche Feststellungen.',
        ],
      },
    ],
    checklistTitle: 'Vier Größen, die zusammengehören',
    checklist: [
      'Kaufpreis und nachvollziehbare Kaufpreisaufteilung',
      'Abschreibungsfähiger Gebäudewert',
      'Gesetzliche oder individuell nachgewiesene Nutzungsdauer',
      'Persönliche steuerliche Einordnung durch die Steuerberatung',
    ],
    caution:
      'Die Inhalte erklären den Rechenmechanismus und ersetzen keine individuelle Steuerberatung. Es gibt weder eine Anerkennungs- noch eine Steuerspargarantie.',
  },
  {
    slug: 'restnutzungsdauer-berechnen',
    primaryKeyword: 'Restnutzungsdauer berechnen',
    title: 'Restnutzungsdauer einer Immobilie berechnen',
    metaDescription:
      'Restnutzungsdauer einer Immobilie unverbindlich einschätzen: Welche Daten benötigt werden, wie Modernisierungen einfließen und wo die Grenzen eines Online-Rechners liegen.',
    eyebrow: 'Berechnung einordnen',
    heading: 'Restnutzungsdauer berechnen: Daten, Modernisierungen und Grenzen',
    lead:
      'Eine rechnerische Ersteinschätzung verbindet Gebäudeart, Baujahr und den Modernisierungsstand. Sie schafft eine reproduzierbare Orientierung, kann die technische und wirtschaftliche Prüfung des konkreten Gebäudes aber nicht ersetzen.',
    sections: [
      {
        heading: 'Welche Eingaben werden benötigt?',
        paragraphs: [
          'Die Gebäudeart bestimmt die typisierte Gesamtnutzungsdauer. Aus Baujahr und festem Stichtag ergibt sich das tatsächliche Gebäudealter. Acht Modernisierungsbereiche bilden ab, ob wesentliche Bauteile und Funktionen in jüngerer Zeit erneuert wurden.',
          'Dazu gehören unter anderem Dach, Fenster, Leitungen, Heizung, Außenwanddämmung, Bäder, Innenausbau und Grundriss. Die Antworten werden nach einem festen Modell bewertet, damit die Vorschau nachvollziehbar und wiederholbar bleibt.',
        ],
      },
      {
        heading: 'Warum ist das Ergebnis nur eine Orientierung?',
        paragraphs: [
          'Ein Online-Rechner kennt zunächst keine vollständigen Bauunterlagen, keine verdeckten Schäden und keine örtlichen Besonderheiten. Auch Nutzungsänderungen oder außergewöhnliche Konstruktionen können eine individuelle Betrachtung verlangen.',
          'Deshalb berechnet der Server das Ergebnis beim Absenden erneut und speichert die zugrunde liegende Modellversion. Das verhindert manipulierte Browserwerte und macht den Rechenstand später nachvollziehbar.',
        ],
      },
      {
        heading: 'Was geschieht nach dem Check?',
        paragraphs: [
          'Sie können Kontaktdaten und freiwillig PDF-Unterlagen ergänzen. Vor dem Absenden erhalten Sie eine vollständige Zusammenfassung und können jede Gruppe noch einmal bearbeiten.',
          'Die Übermittlung bleibt unverbindlich. Erst nach Sichtung der Informationen lässt sich ein sinnvoller Prüfungsumfang bestimmen; ein kostenpflichtiger Auftrag entsteht dadurch noch nicht.',
        ],
      },
    ],
    checklistTitle: 'Was der Online-Check leistet',
    checklist: [
      'Einheitliche Abfrage von Gebäudeart und Baujahr',
      'Strukturierte Erfassung von acht Modernisierungsbereichen',
      'Serverseitig reproduzierte Ergebnisvorschau',
      'Sichere optionale Dokumentenübermittlung',
      'Keine automatische Verwendung ungeprüfter Dokumentenangaben',
    ],
    caution:
      'Das Ergebnis ist eine rechnerische Vorprüfung. Es ist kein fertiges Gutachten und keine Aussage über die spätere steuerliche Anerkennung.',
  },
  {
    slug: 'restnutzungsdauer-finanzamt',
    primaryKeyword: 'Restnutzungsdauer Finanzamt',
    title: 'Restnutzungsdauer und Finanzamt',
    metaDescription:
      'Restnutzungsdauer gegenüber dem Finanzamt: Warum objektbezogene Nachweise, Quellen und eine nachvollziehbare Herleitung wichtig sind.',
    eyebrow: 'Nachweis und Einreichung',
    heading: 'Restnutzungsdauer beim Finanzamt: Nachweise nachvollziehbar vorbereiten',
    lead:
      'Für die Einreichung zählt nicht nur das Ergebnis, sondern vor allem die nachvollziehbare Begründung. Objektmerkmale, Quellen und fachliche Schlussfolgerungen müssen erkennbar zusammenpassen.',
    sections: [
      {
        heading: 'Welche Rolle spielen Belege?',
        paragraphs: [
          'Bauunterlagen, Modernisierungsnachweise, Fotos und Feststellungen am Objekt stützen die verwendeten Angaben. Wo Nachweise fehlen, muss klar zwischen belegter Tatsache, plausibler Annahme und offener Frage unterschieden werden.',
          'Unser Dokumentenworkflow hält Fundstelle und PDF-Seite fest. Automatisch erkannte Angaben werden nicht stillschweigend übernommen, sondern müssen fachlich bestätigt, bearbeitet oder abgelehnt werden.',
        ],
      },
      {
        heading: 'Warum keine Anerkennung versprochen werden kann',
        paragraphs: [
          'Die zuständige Finanzbehörde prüft den konkreten Fall. Ein Gutachten kann die Argumentation strukturiert und fachlich nachvollziehbar machen, nimmt die behördliche Entscheidung jedoch nicht vorweg.',
          'Auch rechtliche und steuerliche Rahmenbedingungen können sich ändern. Die Einreichung und steuerliche Würdigung sollten deshalb gemeinsam mit der eigenen Steuerberatung erfolgen.',
        ],
      },
      {
        heading: 'Was eine gute Vorbereitung auszeichnet',
        paragraphs: [
          'Eine klare Chronologie, eindeutige Quellenangaben und die Dokumentation von Prüfentscheidungen reduzieren Missverständnisse. Widersprüche sollten sichtbar gelöst werden, statt unbemerkt in eine Berechnung einzufließen.',
          'Das fertige Ergebnis sollte außerdem deutlich zwischen rechnerischer Vorprüfung und fachlich freigegebenem Stand unterscheiden. Diese Trennung ist im Admin-Arbeitsbereich durchgängig erhalten.',
        ],
      },
    ],
    checklistTitle: 'Bausteine einer transparenten Unterlage',
    checklist: [
      'Eindeutige Objektidentifikation und Stichtag',
      'Nachvollziehbare Zuordnung von Gebäudeart und Baujahr',
      'Belegstellen für Modernisierungen und besondere Merkmale',
      'Dokumentierte Widersprüche und Prüfentscheidungen',
      'Klare Trennung zwischen Orientierung und freigegebenem Ergebnis',
    ],
    caution:
      'Diese Informationen sind allgemeiner Natur. Sie ersetzen keine rechtliche oder steuerliche Beratung und begründen keinen Anspruch auf Anerkennung.',
  },
] as const;

export function getSeoTopic(slug: string) {
  return SEO_TOPICS.find((topic) => topic.slug === slug);
}
