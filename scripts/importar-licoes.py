# -*- coding: utf-8 -*-
"""
Converte os dois arquivos do curso (Markdown para WhatsApp) em
src/content/licoes.json e supabase/migrations/0002_licoes.sql.

Uso:  python3 scripts/importar-licoes.py CURSO_Bloco_I.md CURSO_Blocos_II_a_V.md
"""
import json, re, sys, os

BLOCOS = {1: "Esperança", 2: "Você e Deus", 3: "Jesus", 4: "Uma vida inteira", 5: "O futuro"}
NECESSIDADE = {
    1: "Solidão", 2: "Sem vontade de viver", 3: "Sofrimento, luto", 4: "Ansiedade, exaustão",
    5: "Valor próprio", 6: "Não ter com quem falar", 7: "Onde buscar respostas", 8: "Culpa, mágoa",
    9: "Curiosidade", 10: "Culpa", 11: "Medo da morte", 12: "Vergonha, recomeço",
    13: "Saúde, vícios", 14: "Sobrecarga", 15: "Conflitos, pressão", 16: "Pertencimento",
    17: "Direção", 18: "Esperança frente à perda", 19: "Futuro", 20: "Compromisso",
}
CVV = "Se estiver pensando em desistir da vida, ligue 188 (CVV, 24h, gratuito) ou me escreva agora."
YT = re.compile(r"https?://(?:www\.)?(?:youtube\.com/watch\?v=[\w-]+|youtu\.be/[\w-]+|novotempo\.com/\S+)")


def slug(t):
    import unicodedata
    t = unicodedata.normalize("NFKD", t).encode("ascii", "ignore").decode()
    t = re.sub(r"[^a-zA-Z0-9]+", "-", t.lower()).strip("-")
    return t[:60]


def limpar(t):
    # Markdown -> texto WhatsApp: *itálico* já é nativo; **negrito** vira *negrito*
    t = re.sub(r"\*\*(.+?)\*\*", r"*\1*", t)
    t = re.sub(r"\s*\(total: [\d.]+\)", "", t)
    return t.strip()


def parse_quiz(texto):
    """Extrai alternativas A) B) C) e explicação de uma mensagem de quiz."""
    linhas = [l.strip() for l in texto.splitlines() if l.strip()]
    pergunta, alts, correta, expl = [], [], None, None
    for l in linhas:
        m = re.match(r"^([A-D])\)\s*(.+?)\s*(✅)?$", l)
        if m:
            alts.append(m.group(2).strip())
            if m.group(3):
                correta = len(alts) - 1
        elif l.startswith("*(") or l.startswith("(Explicação"):
            expl = l.strip("*() ").replace("Explicação:", "").strip()
        elif not alts:
            pergunta.append(l)
    if len(alts) >= 2 and correta is not None:
        return {"pergunta": " ".join(pergunta), "alternativas": alts, "correta": correta, "explicacao": expl}
    return None


def parse_file(path, licoes):
    md = open(path, encoding="utf-8").read()
    partes = re.split(r"^## LIÇÃO (\d+) — (.+)$", md, flags=re.M)
    # partes: [preambulo, num, titulo, corpo, num, titulo, corpo, ...]
    for i in range(1, len(partes), 3):
        num, titulo, corpo = int(partes[i]), partes[i + 1].strip(), partes[i + 2]
        corpo = corpo.split("\n---")[0]
        fonte_m = re.search(r"^\*Fonte: (.+?)\*$", corpo, flags=re.M)
        fonte = fonte_m.group(1).strip() if fonte_m else ""
        msgs_raw = re.split(r"^\*\*Msg (\d+)(?: — ([^*]+))?\*\*\s*$", corpo, flags=re.M)
        mensagens, quiz, botoes, videos, oracao, exercicio = [], None, [], [], None, None
        for j in range(1, len(msgs_raw), 3):
            rotulo = (msgs_raw[j + 1] or "").strip().lower()
            texto = msgs_raw[j + 2].strip()
            # botões (linha 🔘) saem do texto e viram botões da lição
            opcoes = []
            novas = []
            for l in texto.splitlines():
                if "🔘" in l:
                    antes, _, resto = l.partition("🔘")
                    opcoes = [b.strip(" 🔘") for b in ("🔘" + resto).split("·")]
                    if antes.strip():
                        novas.append(antes.rstrip())
                else:
                    novas.append(l)
            texto = "\n".join(novas).strip()
            if opcoes:
                botoes = opcoes
            videos += YT.findall(texto)
            tipo = "texto"
            if "quiz" in rotulo:
                q = parse_quiz(texto)
                if q:
                    quiz = q
                    tipo = "quiz"
            elif "exercício" in rotulo or "exercicio" in rotulo:
                tipo = "exercicio"
                exercicio = texto
            elif "para pensar" in rotulo:
                tipo = "reflexao"
            elif "decisão" in rotulo:
                tipo = "decisao"
            elif "vídeo" in rotulo or "fechamento" in rotulo:
                tipo = "fechamento"
                om = re.search(r"Oração(?: de hoje[^:]*)?:\s*\"(.+?)\"", texto)
                if om:
                    oracao = om.group(1)
                # o 188 é enviado pelo motor, sempre, como mensagem própria
                texto = re.sub(r"\n*Se estiver pensando em desistir da vida.*?(\n|$)", "\n", texto).strip()
            msg = {"n": int(msgs_raw[j]), "tipo": tipo, "rotulo": (msgs_raw[j + 1] or "").strip(), "texto": limpar(texto)}
            if opcoes:
                msg["opcoes"] = opcoes
            mensagens.append(msg)
        bloco = (num - 1) // 4 + 1
        licoes[num] = {
            "numero": num, "bloco": bloco, "bloco_nome": BLOCOS[bloco], "slug": slug(titulo),
            "titulo": titulo, "necessidade": NECESSIDADE[num], "fonte": fonte,
            "mensagens": mensagens, "quiz": quiz, "exercicio": exercicio, "oracao": oracao,
            "videos": list(dict.fromkeys(videos)), "botoes": botoes,
            "pontos": 100 if (quiz or exercicio) else 0, "cvv": CVV,
        }


def main():
    licoes = {}
    for p in sys.argv[1:]:
        parse_file(p, licoes)
    lista = [licoes[k] for k in sorted(licoes)]
    assert [l["numero"] for l in lista] == list(range(1, 21)), [l["numero"] for l in lista]
    os.makedirs("src/content", exist_ok=True)
    with open("src/content/licoes.json", "w", encoding="utf-8") as f:
        json.dump(lista, f, ensure_ascii=False, indent=2)

    # SQL de seed
    def q(s):
        return "NULL" if s is None else "'" + str(s).replace("'", "''") + "'"
    linhas = ["-- Gerado por scripts/importar-licoes.py — não editar à mão",
              "alter table estudos add column if not exists mensagens jsonb not null default '[]';",
              "alter table estudos add column if not exists botoes jsonb not null default '[]';",
              "alter table estudos add column if not exists videos jsonb not null default '[]';",
              "alter table estudos add column if not exists fonte text;",
              "alter table estudos add column if not exists exercicio text;",
              "",
              "update selos set nome='Esperança', descricao='Concluiu o bloco I — Esperança' where codigo='bloco1';",
              "update selos set nome='Você e Deus', descricao='Concluiu o bloco II — Você e Deus' where codigo='bloco2';",
              "update selos set nome='Jesus', descricao='Concluiu o bloco III — Jesus' where codigo='bloco3';",
              "update selos set nome='Vida Inteira', descricao='Concluiu o bloco IV — Uma vida inteira' where codigo='bloco4';",
              "update selos set nome='O Futuro', descricao='Concluiu o bloco V — O futuro' where codigo='bloco5';",
              ""]
    for l in lista:
        corpo = "\n\n".join(m["texto"] for m in l["mensagens"])
        linhas.append(
            "insert into estudos (numero, bloco, slug, titulo, necessidade, tempo_leitura, corpo_md, quiz, oracao, video_url, pontos, publicado, mensagens, botoes, videos, fonte, exercicio) values ("
            f"{l['numero']}, {l['bloco']}, {q(l['slug'])}, {q(l['titulo'])}, {q(l['necessidade'])}, 5, {q(corpo)}, "
            f"{q(json.dumps([l['quiz']] if l['quiz'] else [], ensure_ascii=False))}::jsonb, {q(l['oracao'])}, {q(l['videos'][0] if l['videos'] else None)}, {l['pontos']}, true, "
            f"{q(json.dumps(l['mensagens'], ensure_ascii=False))}::jsonb, {q(json.dumps(l['botoes'], ensure_ascii=False))}::jsonb, "
            f"{q(json.dumps(l['videos'], ensure_ascii=False))}::jsonb, {q(l['fonte'])}, {q(l['exercicio'])})\n"
            "on conflict (numero) do update set bloco=excluded.bloco, slug=excluded.slug, titulo=excluded.titulo, necessidade=excluded.necessidade, corpo_md=excluded.corpo_md, quiz=excluded.quiz, oracao=excluded.oracao, video_url=excluded.video_url, pontos=excluded.pontos, publicado=true, mensagens=excluded.mensagens, botoes=excluded.botoes, videos=excluded.videos, fonte=excluded.fonte, exercicio=excluded.exercicio;")
    with open("supabase/migrations/0002_licoes.sql", "w", encoding="utf-8") as f:
        f.write("\n".join(linhas) + "\n")
    for l in lista:
        print(f"{l['numero']:>2} B{l['bloco']} msgs={len(l['mensagens'])} quiz={'S' if l['quiz'] else '-'} ex={'S' if l['exercicio'] else '-'} videos={len(l['videos'])} botoes={len(l['botoes'])} oracao={'S' if l['oracao'] else '-'}  {l['titulo']}")


if __name__ == "__main__":
    main()
