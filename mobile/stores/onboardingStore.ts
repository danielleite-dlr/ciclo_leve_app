import { create } from 'zustand';

// Respostas do onboarding. Ficam so na memoria ate a conta ser criada (ou, na edicao, ate salvar).

export type Regularidade = 'SIM' | 'NAO' | 'NAO_SEI';
export type Situacao = 'NENHUMA' | 'ANTICONCEPCIONAL' | 'MENOPAUSA';
export type ModoCiclo = 'CICLO_REGULAR' | 'CICLO_IRREGULAR' | 'MENOPAUSA' | 'ANTICONCEPCIONAL';

export interface OnboardingState {
  nome: string;
  objetivos: string[];
  regularidade: Regularidade | null;
  situacao: Situacao | null;
  dataUltimaMenstruacao: Date | null;
  naoLembraData: boolean;
  duracaoSangramento: number;
  duracaoCiclo: number;
  naoSabeDuracao: boolean;
  anoNascimento: number | null;
  alturaCm: number | null;
  pesoKg: number | null;
  lembreteAtivo: boolean;
  lembreteHora: number;

  // true depois de carregar o que ja esta salvo no perfil (edicao)
  hidratado: boolean;

  setDado: <K extends keyof OnboardingState>(key: K, value: OnboardingState[K]) => void;
  preencher: (dados: Partial<OnboardingState>) => void;
  reset: () => void;
}

const initialState = {
  nome: '',
  objetivos: [] as string[],
  regularidade: null,
  situacao: null,
  dataUltimaMenstruacao: null,
  naoLembraData: false,
  duracaoSangramento: 5,
  duracaoCiclo: 28,
  naoSabeDuracao: false,
  anoNascimento: null,
  alturaCm: null,
  pesoKg: null,
  lembreteAtivo: false,
  lembreteHora: 20,
  hidratado: false,
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  ...initialState,
  setDado: (key, value) => set((state) => ({ ...state, [key]: value })),
  preencher: (dados) => set((state) => ({ ...state, ...dados })),
  reset: () => set(initialState),
}));

/** Converte as respostas no modo de ciclo que o backend usa. */
export function modoCicloDe(s: Pick<OnboardingState, 'regularidade' | 'situacao'>): ModoCiclo {
  if (s.situacao === 'ANTICONCEPCIONAL') return 'ANTICONCEPCIONAL';
  if (s.situacao === 'MENOPAUSA') return 'MENOPAUSA';
  return s.regularidade === 'SIM' ? 'CICLO_REGULAR' : 'CICLO_IRREGULAR';
}

/** Volta do modo de ciclo salvo para as respostas (edicao). */
export function respostasDe(modo: ModoCiclo | string, cicloRegular?: boolean): { regularidade: Regularidade; situacao: Situacao } {
  if (modo === 'ANTICONCEPCIONAL') return { situacao: 'ANTICONCEPCIONAL', regularidade: cicloRegular ? 'SIM' : 'NAO_SEI' };
  if (modo === 'MENOPAUSA') return { situacao: 'MENOPAUSA', regularidade: 'NAO' };
  return { situacao: 'NENHUMA', regularidade: modo === 'CICLO_REGULAR' ? 'SIM' : 'NAO' };
}
