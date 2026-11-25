import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { calcularMetricas, credenciaisValidas, painelLigado, Metricas } from '../services/painel.service';

// Painel de uso: GET /api/v1/admin (abre no navegador, pede usuario e senha).
// Liga so quando ADMIN_USUARIO e ADMIN_SENHA estao no .env do servidor.

const router = Router();

// Senha errada: no maximo 20 tentativas a cada 15 min por IP
const limite = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, skipSuccessfulRequests: true, standardHeaders: true, legacyHeaders: false });

router.get('/', limite, async (req, res) => {
  if (!painelLigado()) return res.status(404).json({ error: 'Não encontrado' });
  if (!credenciaisValidas(req.headers.authorization)) {
    res.set('WWW-Authenticate', 'Basic realm="Painel CicloLeve", charset="UTF-8"');
    return res.status(401).send('Acesso restrito');
  }
  const m = await calcularMetricas();
  res.set({ 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' });
  if (req.query.formato === 'json') return res.json(m);
  res.type('html').send(pagina(m));
});

const num = (n: number) => n.toLocaleString('pt-BR');

function cartao(titulo: string, valor: number, nota = '') {
  return `<div class="card"><div class="t">${titulo}</div><div class="v">${num(valor)}</div>${nota ? `<div class="n">${nota}</div>` : ''}</div>`;
}

function pagina(m: Metricas) {
  const max = Math.max(1, ...m.cadastrosPorDia.map((d) => d.qtd));
  const barras = m.cadastrosPorDia
    .map((d) => {
      const [, mes, dia] = d.dia.split('-');
      return `<div class="col" title="${dia}/${mes}: ${d.qtd}"><span class="q">${d.qtd || ''}</span><div class="bar" style="height:${(d.qtd / max) * 100}%"></div><span class="d">${dia}/${mes}</span></div>`;
    })
    .join('');
  const hora = m.geradoEm.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="60">
<meta name="robots" content="noindex"><title>Painel CicloLeve</title>
<style>
:root{--bg:#faf7f8;--card:#fff;--txt:#2b2230;--sub:#7a6f7e;--acc:#c2185b;--linha:#eee4e8}
@media (prefers-color-scheme:dark){:root{--bg:#17131a;--card:#221c26;--txt:#f2eaf0;--sub:#a99fae;--acc:#f06292;--linha:#33293a}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--txt);font:15px/1.4 system-ui,-apple-system,sans-serif;padding:20px 16px}
main{max-width:900px;margin:0 auto}h1{font-size:22px;margin:0 0 4px}h2{font-size:15px;color:var(--sub);font-weight:600;margin:24px 0 10px;text-transform:uppercase;letter-spacing:.04em}
.sub{color:var(--sub);font-size:13px}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}
.card{background:var(--card);border:1px solid var(--linha);border-radius:12px;padding:14px}.t{color:var(--sub);font-size:13px}
.v{font-size:28px;font-weight:700;margin-top:2px;font-variant-numeric:tabular-nums}.n{color:var(--sub);font-size:12px;margin-top:2px}
.destaque .v{color:var(--acc)}.chart{background:var(--card);border:1px solid var(--linha);border-radius:12px;padding:14px 10px 8px;display:flex;gap:4px;height:180px;align-items:flex-end}
.col{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;min-width:0}
.bar{width:100%;max-width:28px;background:var(--acc);border-radius:4px 4px 0 0;min-height:2px}.q{font-size:11px;color:var(--sub)}.d{font-size:10px;color:var(--sub);margin-top:4px;white-space:nowrap}
</style></head><body><main>
<h1>Painel CicloLeve</h1><div class="sub">Atualizado em ${hora} · recarrega sozinho a cada minuto</div>
<h2>Uso do app</h2><div class="grid">
${cartao('Agora', m.acessos.agoraOnline, 'últimos 5 min').replace('class="card"', 'class="card destaque"')}
${cartao('Última hora', m.acessos.ultimaHora)}
${cartao('Últimas 24 h', m.acessos.ultimas24h)}
${cartao('Últimos 7 dias', m.acessos.ultimos7d)}
${cartao('Últimos 30 dias', m.acessos.ultimos30d)}
</div>
<h2>Usuárias</h2><div class="grid">
${cartao('Total de contas', m.total)}
${cartao('Novas em 24 h', m.novas.ultimas24h)}
${cartao('Novas em 7 dias', m.novas.ultimos7d)}
${cartao('Novas em 30 dias', m.novas.ultimos30d)}
${cartao('Premium ativas', m.premium, m.emTeste ? `${num(m.emTeste)} em teste grátis` : '')}
${cartao('Registros em 24 h', m.registros24h, 'sintomas e dias anotados')}
</div>
<h2>Cadastros por dia (14 dias)</h2><div class="chart">${barras}</div>
</main></body></html>`;
}

export { router as adminRoutes };
