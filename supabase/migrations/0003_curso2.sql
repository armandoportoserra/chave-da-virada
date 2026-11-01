-- Curso 2 (Apocalipse — Revelações de Esperança): um certificado por curso.
alter table certificados add column if not exists curso smallint not null default 1;
-- Corrige o gatilho de conversas (a coluna é atualizada_em, não atualizado_em).
create or replace function set_atualizada_em() returns trigger language plpgsql as $$ begin new.atualizada_em = now(); return new; end $$;
drop trigger if exists conversas_atualizada on conversas;
create trigger conversas_atualizada before update on conversas for each row execute function set_atualizada_em();
