import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { addDays, differenceInCalendarDays, endOfDay, format, startOfDay, subMonths } from 'date-fns';
import api from './api';
import { parseDateOnly } from './cycle';

// Integracao com o app Saude da Apple (HealthKit).
// - Envia: dias de menstruacao e os sintomas do registro diario.
// - Recebe: menstruacoes registradas em outros apps (ex.: app Ciclo no Apple Watch).
// So funciona na versao instalada por build. No Expo Go o modulo nativo nao existe,
// por isso ele e carregado sob demanda e todas as funcoes viram "nao suportado".

type HK = typeof import('@kingstinct/react-native-healthkit');

const PREF = 'cicloleve_saude';
// Marca as amostras gravadas pelo CicloLeve, para nao duplicar nem reimportar.
const MARCA = 'CicloLeveOrigem';

const FLUXO = 'HKCategoryTypeIdentifierMenstrualFlow' as const;
const INCHACO = 'HKCategoryTypeIdentifierBloating' as const;
const APETITE = 'HKCategoryTypeIdentifierAppetiteChanges' as const;
const HUMOR = 'HKCategoryTypeIdentifierMoodChanges' as const;
const SONO = 'HKCategoryTypeIdentifierSleepChanges' as const;
const SINTOMAS = [INCHACO, APETITE, HUMOR, SONO] as const;

// Valores do HealthKit (ver enums CategoryValue* da biblioteca)
const FLUXO_NAO_ESPECIFICADO = 1;
const FLUXO_NENHUM = 5;
const SEVERIDADE = [1, 2, 3, 4]; // notPresent, mild, moderate, severe
const APETITE_SEM_MUDANCA = 1;
const APETITE_AUMENTOU = 3;
const PRESENTE = 0;
const AUSENTE = 1;

let hk: HK | null | undefined;
function modulo(): HK | null {
  if (hk !== undefined) return hk;
  hk = null;
  if (Platform.OS !== 'ios' || Constants.executionEnvironment === ExecutionEnvironment.StoreClient) return hk;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const m: HK = require('@kingstinct/react-native-healthkit');
    if (m.isHealthDataAvailable()) hk = m;
  } catch {
    hk = null;
  }
  return hk;
}

/** Aparelho e versao do app permitem usar o app Saude. */
export const saudeSuportada = () => modulo() !== null;

export async function saudeAtiva(): Promise<boolean> {
  if (!saudeSuportada()) return false;
  return (await SecureStore.getItemAsync(PREF).catch(() => null)) === '1';
}

export async function ativarSaude(): Promise<{ ok: boolean; motivo?: string }> {
  const m = modulo();
  if (!m) {
    return {
      ok: false,
      motivo:
        Platform.OS === 'ios'
          ? 'A integração com o app Saúde funciona na versão instalada do CicloLeve, não no Expo Go.'
          : 'O app Saúde existe apenas no iPhone.',
    };
  }
  try {
    await m.requestAuthorization({ toShare: [FLUXO, ...SINTOMAS], toRead: [FLUXO] });
  } catch {
    return { ok: false, motivo: 'Não foi possível pedir acesso ao app Saúde. Tente novamente.' };
  }
  await SecureStore.setItemAsync(PREF, '1');
  sincronizarSaude({ forcar: true }).catch(() => null);
  return { ok: true };
}

/** Para de sincronizar. O que ja foi gravado continua no app Saude. */
export async function desativarSaude() {
  await SecureStore.deleteItemAsync(PREF).catch(() => null);
}

const chave = (d: Date) => format(d, 'yyyy-MM-dd');

type Periodo = { inicio: Date; fim: Date };

/** Agrupa dias de sangramento em menstruacoes (1 dia sem registro no meio nao separa). */
function agrupar(dias: Date[]): Periodo[] {
  const ordenados = [...dias].sort((a, b) => a.getTime() - b.getTime());
  const periodos: Periodo[] = [];
  for (const d of ordenados) {
    const ultimo = periodos[periodos.length - 1];
    if (ultimo && differenceInCalendarDays(d, ultimo.fim) <= 2) ultimo.fim = d;
    else periodos.push({ inicio: d, fim: d });
  }
  return periodos;
}

type HistoricoItem = { dataInicio: string; dataFim: string | null; duracaoSangramento: number | null };

let ultimaSincronizacao = 0;

/**
 * Envia as menstruacoes do CicloLeve para o app Saude e importa as registradas em outros apps.
 * Retorna quantas menstruacoes foram importadas (para a tela recarregar os dados).
 */
export async function sincronizarSaude({ forcar = false } = {}): Promise<{ importadas: number }> {
  const m = modulo();
  if (!m || !(await saudeAtiva())) return { importadas: 0 };
  // Evita repetir a cada troca de tela
  if (!forcar && Date.now() - ultimaSincronizacao < 10 * 60 * 1000) return { importadas: 0 };
  ultimaSincronizacao = Date.now();

  const hoje = startOfDay(new Date());
  const desde = startOfDay(subMonths(hoje, 13));

  const [menstruacao, perfil, amostras] = await Promise.all([
    api.get('/menstruacao', { params: { hoje: chave(hoje) } }),
    api.get('/perfil'),
    m.queryCategorySamples(FLUXO, { limit: 0, filter: { date: { startDate: desde, endDate: endOfDay(hoje) } } }),
  ]);

  const historico: HistoricoItem[] = menstruacao.data?.historico ?? [];
  const ciclo = perfil.data?.ciclo;
  const duracaoPadrao: number = ciclo?.duracaoSangramento ?? 5;

  // Periodos do CicloLeve (historico + data informada no perfil)
  const nossos: Periodo[] = historico.map((h) => {
    const inicio = parseDateOnly(h.dataInicio);
    const fim = h.dataFim ? parseDateOnly(h.dataFim) : addDays(inicio, (h.duracaoSangramento ?? duracaoPadrao) - 1);
    return { inicio, fim };
  });
  if (ciclo?.dataUltimaMenstruacao) {
    const lmp = parseDateOnly(ciclo.dataUltimaMenstruacao);
    if (!nossos.some((p) => differenceInCalendarDays(p.inicio, lmp) === 0)) {
      nossos.push({ inicio: lmp, fim: addDays(lmp, duracaoPadrao - 1) });
    }
  }

  const comSangramento = amostras.filter((a) => a.value !== FLUXO_NENHUM);
  const diasNoSaude = new Set(comSangramento.map((a) => chave(a.startDate)));

  // 1) Envia: cada dia de sangramento que ainda nao esta no app Saude (de nenhuma origem)
  for (const p of nossos) {
    if (p.fim < desde) continue;
    const fim = p.fim > hoje ? hoje : p.fim;
    for (let d = p.inicio, i = 0; d <= fim; d = addDays(d, 1), i++) {
      if (diasNoSaude.has(chave(d))) continue;
      await m.saveCategorySample(FLUXO, FLUXO_NAO_ESPECIFICADO, startOfDay(d), endOfDay(d), {
        HKMenstrualCycleStart: i === 0,
        [MARCA]: 'menstruacao',
      });
      diasNoSaude.add(chave(d));
    }
  }

  // 2) Importa: menstruacoes de outros apps que comecaram depois da ultima do CicloLeve
  const deFora = comSangramento.filter((a) => !(a.metadata as Record<string, unknown> | undefined)?.[MARCA]);
  const ultimoInicio = nossos.reduce<Date | null>((max, p) => (!max || p.inicio > max ? p.inicio : max), null);
  const novos = agrupar(deFora.map((a) => startOfDay(a.startDate))).filter(
    (p) => !ultimoInicio || differenceInCalendarDays(p.inicio, ultimoInicio) >= 10
  );

  let importadas = 0;
  for (const p of novos) {
    try {
      await api.post('/menstruacao/inicio', { data: chave(p.inicio) });
      importadas++;
      // Terminou se o ultimo dia registrado foi antes de ontem
      if (differenceInCalendarDays(hoje, p.fim) >= 2) {
        await api.post('/menstruacao/fim', { data: chave(p.fim) }).catch(() => null);
      }
    } catch {
      // Ex.: conflito com um registro proximo. Segue para o proximo.
    }
  }

  return { importadas };
}

type Valores = { inchaco: number; fomeCompulsao: number; humorIrritacao: number; qualidadeSono: number };

/** Grava os sintomas do registro diario. Regravar o mesmo dia substitui o que o CicloLeve tinha enviado. */
export async function enviarSintomasSaude(dia: Date, v: Valores) {
  const m = modulo();
  if (!m || !(await saudeAtiva())) return;

  const inicio = startOfDay(dia);
  const fim = endOfDay(dia);
  const nivel = (n: number) => Math.max(0, Math.min(3, Math.round(n || 0)));

  for (const tipo of SINTOMAS) {
    await m
      .deleteObjects(tipo, { AND: [{ date: { startDate: inicio, endDate: fim } }, { metadata: { withMetadataKey: MARCA } }] })
      .catch(() => 0);
  }

  const meta = { [MARCA]: 'registro' };
  await m.saveCategorySample(INCHACO, SEVERIDADE[nivel(v.inchaco)], inicio, fim, meta);
  await m.saveCategorySample(APETITE, nivel(v.fomeCompulsao) > 0 ? APETITE_AUMENTOU : APETITE_SEM_MUDANCA, inicio, fim, meta);
  await m.saveCategorySample(HUMOR, nivel(v.humorIrritacao) > 0 ? PRESENTE : AUSENTE, inicio, fim, meta);
  await m.saveCategorySample(SONO, nivel(v.qualidadeSono) >= 2 ? PRESENTE : AUSENTE, inicio, fim, meta);
}
