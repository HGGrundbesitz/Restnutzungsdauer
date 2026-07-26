import type {AdminRequestRecord, AdminRequestStatus} from './request-types.ts';
import type {DocumentFieldKey, ReviewBundle} from '../rnd/document-analysis/types.ts';
import {DOCUMENT_FIELD_LABELS} from '../rnd/document-analysis/types.ts';

export type RequestWorkspaceTab = 'overview' | 'documents' | 'review' | 'history';

export type RequestTimelineEvent = {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  actor?: string;
  tone: 'neutral' | 'blue' | 'green' | 'amber' | 'red';
};

export type RequestNextAction = {
  label: string;
  tab: RequestWorkspaceTab;
  reason: string;
  statusChange?: AdminRequestStatus;
};

export function buildRequestTimeline(
  request: AdminRequestRecord,
  bundle: ReviewBundle,
): RequestTimelineEvent[] {
  const events: RequestTimelineEvent[] = [
    {
      id: `request:${request.id}`,
      timestamp: request.created_at,
      title: 'Anfrage eingegangen',
      description: `${request.name} hat die Anfrage übermittelt.`,
      tone: 'neutral',
    },
    ...bundle.runs.map((run) => ({
      id: `run:${run.id}`,
      timestamp: run.updated_at || run.created_at,
      title:
        run.status === 'completed'
          ? 'Dokumentenanalyse abgeschlossen'
          : run.status === 'failed'
            ? 'Dokumentenanalyse fehlgeschlagen'
            : run.status === 'superseded'
              ? 'Analyselauf ersetzt'
              : 'Dokumentenanalyse gestartet',
      description: `${run.file_name}${run.is_current ? ' · aktueller Lauf' : ' · Historie'}`,
      tone: run.status === 'failed' ? 'red' : run.status === 'completed' ? 'blue' : 'neutral',
    }) satisfies RequestTimelineEvent),
    ...bundle.factAudits.map((audit) => {
      const actionLabel =
        audit.action === 'accepted' ? 'übernommen' : audit.action === 'edited' ? 'bearbeitet' : 'abgelehnt';
      const fieldLabel = getFieldLabel(audit.fact?.field_key);
      return {
        id: `fact:${audit.id}`,
        timestamp: audit.created_at,
        title: `${fieldLabel} ${actionLabel}`,
        description: audit.fact
          ? `${audit.fact.file_name} · Seite ${audit.fact.page_number}`
          : 'Dokumentenangabe geprüft',
        actor: getReviewerLabel(bundle, audit.admin_user_id),
        tone: audit.action === 'rejected' ? 'red' : audit.action === 'edited' ? 'blue' : 'green',
      } satisfies RequestTimelineEvent;
    }),
    ...bundle.calculationSnapshots.map((snapshot) => ({
      id: `calculation:${snapshot.id}`,
      timestamp: snapshot.created_at,
      title: 'Fachlicher Prüfstand gespeichert',
      description:
        typeof snapshot.result_snapshot.modifiedRnd === 'number'
          ? `${snapshot.result_snapshot.modifiedRnd} Jahre · ${snapshot.calculator_model_version}`
          : snapshot.calculator_model_version,
      actor: getReviewerLabel(bundle, snapshot.approved_by),
      tone: 'green',
    }) satisfies RequestTimelineEvent),
    ...bundle.statusEvents.map((event) => ({
      id: `status:${event.id}`,
      timestamp: event.created_at,
      title: `Status: ${getStatusLabel(event.new_status)}`,
      description: event.previous_status
        ? `Geändert von ${getStatusLabel(event.previous_status)}`
        : 'Ausgangsstatus erfasst',
      actor: getReviewerLabel(bundle, event.admin_user_id),
      tone: event.new_status === 'completed' ? 'green' : event.new_status === 'reviewing' ? 'blue' : 'amber',
    }) satisfies RequestTimelineEvent),
  ];

  return events.sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));
}

export function getRequestNextAction(request: AdminRequestRecord, bundle: ReviewBundle): RequestNextAction {
  const currentRuns = bundle.runs.filter((run) => run.is_current);
  const hasFailedCurrentRun = currentRuns.some((run) => run.status === 'failed');
  const openConflicts = bundle.conflicts.filter((conflict) => conflict.resolution_status === 'open');
  const pendingFacts = bundle.facts.filter((fact) => fact.review_status === 'pending_review');
  const approvedFacts = bundle.facts.filter(
    (fact) => fact.review_status === 'accepted' || fact.review_status === 'edited',
  );
  const latestAudit = getLatestTimestamp(bundle.factAudits.map((entry) => entry.created_at));
  const latestSnapshot = getLatestTimestamp(bundle.calculationSnapshots.map((entry) => entry.created_at));

  if (request.documents.length === 0) {
    return {label: 'Dokumente prüfen', tab: 'documents', reason: 'Es wurden noch keine Dokumente hochgeladen.'};
  }
  if (currentRuns.length === 0 || hasFailedCurrentRun) {
    return {
      label: hasFailedCurrentRun ? 'Analyse erneut starten' : 'Dokumente analysieren',
      tab: 'review',
      reason: 'Die Dokumente wurden noch nicht vollständig analysiert.',
    };
  }
  if (openConflicts.length > 0) {
    return {
      label: 'Widersprüche klären',
      tab: 'review',
      reason: `${openConflicts.length} Widerspruch${openConflicts.length === 1 ? '' : 'e'} offen.`,
    };
  }
  if (pendingFacts.length > 0) {
    return {
      label: 'Offene Angaben prüfen',
      tab: 'review',
      reason: `${pendingFacts.length} Angabe${pendingFacts.length === 1 ? '' : 'n'} warten auf eine Entscheidung.`,
    };
  }
  if (approvedFacts.length > 0 && latestAudit > latestSnapshot) {
    return {
      label: 'Rechenwerte vergleichen',
      tab: 'review',
      reason: 'Bestätigte Dokumentangaben sind neuer als der letzte Prüfstand.',
    };
  }
  if (request.status === 'pending') {
    return {
      label: 'Prüfung starten',
      tab: 'overview',
      reason: 'Die Anfrage ist noch als neu markiert.',
      statusChange: 'reviewing',
    };
  }
  if (request.status === 'reviewing') {
    return {
      label: 'Anfrage abschließen',
      tab: 'overview',
      reason: 'Es sind keine offenen Review-Schritte erkennbar.',
      statusChange: 'completed',
    };
  }
  return {
    label: 'Prüfung wieder öffnen',
    tab: 'overview',
    reason: 'Die Anfrage ist abgeschlossen.',
    statusChange: 'reviewing',
  };
}

function getReviewerLabel(bundle: ReviewBundle, userId: string | null) {
  if (!userId) return undefined;
  return bundle.reviewerLabels[userId] || 'Administrator';
}

function getFieldLabel(fieldKey?: DocumentFieldKey) {
  return fieldKey ? DOCUMENT_FIELD_LABELS[fieldKey] : 'Dokumentenangabe';
}

function getStatusLabel(status: AdminRequestStatus) {
  if (status === 'reviewing') return 'In Bearbeitung';
  if (status === 'completed') return 'Abgeschlossen';
  return 'Neu';
}

function getLatestTimestamp(values: string[]) {
  let latest = 0;
  for (const value of values) {
    const parsed = Date.parse(value);
    if (Number.isFinite(parsed) && parsed > latest) latest = parsed;
  }
  return latest;
}
