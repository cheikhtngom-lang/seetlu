-- Seetlu — règles d'accès : chacun ne voit que les espaces dont il est membre.

create function is_member(ws uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from members where workspace_id = ws and user_id = auth.uid());
$$;

-- Crée « Mon espace » à la première connexion et renvoie l'espace de l'utilisateur.
create function ensure_workspace() returns uuid
language plpgsql security definer set search_path = public as $$
declare
  ws uuid;
begin
  if auth.uid() is null then
    raise exception 'non connecté';
  end if;
  select workspace_id into ws from members where user_id = auth.uid() order by workspace_id limit 1;
  if ws is null then
    insert into workspaces (nom) values ('Mon espace') returning id into ws;
    insert into members (workspace_id, user_id, role) values (ws, auth.uid(), 'owner');
  end if;
  return ws;
end;
$$;

revoke all on function is_member(uuid) from public;
revoke all on function ensure_workspace() from public;
grant execute on function is_member(uuid) to authenticated;
grant execute on function ensure_workspace() to authenticated;

alter table workspaces enable row level security;
alter table members enable row level security;

create policy "membres lisent leur espace" on workspaces
  for select to authenticated using (is_member(id));
create policy "membres renomment leur espace" on workspaces
  for update to authenticated using (is_member(id)) with check (is_member(id));

create policy "chacun voit ses adhésions" on members
  for select to authenticated using (user_id = auth.uid());

-- Toutes les tables de travail : accès réservé aux membres de l'espace.
do $$
declare
  t text;
begin
  foreach t in array array[
    'products', 'places', 'place_sources', 'harvests', 'prospects', 'audits',
    'messages', 'tracked_links', 'prospect_events', 'opt_outs'
  ] loop
    execute format('alter table %I enable row level security', t);
    execute format(
      'create policy "membres de l''espace" on %I for all to authenticated using (is_member(workspace_id)) with check (is_member(workspace_id))',
      t
    );
  end loop;
end;
$$;
