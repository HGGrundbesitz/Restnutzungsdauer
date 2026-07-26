'use client';

import {supabase} from '@/lib/supabase';

let refreshPromise: ReturnType<typeof supabase.auth.refreshSession> | null = null;

async function refreshAdminSession() {
  if (!refreshPromise) {
    refreshPromise = supabase.auth.refreshSession().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

async function getAdminAccessToken(forceRefresh = false) {
  const {data, error} = await supabase.auth.getSession();
  if (error || !data.session) {
    throw new Error('Bitte melden Sie sich erneut im Adminbereich an.');
  }

  const expiresSoon =
    typeof data.session.expires_at === 'number' &&
    data.session.expires_at * 1000 <= Date.now() + 60_000;

  if (!forceRefresh && !expiresSoon) {
    return data.session.access_token;
  }

  const {data: refreshedData, error: refreshError} = await refreshAdminSession();
  if (refreshError || !refreshedData.session?.access_token) {
    await supabase.auth.signOut({scope: 'local'});
    throw new Error('Ihre Admin-Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.');
  }

  return refreshedData.session.access_token;
}

function createRequestInit(init: RequestInit, accessToken: string): RequestInit {
  return {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      ...init.headers,
    },
    cache: 'no-store',
  };
}

export async function adminFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const accessToken = await getAdminAccessToken();
  const response = await fetch(input, createRequestInit(init, accessToken));

  if (response.status !== 401) {
    return response;
  }

  const refreshedAccessToken = await getAdminAccessToken(true);
  return fetch(input, createRequestInit(init, refreshedAccessToken));
}
