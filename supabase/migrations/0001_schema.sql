-- Seetlu — schéma de la phase 1 (socle de prospection).
-- Tout ce qui appartient à un client porte un workspace_id (multi-clients dès le départ).

create type prospect_statut as enum (
  'a_contacter', 'contacte', 'a_repondu', 'demo', 'client', 'perdu', 'ne_plus_contacter'
);

create table workspaces (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  created_at timestamptz not null default now()
);

create table members (
  workspace_id uuid not null references workspaces on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  role text not null default 'owner',
  primary key (workspace_id, user_id)
);

create table products (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces on delete cascade,
  url text not null,
  nom text not null,
  resume text,
  description_manuelle text,
  metiers text[] not null default '{}',
  arguments text[] not null default '{}',
  prix text,
  tracking_site_id text unique not null default substr(replace(gen_random_uuid()::text, '-', ''), 1, 12),
  created_at timestamptz not null default now()
);

create table places (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces on delete cascade,
  nom text not null,
  metier text not null,
  lat double precision not null,
  lng double precision not null,
  telephone text,
  telephone_type text check (telephone_type in ('mobile', 'fixe')),
  telephone_brut text,
  mail text,
  site text,
  reseaux jsonb not null default '{}',
  adresse text,
  quartier text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table place_sources (
  workspace_id uuid not null references workspaces on delete cascade,
  place_id uuid not null references places on delete cascade,
  source text not null check (source in ('osm', 'overture', 'photo', 'lien', 'csv', 'manuel')),
  source_id text not null,
  primary key (workspace_id, source, source_id)
);

create table harvests (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces on delete cascade,
  product_id uuid not null references products on delete cascade,
  centre_lat double precision not null,
  centre_lng double precision not null,
  rayon_m integer not null,
  metiers text[] not null default '{}',
  trouves integer not null default 0,
  nouveaux integer not null default 0,
  created_at timestamptz not null default now()
);

create table prospects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces on delete cascade,
  product_id uuid not null references products on delete cascade,
  place_id uuid not null references places on delete cascade,
  harvest_id uuid references harvests on delete set null,
  score integer not null,
  score_detail jsonb not null,
  priorite text not null check (priorite in ('premier', 'ensuite', 'plus_tard')),
  pourquoi text,
  statut prospect_statut not null default 'a_contacter',
  notes text,
  dernier_contact_at timestamptz,
  prochaine_relance_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, place_id)
);

create table audits (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces on delete cascade,
  place_id uuid not null references places on delete cascade,
  checks jsonb not null,
  pagespeed integer,
  created_at timestamptz not null default now()
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces on delete cascade,
  prospect_id uuid not null references prospects on delete cascade,
  texte text not null,
  canal text check (canal in ('whatsapp', 'mail', 'copie')),
  code text not null,
  envoye_at timestamptz,
  created_at timestamptz not null default now()
);

create table tracked_links (
  code text primary key,
  workspace_id uuid not null references workspaces on delete cascade,
  prospect_id uuid not null references prospects on delete cascade,
  product_id uuid not null references products on delete cascade,
  cible_url text not null,
  clics integer not null default 0,
  premier_clic_at timestamptz,
  dernier_clic_at timestamptz
);

create table prospect_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces on delete cascade,
  prospect_id uuid not null references prospects on delete cascade,
  type text not null check (type in ('statut', 'message', 'note', 'clic')),
  de text,
  vers text,
  created_at timestamptz not null default now()
);

-- Téléphone E.164 ou mail en minuscules : ne plus jamais préparer de message pour ce contact.
create table opt_outs (
  workspace_id uuid not null references workspaces on delete cascade,
  contact text not null,
  created_at timestamptz not null default now(),
  primary key (workspace_id, contact)
);

create index places_position on places (workspace_id, lat, lng);
create index prospects_file on prospects (workspace_id, statut, score desc);
create index prospects_relance on prospects (workspace_id, prochaine_relance_at) where prochaine_relance_at is not null;
create index events_recents on prospect_events (workspace_id, created_at desc);

create function set_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger places_updated before update on places for each row execute function set_updated_at();
create trigger prospects_updated before update on prospects for each row execute function set_updated_at();
