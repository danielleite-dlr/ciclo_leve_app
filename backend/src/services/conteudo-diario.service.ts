import {
  CONTEUDO_POR_FASE,
  Fase,
  NOTAS_FOLICULAR,
  NOTAS_LUTEA,
  NOTAS_MENSTRUAL,
  NOTAS_OVULATORIA,
} from '../constants/conteudo-diario';

// Conteudo da Home do dia: titulo, frase, 3 "faca hoje" (comida, movimento, descanso), 2 "evite" e a nota.
//
// Variacao: cada lista e percorrida um item por dia, a partir de um ponto que depende da usuaria.
// Assim dois dias seguidos nunca repetem o mesmo item, o dia todo mostra a mesma coisa
// (abrir o app de novo nao muda nada) e cada usuaria ve uma combinacao diferente.
//
// Fases e limites iguais aos de CicloService.calcularFaseAtual:
// ovulacao no dia (ciclo - 14), janela fertil de 5 dias antes ate 1 dia depois.

export type ConteudoDoDia = {
  titulo: string;
  emoji: string;
  descricao: string;
  faca: string[];
  evite: string[];
  nota: string;
};

type Entrada = {
  fase: string;
  diaCiclo: number;
  duracaoCiclo: number;
  duracaoSangramento: number;
  /** dia de hoje no fuso da usuaria, AAAA-MM-DD */
  data: string;
  userId: string;
};

function diaAbsoluto(data: string) {
  const [a, m, d] = data.split('-').map(Number);
  return Math.floor(Date.UTC(a, m - 1, d) / 86400000);
}

/** Numero estavel a partir do id (mesma usuaria, mesmo numero). */
function semente(texto: string) {
  let h = 0;
  for (const c of texto) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

/** Posicao dentro da fase e o "momento" dela (para titulo e frase) e a nota da especialista. */
function posicao(e: Entrada): { momento: string; nota: string } {
  const { diaCiclo: d, duracaoCiclo: C, duracaoSangramento: S } = e;
  switch (e.fase as Fase) {
    case 'MENSTRUAL':
      return {
        momento: d <= 2 ? 'inicio' : 'fim',
        nota: NOTAS_MENSTRUAL[Math.min(d, NOTAS_MENSTRUAL.length) - 1],
      };
    case 'FOLICULAR': {
      const i = d - S; // 1 = primeiro dia da fase
      const tamanho = C - 20 - S;
      const ultima = NOTAS_FOLICULAR.length - 1;
      let idx: number;
      if (i <= 1) idx = 0;
      else if (i >= tamanho) idx = ultima;
      else idx = 1 + ((i - 2) % (ultima - 1));
      return { momento: 'unico', nota: NOTAS_FOLICULAR[idx] };
    }
    case 'OVULATORIA': {
      const rel = Math.max(-5, Math.min(1, d - (C - 14))); // 0 = dia provavel da ovulacao
      return {
        momento: rel <= -2 ? 'inicio' : rel <= 0 ? 'pico' : 'fim',
        nota: NOTAS_OVULATORIA[rel + 5],
      };
    }
    default: {
      const faltam = Math.max(1, Math.min(NOTAS_LUTEA.length, C - d + 1)); // dias ate a menstruacao
      return {
        momento: faltam >= 10 ? 'inicio' : faltam >= 5 ? 'meio' : 'fim',
        nota: NOTAS_LUTEA[faltam - 1],
      };
    }
  }
}

export function conteudoDoDia(e: Entrada): ConteudoDoDia | null {
  const fase = CONTEUDO_POR_FASE[e.fase as Fase];
  if (!fase) return null;

  const base = diaAbsoluto(e.data) + (semente(e.userId) % 997);
  // Um item por dia; o "sal" desencontra as listas entre si
  const um = <T>(lista: T[], sal: number) => lista[(base + sal) % lista.length];
  // Dois itens diferentes por dia, andando de 2 em 2
  const dois = <T>(lista: T[], sal: number) => {
    const i = (base * 2 + sal) % lista.length;
    return [lista[i], lista[(i + 1) % lista.length]];
  };

  const { momento, nota } = posicao(e);
  const m = fase.momentos[momento] ?? Object.values(fase.momentos)[0];

  return {
    titulo: um(m.titulos, 0),
    emoji: fase.emoji,
    descricao: um(m.descricoes, 1),
    faca: [um(fase.comida, 2), um(fase.movimento, 3), um(fase.descanso, 4)],
    evite: dois(fase.evite, 5),
    nota,
  };
}
