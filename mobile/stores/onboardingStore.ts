import { create } from 'zustand';

export interface OnboardingState {
  // Passo 1
  altura: string;
  peso: string;
  idade: string;
  cicloRegular: boolean;
  dataUltimaMenstruacao: Date | null;
  duracaoCiclo: number;
  duracaoSangramento: number;
  
  // Passo 2
  momentoAtual: 'CICLO_REGULAR' | 'CICLO_IRREGULAR' | 'MENOPAUSA' | 'ANTICONCEPCIONAL' | null;
  
  // Passo 3
  objetivos: string[];

  // Actions
  setDado: <K extends keyof OnboardingState>(key: K, value: OnboardingState[K]) => void;
  reset: () => void;
}

const initialState = {
  altura: '',
  peso: '',
  idade: '',
  cicloRegular: true,
  dataUltimaMenstruacao: null,
  duracaoCiclo: 28,
  duracaoSangramento: 5,
  momentoAtual: null,
  objetivos: [],
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  ...initialState,
  setDado: (key, value) => set((state) => ({ ...state, [key]: value })),
  reset: () => set(initialState),
}));
