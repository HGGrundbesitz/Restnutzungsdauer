-- 1. Create the user first in Supabase Dashboard -> Authentication -> Users.
-- 2. Replace the email below and run this file in SQL Editor.

do $$
declare
  target_email text := lower('ADMIN_EMAIL_HIER_EINTRAGEN');
  target_user_id uuid;
begin
  if target_email = lower('ADMIN_EMAIL_HIER_EINTRAGEN') then
    raise exception 'Bitte ADMIN_EMAIL_HIER_EINTRAGEN durch die echte Admin-E-Mail ersetzen.';
  end if;

  select id
  into target_user_id
  from auth.users
  where lower(email) = target_email
  limit 1;

  if target_user_id is null then
    raise exception 'Kein Auth-Benutzer mit E-Mail % gefunden. Zuerst unter Authentication -> Users anlegen.', target_email;
  end if;

  insert into public.admin_users (user_id, email, role, active)
  values (target_user_id, target_email, 'admin', true)
  on conflict (user_id) do update
  set email = excluded.email,
      role = 'admin',
      active = true,
      updated_at = now();
end;
$$;

select user_id, email, role, active, created_at
from public.admin_users
order by created_at;
