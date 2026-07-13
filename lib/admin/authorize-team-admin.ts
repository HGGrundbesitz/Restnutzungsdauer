import 'server-only';
import type {SupabaseClient, User} from '@supabase/supabase-js';
import {getSupabaseAdminClient} from '@/lib/supabase-admin';

export type AdminAuthorizationResult =
  | {ok: true; supabase: SupabaseClient; user: User}
  | {ok: false; status: 401 | 403 | 503; error: string};

export async function authorizeTeamAdmin(request: Request): Promise<AdminAuthorizationResult> {
  const authHeader = request.headers.get('authorization');
  const accessToken = authHeader?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!accessToken) {
    return {ok: false, status: 401, error: 'Bitte melden Sie sich erneut im Adminbereich an.'};
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return {ok: false, status: 503, error: 'Die Admin-Funktion ist momentan nicht verfügbar.'};
  }

  const {data: userData, error: userError} = await supabase.auth.getUser(accessToken);
  if (userError || !userData.user) {
    return {ok: false, status: 401, error: 'Ihre Admin-Sitzung ist abgelaufen.'};
  }

  const {data: admin, error: adminError} = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', userData.user.id)
    .eq('active', true)
    .eq('role', 'admin')
    .maybeSingle();

  if (adminError || !admin) {
    return {ok: false, status: 403, error: 'Für diese Funktion fehlt die Admin-Berechtigung.'};
  }

  return {ok: true, supabase, user: userData.user};
}

