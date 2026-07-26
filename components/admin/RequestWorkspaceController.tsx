'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {adminFetch} from '@/lib/admin/admin-fetch';
import type {AdminRequestRecord, AdminRequestStatus} from '@/lib/admin/request-types';
import type {ReviewBundle} from '@/lib/rnd/document-analysis/types';

type RequestWorkspaceControllerValue = {
  requestId: string;
  request: AdminRequestRecord | null;
  bundle: ReviewBundle | null;
  loading: boolean;
  bundleLoading: boolean;
  updatingStatus: boolean;
  notFound: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  refreshBundle: () => Promise<void>;
  updateStatus: (status: AdminRequestStatus) => Promise<void>;
};

const RequestWorkspaceContext = createContext<RequestWorkspaceControllerValue | null>(null);

class WorkspaceRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function loadRequest(requestId: string) {
  const response = await adminFetch(`/api/admin/requests/${encodeURIComponent(requestId)}`);
  const payload = (await response.json()) as {request?: AdminRequestRecord; error?: string};
  if (!response.ok || !payload.request) {
    throw new WorkspaceRequestError(payload.error || 'Die Anfrage konnte nicht geladen werden.', response.status);
  }
  return payload.request;
}

async function loadBundle(requestId: string) {
  const response = await adminFetch(`/api/admin/requests/${encodeURIComponent(requestId)}/document-review`);
  const payload = (await response.json()) as ReviewBundle & {error?: string};
  if (!response.ok) {
    throw new WorkspaceRequestError(payload.error || 'Die Dokumentenprüfung konnte nicht geladen werden.', response.status);
  }
  return payload;
}

export function RequestWorkspaceProvider({
  requestId,
  children,
}: {
  requestId: string;
  children: ReactNode;
}) {
  const [request, setRequest] = useState<AdminRequestRecord | null>(null);
  const [bundle, setBundle] = useState<ReviewBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [bundleLoading, setBundleLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshBundle = useCallback(async () => {
    setBundleLoading(true);
    try {
      const nextBundle = await loadBundle(requestId);
      setBundle(nextBundle);
    } finally {
      setBundleLoading(false);
    }
  }, [requestId]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setBundleLoading(true);
    setError(null);
    setNotFound(false);

    try {
      const [nextRequest, nextBundle] = await Promise.all([loadRequest(requestId), loadBundle(requestId)]);
      setRequest(nextRequest);
      setBundle(nextBundle);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'Der Arbeitsbereich konnte nicht geladen werden.';
      setRequest(null);
      setBundle(null);
      setNotFound(loadError instanceof WorkspaceRequestError && loadError.status === 404);
      setError(message);
    } finally {
      setLoading(false);
      setBundleLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const updateStatus = useCallback(
    async (status: AdminRequestStatus) => {
      setUpdatingStatus(true);
      try {
        const response = await adminFetch(`/api/admin/requests/${encodeURIComponent(requestId)}`, {
          method: 'PATCH',
          body: JSON.stringify({status}),
        });
        const payload = (await response.json()) as {request?: Partial<AdminRequestRecord>; error?: string};
        if (!response.ok || !payload.request) {
          throw new Error(payload.error || 'Der Status konnte nicht aktualisiert werden.');
        }
        setRequest((current) => (current ? {...current, ...payload.request, status} : current));
        await refreshBundle();
      } finally {
        setUpdatingStatus(false);
      }
    },
    [refreshBundle, requestId],
  );

  const value = useMemo<RequestWorkspaceControllerValue>(
    () => ({
      requestId,
      request,
      bundle,
      loading,
      bundleLoading,
      updatingStatus,
      notFound,
      error,
      refresh,
      refreshBundle,
      updateStatus,
    }),
    [
      bundle,
      bundleLoading,
      error,
      loading,
      notFound,
      refresh,
      refreshBundle,
      request,
      requestId,
      updateStatus,
      updatingStatus,
    ],
  );

  return <RequestWorkspaceContext.Provider value={value}>{children}</RequestWorkspaceContext.Provider>;
}

export function useRequestWorkspace() {
  const context = useContext(RequestWorkspaceContext);
  if (!context) {
    throw new Error('useRequestWorkspace must be used inside RequestWorkspaceProvider.');
  }
  return context;
}
