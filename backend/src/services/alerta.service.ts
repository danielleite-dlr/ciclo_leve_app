import { prisma } from '../config/database';

// Alertas para a dona do app no Telegram: cadastro, atividade (login, uso, registro do dia),
// primeira abertura e atualizacao.
// Liga so com TELEGRAM_BOT_TOKEN e TELEGRAM_CHAT_ID no .env. Nunca atrasa nem derruba a requisicao.
// Nada de dado de saude aqui: so nome, e-mail e versao do app.

const API = 'https://api.telegram.org';

export function alertasLigados() {
  return !!process.env.TELEGRAM_BOT_TOKEN && !!process.env.TELEGRAM_CHAT_ID;
}

/** Escapa texto para o modo HTML do Telegram. */
export const esc = (s: unknown) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function avisar(html: string) {
  if (!alertasLigados()) return;
  fetch(`${API}/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text: html, parse_mode: 'HTML', disable_web_page_preview: true }),
    signal: AbortSignal.timeout(5000),
  })
    .then((r) => {
      if (!r.ok) console.error(`[alerta] Telegram respondeu ${r.status}`);
    })
    .catch((e) => console.error('[alerta] falha ao enviar:', e?.message));
}

const pessoa = (u: { nomeCompleto: string; email: string }) => `${esc(u.nomeCompleto)} (${esc(u.email)})`;

export async function avisarCadastro(u: { id: string; nomeCompleto: string; email: string }) {
  if (!alertasLigados()) return;
  ultimoAlerta.set(u.id, Date.now()); // o uso logo depois do cadastro nao gera outro alerta
  const total = await prisma.user.count({ where: { deletedAt: null } }).catch(() => null);
  avisar(`🎉 <b>Novo cadastro</b>\n${pessoa(u)}${total ? `\nTotal de contas: ${total}` : ''}`);
}

// Atividade da usuaria (login, uso do app, registro do dia): no maximo 1 alerta a cada 2 h por usuaria.
// O controle fica em memoria: se a API reiniciar, a proxima atividade pode avisar antes das 2 h.
const INTERVALO_ATIVIDADE_MS = 2 * 60 * 60 * 1000;
const ultimoAlerta = new Map<string, number>();

const TEXTO_ATIVIDADE = {
  login: '🔑 <b>Login</b>',
  uso: '👀 <b>Usando o app</b>',
  // so o fato de ter registrado: os sintomas sao dado de saude e nao saem do servidor
  registro: '📝 <b>Registrou como está hoje</b>',
};

export type Atividade = keyof typeof TEXTO_ATIVIDADE;

/** Avisa a atividade, respeitando a janela de 2 h. Passe a usuaria se ja tiver em maos, senao busca pelo id. */
export async function avisarAtividade(
  tipo: Atividade,
  userId: string,
  u?: { nomeCompleto: string; email: string } | null,
) {
  if (!alertasLigados()) return;
  const agora = Date.now();
  if (agora - (ultimoAlerta.get(userId) ?? 0) < INTERVALO_ATIVIDADE_MS) return;
  ultimoAlerta.set(userId, agora);
  try {
    const dados = u ?? (await prisma.user.findUnique({ where: { id: userId }, select: { nomeCompleto: true, email: true } }));
    if (dados) avisar(`${TEXTO_ATIVIDADE[tipo]}\n${pessoa(dados)}`);
  } catch {
    ultimoAlerta.delete(userId);
  }
}

export type Abertura = {
  evento: 'instalacao' | 'atualizacao';
  versao: string;
  build: string;
  buildAnterior?: string | null;
  plataforma: string;
  aparelho?: string | null;
};

export function avisarAbertura(a: Abertura, u?: { nomeCompleto: string; email: string } | null) {
  const onde = `${esc(a.plataforma)}${a.aparelho ? ` · ${esc(a.aparelho)}` : ''}`;
  const quem = u ? `\n${pessoa(u)}` : '';
  if (a.evento === 'instalacao') {
    avisar(`📲 <b>Novo download</b> (primeira abertura)\nVersão ${esc(a.versao)} (${esc(a.build)}) · ${onde}${quem}`);
  } else {
    const de = a.buildAnterior ? `${esc(a.buildAnterior)} → ` : '';
    avisar(`🔄 <b>Atualização do app</b>\nBuild ${de}${esc(a.build)} (versão ${esc(a.versao)}) · ${onde}${quem}`);
  }
}
