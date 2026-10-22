import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "node:crypto";
import { atenderSite } from "@/lib/robo/sessao-site";

const COOKIE = "cv_sessao";
const schema = z.object({ texto: z.string().max(2000), botaoId: z.string().max(40).optional(), concluidas: z.array(z.number().int().min(1).max(20)).max(20).optional() });

function sessaoDe(req: NextRequest) { return req.cookies.get(COOKIE)?.value ?? null; }

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ erro: "Mensagem inválida." }, { status: 400 });
  let sessao = sessaoDe(req); const nova = !sessao;
  if (!sessao) sessao = crypto.randomUUID();
  try {
    const r = await atenderSite(sessao, parsed.data.texto, parsed.data.botaoId, parsed.data.concluidas ?? []);
    const res = NextResponse.json(r);
    if (nova) res.cookies.set(COOKIE, sessao, { httpOnly: true, sameSite: "none", secure: true, maxAge: 60 * 60 * 24 * 365, path: "/" });
    return res;
  } catch (e) {
    console.error("[conversar]", e);
    return NextResponse.json({ erro: "A Esperança está indisponível agora. Se for urgente: 188 (CVV)." }, { status: 500 });
  }
}
