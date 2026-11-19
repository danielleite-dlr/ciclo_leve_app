import { differenceInCalendarDays, format, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '@/services/api';
import { parseDateOnly } from '@/services/cycle';

// Monta o HTML do relatorio para consulta medica (vira PDF com expo-print).

const MODOS: Record<string, string> = {
  CICLO_REGULAR: 'Ciclo regular',
  CICLO_IRREGULAR: 'Ciclo irregular',
  MENOPAUSA: 'Menopausa / perimenopausa',
  ANTICONCEPCIONAL: 'Uso de anticoncepcional',
};
const NIVEL = ['—', 'Leve', 'Moderado', 'Intenso'];
const RELACAO: Record<string, string> = { SEM_RELACAO: 'Não', PROTEGIDA: 'Com proteção', SEM_PROTECAO: 'Sem proteção' };

const esc = (s: unknown) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
const dia = (iso: string) => format(parseDateOnly(iso), 'dd/MM/yyyy');
const media = (v: number[]) => (v.length ? (v.reduce((a, b) => a + b, 0) / v.length).toFixed(1) : '—');

export async function gerarHtmlRelatorio({ meses, incluirIntimos }: { meses: number; incluirIntimos: boolean }) {
  const hoje = new Date();
  const desde = subMonths(hoje, meses);
  const deStr = format(desde, 'yyyy-MM-dd');

  const [perfil, menstruacao, registros, fertilidade] = await Promise.all([
    api.get('/perfil'),
    api.get('/menstruacao'),
    api.get('/registros', { params: { limit: 200 } }),
    incluirIntimos ? api.get('/fertilidade', { params: { de: deStr } }).catch(() => null) : Promise.resolve(null),
  ]);

  const user = perfil.data?.user ?? {};
  const ciclo = perfil.data?.ciclo ?? {};
  const historico: any[] = (menstruacao.data?.historico ?? []).filter((h: any) => parseDateOnly(h.dataInicio) >= desde);
  const regs: any[] = (Array.isArray(registros.data) ? registros.data : registros.data?.data ?? []).filter(
    (r: any) => parseDateOnly(r.dataRegistro) >= desde
  );
  const fert: any[] = fertilidade?.data?.data ?? [];

  const idade = user.dataNascimento ? Math.floor(differenceInCalendarDays(hoje, parseDateOnly(user.dataNascimento)) / 365.25) : null;
  const ciclos = historico.map((h) => h.duracaoDias).filter((v: any) => v >= 21 && v <= 45);

  const linhasMenstruacao = historico.length
    ? historico
        .map(
          (h) =>
            `<tr><td>${dia(h.dataInicio)}</td><td>${h.dataFim ? dia(h.dataFim) : '—'}</td><td>${esc(h.duracaoSangramento ?? '—')}</td><td>${esc(h.duracaoDias ?? '—')}</td></tr>`
        )
        .join('')
    : '<tr><td colspan="4" class="vazio">Nenhuma menstruação registrada no período.</td></tr>';

  const sintoma = (k: string) => regs.map((r) => Number(r[k] || 0));
  const freq = (k: string) => regs.filter((r) => Number(r[k] || 0) >= 2).length;
  const tabelaSintomas = regs.length
    ? [
        ['Inchaço', 'inchaco'],
        ['Fome / compulsão', 'fomeCompulsao'],
        ['Humor / irritação', 'humorIrritacao'],
        ['Sono (queixa)', 'qualidadeSono'],
      ]
        .map(([nome, k]) => `<tr><td>${nome}</td><td>${media(sintoma(k))}</td><td>${freq(k)}</td></tr>`)
        .join('')
    : '<tr><td colspan="3" class="vazio">Nenhum registro diário no período.</td></tr>';

  const pesos = regs.filter((r) => r.pesoKg != null).map((r) => ({ d: r.dataRegistro, p: Number(r.pesoKg) }));

  const secaoIntimos = incluirIntimos
    ? `<h2>Relações e testes</h2>
       <table><tr><th>Data</th><th>Relação</th><th>Teste de ovulação</th><th>Teste de gravidez</th></tr>
       ${
         fert.length
           ? fert
               .map(
                 (f) =>
                   `<tr><td>${dia(f.data)}</td><td>${esc(RELACAO[f.relacao] ?? '—')}</td><td>${esc(f.testeOvulacao ?? '—')}</td><td>${esc(f.testeGravidez ?? '—')}</td></tr>`
               )
               .join('')
           : '<tr><td colspan="4" class="vazio">Nenhum registro no período.</td></tr>'
       }</table>`
    : '';

  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8" />
<style>
  body { font-family: -apple-system, Helvetica, Arial, sans-serif; color: #111813; padding: 28px; font-size: 12px; }
  h1 { color: #C85A77; font-size: 22px; margin: 0; }
  .sub { color: #7f7f7f; margin: 4px 0 20px; }
  h2 { font-size: 14px; color: #C85A77; border-bottom: 2px solid #F9DCE4; padding-bottom: 4px; margin-top: 22px; }
  table { width: 100%; border-collapse: collapse; margin-top: 6px; }
  th, td { text-align: left; padding: 6px 8px; border-bottom: 1px solid #eee; }
  th { background: #f6f3f4; font-size: 11px; text-transform: uppercase; letter-spacing: .5px; color: #555; }
  .grid { display: flex; gap: 10px; flex-wrap: wrap; }
  .box { flex: 1; min-width: 120px; background: #f6f3f4; border-radius: 8px; padding: 10px; }
  .box b { display: block; font-size: 18px; color: #C85A77; }
  .vazio { color: #999; text-align: center; }
  .rodape { margin-top: 28px; color: #999; font-size: 10px; }
</style></head><body>
  <h1>Relatório do ciclo</h1>
  <p class="sub">${esc(user.nomeCompleto)} · Período: ${format(desde, 'dd/MM/yyyy')} a ${format(hoje, 'dd/MM/yyyy')} · Gerado em ${format(hoje, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>

  <h2>Dados gerais</h2>
  <div class="grid">
    <div class="box">Idade<b>${idade ?? '—'}</b></div>
    <div class="box">Altura<b>${user.alturaCm ? `${user.alturaCm} cm` : '—'}</b></div>
    <div class="box">Peso<b>${user.pesoKg ? `${Number(user.pesoKg)} kg` : '—'}</b></div>
    <div class="box">Situação<b style="font-size:13px">${esc(MODOS[ciclo.modoCiclo] ?? '—')}</b></div>
  </div>

  <h2>Ciclo</h2>
  <div class="grid">
    <div class="box">Ciclo médio<b>${ciclo.duracaoCiclo ?? '—'} dias</b></div>
    <div class="box">Sangramento médio<b>${ciclo.duracaoSangramento ?? '—'} dias</b></div>
    <div class="box">Última menstruação<b style="font-size:13px">${ciclo.dataUltimaMenstruacao ? dia(ciclo.dataUltimaMenstruacao) : '—'}</b></div>
    <div class="box">Variação entre ciclos<b>${ciclos.length >= 2 ? `${Math.max(...ciclos) - Math.min(...ciclos)} dias` : '—'}</b></div>
  </div>

  <h2>Menstruações registradas</h2>
  <table><tr><th>Início</th><th>Fim</th><th>Dias de sangramento</th><th>Tamanho do ciclo</th></tr>${linhasMenstruacao}</table>

  <h2>Sintomas (${regs.length} registros diários)</h2>
  <table><tr><th>Sintoma</th><th>Média (0 a 3)</th><th>Dias moderado/intenso</th></tr>${tabelaSintomas}</table>

  ${pesos.length ? `<h2>Peso</h2><p>Primeiro registro: ${pesos[pesos.length - 1].p} kg (${dia(pesos[pesos.length - 1].d)}) · Último: ${pesos[0].p} kg (${dia(pesos[0].d)})</p>` : ''}

  ${secaoIntimos}

  <p class="rodape">Relatório gerado pelo app CicloLeve com base nos registros da usuária. As previsões são estimativas e não substituem avaliação médica.</p>
</body></html>`;
}
