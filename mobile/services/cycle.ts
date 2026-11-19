import { addDays, differenceInCalendarDays } from 'date-fns';

// Calculo de ciclo compartilhado (calendario, home). Manter alinhado com backend/src/services/ciclo.service.ts.

export type Ciclo = {
  modoCiclo: string;
  duracaoCiclo: number;
  duracaoSangramento: number;
  dataUltimaMenstruacao: string;
};

export type DayType = 'period' | 'fertile' | 'ovulation' | null;

// A API devolve "2026-11-04T00:00:00.000Z". Usar so a parte da data evita que o fuso
// (ex.: -03:00) desloque o dia para 03/11.
export function parseDateOnly(iso: string): Date {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
}

// Menopausa e anticoncepcional nao tem janela fertil previsivel.
export function hasFertileWindow(ciclo: Ciclo | null | undefined): boolean {
  return !!ciclo && !['MENOPAUSA', 'ANTICONCEPCIONAL'].includes(ciclo.modoCiclo);
}

export function getDayType(date: Date, ciclo: Ciclo, showFertile = hasFertileWindow(ciclo)): DayType {
  const start = parseDateOnly(ciclo.dataUltimaMenstruacao);
  const diff = differenceInCalendarDays(date, start);
  if (diff < 0) return null; // nao projeta para antes da ultima menstruacao informada

  const L = ciclo.duracaoCiclo;
  const day = (diff % L) + 1; // dia do ciclo, 1-based

  if (day <= ciclo.duracaoSangramento) return 'period';
  if (!showFertile) return null;

  // Ovulacao ~14 dias antes da proxima menstruacao; janela fertil = 5 dias antes ate 1 dia depois.
  const ovulation = L - 14;
  if (day === ovulation) return 'ovulation';
  if (day >= ovulation - 5 && day <= ovulation + 1) return 'fertile';
  return null;
}

const isFertile = (t: DayType) => t === 'fertile' || t === 'ovulation';

export type FertilityStatus = {
  today: DayType;
  inFertile: boolean;
  /** Janela fertil atual (se inFertile) ou a proxima. */
  fertileStart: Date | null;
  fertileEnd: Date | null;
  ovulationDate: Date | null;
  daysToFertile: number | null; // 0 se ja esta na janela
  daysLeftInFertile: number | null; // dias apos hoje ate o fim da janela (se inFertile)
  daysToOvulation: number | null; // negativo se a ovulacao ja passou nesta janela
  nextPeriod: Date | null;
  daysToPeriod: number | null;
};

export function getFertilityStatus(ciclo: Ciclo, now = new Date()): FertilityStatus {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const type = (d: Date) => getDayType(d, ciclo);
  const todayType = type(today);
  const horizon = ciclo.duracaoCiclo * 2 + 1;

  let fertileStart: Date | null = null;
  if (isFertile(todayType)) {
    let d = today;
    while (isFertile(type(addDays(d, -1)))) d = addDays(d, -1);
    fertileStart = d;
  } else {
    for (let i = 1; i <= horizon && !fertileStart; i++) {
      if (isFertile(type(addDays(today, i)))) fertileStart = addDays(today, i);
    }
  }

  let fertileEnd: Date | null = null;
  let ovulationDate: Date | null = null;
  if (fertileStart) {
    let d = fertileStart;
    while (true) {
      if (type(d) === 'ovulation') ovulationDate = d;
      if (!isFertile(type(addDays(d, 1)))) break;
      d = addDays(d, 1);
    }
    fertileEnd = d;
  }

  let nextPeriod: Date | null = null;
  for (let i = 1; i <= horizon && !nextPeriod; i++) {
    const d = addDays(today, i);
    if (type(d) === 'period' && type(addDays(d, -1)) !== 'period') nextPeriod = d;
  }

  const inFertile = isFertile(todayType);
  return {
    today: todayType,
    inFertile,
    fertileStart,
    fertileEnd,
    ovulationDate,
    daysToFertile: fertileStart ? Math.max(0, differenceInCalendarDays(fertileStart, today)) : null,
    daysLeftInFertile: inFertile && fertileEnd ? differenceInCalendarDays(fertileEnd, today) : null,
    daysToOvulation: ovulationDate ? differenceInCalendarDays(ovulationDate, today) : null,
    nextPeriod,
    daysToPeriod: nextPeriod ? differenceInCalendarDays(nextPeriod, today) : null,
  };
}

// ---------------------------------------------------------------------------
// Calendario com historico real (menstruacoes registradas em /menstruacao)

export type HistoricoMenstrual = {
  id: string;
  dataInicio: string;
  dataFim?: string | null;
  duracaoSangramento?: number | null;
};

export type CalendarDay = {
  type: DayType;
  /** true = menstruacao que ja aconteceu (registrada); false = previsao */
  registered: boolean;
};

type Periodo = { inicio: Date; fim: Date };

/**
 * Prepara o historico para o calendario: periodos de sangramento registrados e os inicios
 * de cada ciclo (para calcular o periodo fertil dos ciclos passados com o tamanho real).
 */
export function buildCalendarHistory(ciclo: Ciclo, historico: HistoricoMenstrual[]) {
  const lmp = parseDateOnly(ciclo.dataUltimaMenstruacao);
  const itens = [...historico]
    .map((h) => ({
      inicio: parseDateOnly(h.dataInicio),
      fim: h.dataFim ? parseDateOnly(h.dataFim) : null,
      sangramento: h.duracaoSangramento ?? ciclo.duracaoSangramento,
    }))
    .sort((a, b) => a.inicio.getTime() - b.inicio.getTime());

  // A data do perfil (onboarding) tambem e uma menstruacao informada pela usuaria.
  if (!itens.some((i) => i.inicio.getTime() === lmp.getTime())) {
    itens.push({ inicio: lmp, fim: null, sangramento: ciclo.duracaoSangramento });
    itens.sort((a, b) => a.inicio.getTime() - b.inicio.getTime());
  }

  const periodos: Periodo[] = itens.map((i) => ({
    inicio: i.inicio,
    fim: i.fim ?? addDays(i.inicio, Math.max(1, i.sangramento) - 1),
  }));
  const inicios = itens.map((i) => i.inicio);
  return { periodos, inicios, lmp };
}

export function getCalendarDay(
  date: Date,
  ciclo: Ciclo,
  hist: ReturnType<typeof buildCalendarHistory>,
  showFertile = hasFertileWindow(ciclo),
  now = new Date()
): CalendarDay {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const isPast = date.getTime() <= today.getTime();

  // 1) Dentro de uma menstruacao informada
  const noPeriodo = hist.periodos.some((p) => date >= p.inicio && date <= p.fim);
  if (noPeriodo) return { type: 'period', registered: isPast };

  // 2) Antes da ultima menstruacao: usa o ciclo real em que a data cai
  if (date < hist.lmp) {
    if (!showFertile) return { type: null, registered: false };
    for (let i = 0; i < hist.inicios.length - 1; i++) {
      const inicio = hist.inicios[i];
      const proximo = hist.inicios[i + 1];
      if (date >= inicio && date < proximo) {
        const L = differenceInCalendarDays(proximo, inicio);
        const day = differenceInCalendarDays(date, inicio) + 1;
        const ovulation = L - 14;
        if (day === ovulation) return { type: 'ovulation', registered: false };
        if (day >= ovulation - 5 && day <= ovulation + 1) return { type: 'fertile', registered: false };
        return { type: null, registered: false };
      }
    }
    return { type: null, registered: false };
  }

  // 3) Da ultima menstruacao em diante: projecao
  const type = getDayType(date, ciclo, showFertile);
  // No ciclo atual, a menstruacao real ja foi tratada no passo 1 (inclusive um fim registrado antes da media).
  if (type === 'period' && differenceInCalendarDays(date, hist.lmp) < ciclo.duracaoCiclo) {
    return { type: null, registered: false };
  }
  return { type, registered: false };
}
