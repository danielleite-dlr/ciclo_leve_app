// Regras do feedback diario (Dica do Dia) e do ajuste da Home pelo registro de hoje.
// A fase e so tendencia; o que a usuaria registrou hoje vem primeiro.

export type Sintomas = {
  inchaco: number;
  fomeCompulsao: number;
  humorIrritacao: number;
  qualidadeSono: number; // 0 = otimo ... 3 = pessimo (queixa)
};

type Chave = 'inchaco' | 'fome' | 'humor' | 'sono';

const NIVEL_RELEVANTE = 2; // moderado ou pior: a partir daqui o Faca/Evite da Home muda

const RELATO: Record<Chave, string> = {
  sono: 'sono ruim',
  humor: 'irritação',
  inchaco: 'inchaço',
  fome: 'mais fome',
};

const FACA: Record<Chave, string> = {
  sono: 'Deitar 30 min mais cedo, sem telas',
  humor: 'Pausas de 3 min de respiração',
  inchaco: 'Mais água ao longo do dia',
  fome: 'Proteína + fibra em cada refeição',
};

const EVITE: Record<Chave, string> = {
  sono: 'Cafeína depois das 14h',
  humor: 'Decisões importantes no impulso',
  inchaco: 'Excesso de sal e ultraprocessados',
  fome: 'Ficar muitas horas sem comer',
};

const TREINO_INTENSO = /treino de força|hiit|treino forte|treino pesado/i;

function ordenar(s: Sintomas) {
  return [
    { key: 'inchaco' as Chave, label: 'inchaço', value: s.inchaco },
    { key: 'fome' as Chave, label: 'fome/compulsão', value: s.fomeCompulsao },
    { key: 'humor' as Chave, label: 'irritabilidade', value: s.humorIrritacao },
    { key: 'sono' as Chave, label: 'sono', value: s.qualidadeSono },
  ].sort((a, b) => b.value - a.value);
}

/** Sintomas moderados/intensos de hoje, do mais forte para o mais fraco. */
export function sintomasRelevantes(s: Sintomas): Chave[] {
  return ordenar(s)
    .filter((x) => x.value >= NIVEL_RELEVANTE)
    .map((x) => x.key);
}

// Nivel 1 ("um pouco"): aparece no texto, mas nao muda o plano do dia
const RELATO_LEVE: Record<Chave, string> = {
  sono: 'sono razoável',
  humor: 'um pouco de irritação',
  inchaco: 'pouco inchaço',
  fome: 'um pouco mais de fome',
};

function juntar(partes: string[]) {
  if (partes.length <= 1) return partes.join('');
  return `${partes.slice(0, -1).join(', ')} e ${partes[partes.length - 1]}`;
}

/** "sono ruim e irritação" */
export function textoRelato(chaves: Chave[]) {
  return juntar(chaves.map((k) => RELATO[k]));
}

/** Tudo o que ela marcou acima de zero, com o peso certo: "irritação e pouco inchaço". */
export function textoRegistro(s: Sintomas) {
  return juntar(
    ordenar(s)
      .filter((x) => x.value > 0)
      .map((x) => (x.value >= NIVEL_RELEVANTE ? RELATO[x.key] : RELATO_LEVE[x.key]))
  );
}

/** Registrou algo, mas tudo em nivel leve. */
export const soLeves = (s: Sintomas) => sintomasRelevantes(s).length === 0 && ordenar(s)[0].value > 0;

export function gerarDica(s: Sintomas) {
  const top = ordenar(s)[0];

  // Nada a relatar: sem dica de sintoma, so reforco da fase
  if (top.value === 0) {
    return {
      title: 'Dia tranquilo',
      basedText: 'Você registrou que está bem hoje.',
      icon: 'check-circle' as const,
      cardTitle: 'Siga o ritmo da fase',
      cardText:
        'Sem inchaço, fome fora do normal, irritação ou noite ruim. As dicas da sua fase na tela inicial continuam valendo para hoje.',
      extra: 'Registrar também os dias bons ajuda a mostrar o seu padrão ao longo do ciclo.',
    };
  }

  const basedText = `Baseado no que você registrou hoje: ${textoRegistro(s)}.`;

  if (top.key === 'inchaco') {
    return {
      title: 'Priorize o seu conforto',
      basedText,
      icon: 'water-drop' as const,
      cardTitle: 'Hidratação é a chave',
      cardText:
        'Para reduzir o inchaço, tente beber mais água ao longo do dia e evite alimentos ricos em sódio. Um chá de hibisco ou cavalinha também pode ajudar na retenção de líquidos.',
      extra: 'Se sentir irritabilidade, reserve 10 minutos para respiração profunda antes de dormir.',
    };
  }
  if (top.key === 'sono') {
    return {
      title: 'Sono em primeiro lugar',
      basedText,
      icon: 'bedtime' as const,
      cardTitle: 'Rotina de desaceleração',
      cardText:
        'Hoje, priorize uma rotina leve à noite: luz baixa, menos telas e um ritual curto (banho morno, leitura, respiração). Isso ajuda a melhorar a qualidade do sono.',
      extra: 'Tente deitar 30 minutos mais cedo e evite cafeína após as 14h.',
    };
  }
  if (top.key === 'humor') {
    return {
      title: 'Seja gentil com você',
      basedText,
      icon: 'self-improvement' as const,
      cardTitle: 'Pausas ajudam',
      cardText:
        'Quando perceber irritação, faça uma pausa curta: 3 minutos de respiração (4s inspira, 6s expira) e um copo de água. Pequenas pausas reduzem reatividade.',
      extra: 'Se possível, planeje tarefas mais simples e deixe decisões complexas para amanhã.',
    };
  }
  return {
    title: 'Foque em saciedade',
    basedText,
    icon: 'restaurant' as const,
    cardTitle: 'Proteína + fibras',
    cardText:
      'Para reduzir picos de fome, combine proteína e fibras nas refeições (ex: iogurte + frutas + aveia, ou almoço com feijão e salada). Isso melhora saciedade ao longo do dia.',
    extra: 'Leve um lanche planejado para evitar beliscos por impulso.',
  };
}

function semRepetir(lista: string[], max: number) {
  const vistos = new Set<string>();
  return lista
    .filter((t) => {
      const k = t.toLowerCase();
      if (vistos.has(k)) return false;
      vistos.add(k);
      return true;
    })
    .slice(0, max);
}

/**
 * Ajusta "Faca hoje", "Evite hoje" e a nota da especialista da fase pelo registro de hoje.
 * Sem sintomas relevantes, devolve tudo como veio.
 */
export function ajustarDia(
  base: { faca: string[]; evite: string[]; nota: string },
  s: Sintomas | null
): { faca: string[]; evite: string[]; nota: string; ajustado: boolean } {
  const chaves = s ? sintomasRelevantes(s) : [];
  if (!s || chaves.length === 0) return { ...base, ajustado: false };

  const pedeDescanso = s.qualidadeSono >= NIVEL_RELEVANTE || s.humorIrritacao >= NIVEL_RELEVANTE;
  const facaFase = base.faca.map((t) =>
    pedeDescanso && TREINO_INTENSO.test(t) ? 'Movimento leve (caminhada ou alongamento)' : t
  );

  return {
    faca: semRepetir([...chaves.map((k) => FACA[k]), ...facaFase], 3),
    evite: semRepetir([...chaves.map((k) => EVITE[k]), ...base.evite], 3),
    nota: `Hoje você relatou ${textoRelato(chaves)}. As dicas da fase são uma tendência, então hoje elas foram ajustadas ao que você sente.`,
    ajustado: true,
  };
}
