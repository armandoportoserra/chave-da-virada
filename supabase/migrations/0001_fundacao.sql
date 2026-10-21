-- ============================================================================
-- A CHAVE DA VIRADA 2.0 — Esquema de fundação (Supabase / Postgres)
-- Aplicar no SQL Editor do projeto Supabase, ou via `supabase db push`.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------- Enums ----------------------------------------------------------
create type estagio_jornada as enum (
  'descoberta',      -- cadastrou-se
  'interesse',       -- pediu livro / iniciou curso / pediu oração
  'conexao',         -- conversou com humano
  'engajamento',     -- está no curso
  'conclusao',       -- concluiu os 20 estudos
  'transformacao'    -- visita / igreja / batismo
);

create type origem_contato as enum ('folder', 'site', 'whatsapp', 'indicacao', 'congresso', 'outro');
create type ritmo_estudo as enum ('diario', 'duas_semana', 'semanal', 'livre');
create type status_oracao as enum ('recebido', 'orado', 'ligacao_agendada', 'visita_agendada', 'concluido');
create type modalidade_oracao as enum ('distancia', 'ligacao', 'visita');
create type perfil_voluntario as enum ('direcao', 'coordenador', 'voluntario', 'intercessor');
create type canal_mensagem as enum ('whatsapp', 'site');
create type autor_mensagem as enum ('pessoa', 'robo', 'humano', 'sistema');
create type estado_conversa as enum ('robo', 'aguardando_humano', 'humano', 'encerrada', 'crise');

-- ---------- Território: ondas e rotas de distribuição ---------------------
create table ondas (
  id          uuid primary key default gen_random_uuid(),
  numero      int not null unique,
  nome        text not null,
  territorio  text not null,              -- ex.: 'Panazzolo', 'Centro'
  data        date,
  folders_planejados int,
  observacoes text,
  criado_em   timestamptz not null default now()
);

create table rotas (
  id                uuid primary key default gen_random_uuid(),
  onda_id           uuid not null references ondas(id) on delete cascade,
  codigo            text not null unique,  -- impresso no QR do folder: ex. 'P01', 'C07'
  descricao         text not null,         -- ruas / quarteirões
  domicilios_estim  int,
  folders_entregues int default 0,
  dupla             text,                  -- nomes da dupla
  concluida_em      timestamptz
);

-- ---------- Pessoas (quem chega pelo folder, site ou WhatsApp) -------------
create table pessoas (
  id               uuid primary key default gen_random_uuid(),
  nome             text,
  whatsapp         text unique,            -- E.164: +5554999999999
  email            text,
  origem           origem_contato not null default 'site',
  rota_codigo      text references rotas(codigo),
  estagio          estagio_jornada not null default 'descoberta',
  ritmo            ritmo_estudo not null default 'semanal',
  quer_livro       boolean not null default false,
  quer_curso       boolean not null default false,
  quer_oracao      boolean not null default false,
  quer_contato     boolean not null default false,
  endereco         text,                   -- só se a pessoa oferecer (entrega de livro/certificado)
  menor_de_idade   boolean,
  autorizacao_responsavel boolean,
  consent_versao   text,                   -- versão do termo aceito
  consent_em       timestamptz,
  consent_imagem   boolean default false,
  optout_em        timestamptz,            -- pediu para não receber mais nada
  anonimizado_em   timestamptz,            -- direito de exclusão exercido
  responsavel_id   uuid,                   -- voluntário que acompanha
  pontos           int not null default 0,
  nivel            text not null default 'Semente',
  ultimo_contato   timestamptz,
  utm              jsonb,
  criado_em        timestamptz not null default now(),
  atualizado_em    timestamptz not null default now()
);
create index on pessoas (estagio);
create index on pessoas (responsavel_id);
create index on pessoas (rota_codigo);

-- ---------- Voluntários ----------------------------------------------------
create table voluntarios (
  id          uuid primary key default gen_random_uuid(),
  auth_user   uuid unique,                 -- auth.users.id (Supabase Auth)
  nome        text not null,
  whatsapp    text,
  perfil      perfil_voluntario not null default 'voluntario',
  ativo       boolean not null default true,
  criado_em   timestamptz not null default now()
);
alter table pessoas add constraint pessoas_responsavel_fk
  foreign key (responsavel_id) references voluntarios(id) on delete set null;

create table plantoes (
  id            uuid primary key default gen_random_uuid(),
  voluntario_id uuid not null references voluntarios(id) on delete cascade,
  inicio        timestamptz not null,
  fim           timestamptz not null,
  tipo          perfil_voluntario not null default 'voluntario'
);

-- ---------- Curso: 20 estudos ---------------------------------------------
create table estudos (
  numero        int primary key check (numero between 1 and 20),
  bloco         int not null check (bloco between 1 and 5),
  slug          text not null unique,
  titulo        text not null,
  subtitulo     text,
  necessidade   text,
  tempo_leitura int,
  corpo_md      text not null,             -- markdown do texto principal
  versiculos    jsonb not null default '[]',  -- [{ref, texto}]
  reflexao      jsonb not null default '[]',  -- [string]
  quiz          jsonb not null default '[]',  -- [{pergunta, alternativas[4], correta, explicacao}]
  oracao        text,
  gancho        text,
  video_url     text,
  pontos        int not null default 100,
  publicado     boolean not null default false
);

create table progresso (
  id          uuid primary key default gen_random_uuid(),
  pessoa_id   uuid not null references pessoas(id) on delete cascade,
  estudo      int not null references estudos(numero),
  iniciado_em timestamptz not null default now(),
  concluido_em timestamptz,
  nota        int check (nota between 0 and 5),   -- maior nota obtida no quiz
  tentativas  int not null default 0,
  canal       canal_mensagem not null default 'site',
  unique (pessoa_id, estudo)
);

create table selos (
  codigo    text primary key,
  nome      text not null,
  descricao text,
  icone     text
);

create table conquistas (
  pessoa_id  uuid not null references pessoas(id) on delete cascade,
  selo       text not null references selos(codigo),
  ganho_em   timestamptz not null default now(),
  primary key (pessoa_id, selo)
);

create table certificados (
  codigo       text primary key,            -- ex.: 'CV-2026-00017'
  pessoa_id    uuid not null references pessoas(id) on delete cascade,
  nome_impresso text not null,
  nota_final   numeric(3,1) not null,
  avaliacao    text not null,               -- 'Com louvor' | 'Muito bom' | 'Concluído'
  emitido_em   timestamptz not null default now(),
  pdf_path     text,                        -- Supabase Storage
  revogado     boolean not null default false
);

-- ---------- Oração ---------------------------------------------------------
create table pedidos_oracao (
  id          uuid primary key default gen_random_uuid(),
  pessoa_id   uuid references pessoas(id) on delete set null,
  nome        text,
  pedido      text not null,
  modalidade  modalidade_oracao not null default 'distancia',
  status      status_oracao not null default 'recebido',
  intercessor_id uuid references voluntarios(id),
  orado_em    timestamptz,
  agendado_para timestamptz,
  retorno     text,
  criado_em   timestamptz not null default now()
);

-- ---------- Conversas e mensagens (WhatsApp e site) -----------------------
create table conversas (
  id          uuid primary key default gen_random_uuid(),
  pessoa_id   uuid not null references pessoas(id) on delete cascade,
  canal       canal_mensagem not null default 'whatsapp',
  estado      estado_conversa not null default 'robo',
  fluxo       text,                         -- fluxo atual da máquina de estados
  contexto    jsonb not null default '{}',  -- estado interno do robô
  humano_id   uuid references voluntarios(id),
  prioridade  int not null default 0,       -- 9 = crise
  aberta_em   timestamptz not null default now(),
  atualizada_em timestamptz not null default now()
);
create index on conversas (estado, prioridade desc, atualizada_em desc);

create table mensagens (
  id          bigint generated always as identity primary key,
  conversa_id uuid not null references conversas(id) on delete cascade,
  autor       autor_mensagem not null,
  texto       text not null,
  meta        jsonb,                        -- ids do WhatsApp, botões, etc.
  criado_em   timestamptz not null default now()
);
create index on mensagens (conversa_id, criado_em);

-- ---------- Tarefas para humanos (visita, ligação, livro impresso...) ------
create table tarefas (
  id            uuid primary key default gen_random_uuid(),
  pessoa_id     uuid references pessoas(id) on delete cascade,
  tipo          text not null,              -- 'visita' | 'ligacao' | 'livro_impresso' | 'certificado_impresso' | 'buscar_sabado' | 'crise'
  descricao     text,
  responsavel_id uuid references voluntarios(id),
  prioridade    int not null default 0,
  concluida_em  timestamptz,
  criado_em     timestamptz not null default now()
);

-- ---------- Eventos (analytics próprio, sem rastreador externo) -----------
create table eventos (
  id        bigint generated always as identity primary key,
  pessoa_id uuid references pessoas(id) on delete set null,
  nome      text not null,                  -- 'visita_landing', 'cadastro', 'estudo_concluido', ...
  dados     jsonb,
  criado_em timestamptz not null default now()
);

-- ---------- Tabela do sábado (pôr do sol em Caxias do Sul) ----------------
create table por_do_sol (
  data   date primary key,
  hora   time not null                      -- hora local America/Sao_Paulo
);

-- ---------- Funções utilitárias -------------------------------------------
create or replace function set_atualizado_em() returns trigger language plpgsql as $$
begin new.atualizado_em = now(); return new; end $$;
create trigger pessoas_atualizado before update on pessoas for each row execute function set_atualizado_em();
create trigger conversas_atualizada before update on conversas for each row execute function set_atualizado_em();

-- Nível a partir dos pontos
create or replace function nivel_por_pontos(p int) returns text language sql immutable as $$
  select case
    when p >= 3000 then 'Fruto'
    when p >= 1800 then 'Árvore'
    when p >= 900  then 'Raiz'
    when p >= 300  then 'Broto'
    else 'Semente' end
$$;

create or replace function pessoas_sync_nivel() returns trigger language plpgsql as $$
begin new.nivel = nivel_por_pontos(new.pontos); return new; end $$;
create trigger pessoas_nivel before insert or update of pontos on pessoas for each row execute function pessoas_sync_nivel();

-- É sábado agora? (entre pôr do sol de sexta e pôr do sol de sábado, hora local)
create or replace function eh_sabado(ts timestamptz default now()) returns boolean language plpgsql stable as $$
declare
  local_ts timestamp := ts at time zone 'America/Sao_Paulo';
  d date := local_ts::date;
  dow int := extract(dow from d);  -- 0=dom, 5=sex, 6=sab
  h time;
begin
  if dow = 5 then
    select hora into h from por_do_sol where data = d;
    return h is not null and local_ts::time >= h;
  elsif dow = 6 then
    select hora into h from por_do_sol where data = d;
    return h is null or local_ts::time < h;
  end if;
  return false;
end $$;

-- Próximo código de certificado
create sequence certificado_seq;
create or replace function proximo_codigo_certificado() returns text language sql as $$
  select 'CV-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('certificado_seq')::text, 5, '0')
$$;

-- ---------- Selos iniciais -------------------------------------------------
insert into selos (codigo, nome, descricao, icone) values
  ('bloco1', 'Você e Deus', 'Concluiu o bloco I', '🌱'),
  ('bloco2', 'Jesus', 'Concluiu o bloco II', '✝️'),
  ('bloco3', 'Vida nova', 'Concluiu o bloco III', '🌿'),
  ('bloco4', 'Saúde integral', 'Concluiu o bloco IV', '💛'),
  ('bloco5', 'O futuro', 'Concluiu o bloco V', '🌅'),
  ('primeira_oracao', 'Primeira oração', 'Fez o primeiro pedido de oração', '🙏'),
  ('sete_dias', 'Sete dias seguidos', 'Estudou sete dias seguidos', '🔥'),
  ('convidou', 'Convidou um amigo', 'Alguém se cadastrou pelo seu convite', '🤝'),
  ('louvor', 'Com louvor', 'Concluiu o curso com nota 9 ou mais', '🏅');

-- ---------- Row Level Security --------------------------------------------
alter table pessoas enable row level security;
alter table progresso enable row level security;
alter table conquistas enable row level security;
alter table certificados enable row level security;
alter table pedidos_oracao enable row level security;
alter table conversas enable row level security;
alter table mensagens enable row level security;
alter table tarefas enable row level security;
alter table voluntarios enable row level security;
alter table eventos enable row level security;
alter table estudos enable row level security;

-- Estudos publicados são públicos para leitura
create policy estudos_publicos on estudos for select using (publicado);
-- Certificados são verificáveis publicamente pelo código
create policy certificados_publicos on certificados for select using (not revogado);
-- Todo o resto é acessado apenas pelo servidor (service role) ou por voluntário autenticado
create policy voluntarios_leem_tudo on pessoas for select using (
  exists (select 1 from voluntarios v where v.auth_user = auth.uid() and v.ativo)
);
create policy voluntarios_leem_oracao on pedidos_oracao for select using (
  exists (select 1 from voluntarios v where v.auth_user = auth.uid() and v.ativo)
);
create policy voluntarios_leem_conversas on conversas for select using (
  exists (select 1 from voluntarios v where v.auth_user = auth.uid() and v.ativo)
);
create policy voluntarios_leem_mensagens on mensagens for select using (
  exists (select 1 from voluntarios v where v.auth_user = auth.uid() and v.ativo)
);
create policy voluntarios_leem_tarefas on tarefas for select using (
  exists (select 1 from voluntarios v where v.auth_user = auth.uid() and v.ativo)
);
create policy voluntario_se_ve on voluntarios for select using (auth_user = auth.uid());
-- Inserções públicas (cadastro, oração) passam pelo servidor com service role; nada direto do navegador.
