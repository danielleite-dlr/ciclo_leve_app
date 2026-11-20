import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { addDays, format, startOfDay } from 'date-fns';

const chaveHoje = () => format(new Date(), 'yyyy-MM-dd');

/**
 * Chama `aoVoltar` quando o app volta do segundo plano para a tela.
 * Sem isso, quem deixa o app aberto de um dia para o outro continua vendo os dados antigos:
 * o foco da tela (useFocusEffect) nao dispara ao reabrir o app.
 */
export function useAoVoltarAoApp(aoVoltar: () => void) {
  const ref = useRef(aoVoltar);
  ref.current = aoVoltar;

  useEffect(() => {
    let anterior = AppState.currentState;
    const sub = AppState.addEventListener('change', (estado) => {
      if (anterior.match(/inactive|background/) && estado === 'active') ref.current();
      anterior = estado;
    });
    return () => sub.remove();
  }, []);
}

/**
 * Data de hoje (yyyy-MM-dd) que se atualiza sozinha: na meia-noite, com o app aberto,
 * e ao voltar do segundo plano. Use como dependencia para recalcular o que depende do dia.
 */
export function useDiaAtual() {
  const [hoje, setHoje] = useState(chaveHoje);

  useAoVoltarAoApp(() => setHoje(chaveHoje()));

  useEffect(() => {
    const ate = addDays(startOfDay(new Date()), 1).getTime() - Date.now() + 1000;
    const t = setTimeout(() => setHoje(chaveHoje()), ate);
    return () => clearTimeout(t);
  }, [hoje]);

  return hoje;
}
