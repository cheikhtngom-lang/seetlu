-- Seetlu — droits de l'API sur le schéma seetlu.
-- À compléter dans le tableau de bord : Project Settings > Data API > Exposed schemas > ajouter « seetlu ».
-- Les règles d'accès (0002) restent le vrai verrou : ces droits ne font qu'ouvrir la porte de l'API.

grant usage on schema seetlu to anon, authenticated, service_role;

grant select, insert, update, delete on all tables in schema seetlu to authenticated, service_role;
grant usage, select on all sequences in schema seetlu to authenticated, service_role;

alter default privileges in schema seetlu
  grant select, insert, update, delete on tables to authenticated, service_role;
alter default privileges in schema seetlu
  grant usage, select on sequences to authenticated, service_role;
