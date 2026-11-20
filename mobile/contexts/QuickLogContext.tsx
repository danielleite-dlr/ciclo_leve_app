import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { format, isToday } from 'date-fns';
import api from '@/services/api';
import { useDiaAtual } from '@/hooks/useDiaAtual';
import { Colors } from '@/constants/Colors';
import { Ciclo, parseDateOnly } from '@/services/cycle';
import type { Sintomas } from '@/services/dicaDoDia';
import { useAssinatura } from '@/contexts/AssinaturaContext';
import { FertilityGoal, getFertilityGoal } from '@/components/FertilityHero';
import { QuickActions } from '@/components/QuickActions';
import { MenstruacaoAcao, MenstruacaoSheet } from '@/components/MenstruacaoSheet';
import { ConsentimentoSheet, RelacaoSheet, TesteSheet } from '@/components/FertilidadeSheets';
import { feedbackRelacao, feedbackTeste } from '@/services/fertilidadeFeedback';

// Registro rapido compartilhado: usado pela fileira de atalhos da home e pelo botao "+" do menu.
// Guarda o status do dia, abre as janelas (menstruacao, consentimento, relacao, teste) e avisa
// as telas quando algo foi salvo (savedAt) para elas recarregarem.

export type QuickLogAction = 'menstruacao' | 'sintomas' | 'relacao' | 'teste';

type Status = {
  goal: FertilityGoal | null;
  ciclo: Ciclo | null;
  consentimento: boolean;
  menstruacaoEmAndamento: boolean;
  sintomasFeitos: boolean;
  relacaoFeita: boolean;
  testeFeito: boolean;
  /** sintomas registrados hoje (null se ainda nao registrou) */
  sintomasHoje: Sintomas | null;
};

type QuickLogContextValue = Status & {
  start: (action: QuickLogAction) => void;
  openMenu: () => void;
  refresh: () => Promise<void>;
  /** muda sempre que um registro e salvo */
  savedAt: number;
  /** avisa as telas que algo foi salvo/apagado fora das janelas (ex.: tela de historico) */
  notifySaved: () => Promise<void>;
};

const QuickLogContext = createContext<QuickLogContextValue | null>(null);

const STATUS_INICIAL: Status = {
  goal: null,
  ciclo: null,
  consentimento: false,
  menstruacaoEmAndamento: false,
  sintomasFeitos: false,
  relacaoFeita: false,
  testeFeito: false,
  sintomasHoje: null,
};

// iOS: abrir um Modal/Alert enquanto outro Modal ainda fecha pode falhar; espera a animacao.
const depoisDeFechar = (fn: () => void) => setTimeout(fn, 450);

type Sheet = 'menu' | 'menstruacao' | 'consentimento' | 'relacao' | 'teste' | null;

export function QuickLogProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>(STATUS_INICIAL);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [savedAt, setSavedAt] = useState(0);
  const aposConsentimento = useRef<'relacao' | 'teste' | null>(null);
  const assinatura = useAssinatura();

  const refresh = useCallback(async () => {
    const hoje = format(new Date(), 'yyyy-MM-dd');
    try {
      const [perfil, regs, menstruacao, fertilidade] = await Promise.all([
        api.get('/perfil', { params: { hoje } }),
        api.get('/registros', { params: { limit: 1 } }).catch(() => null),
        api.get('/menstruacao', { params: { hoje } }).catch(() => null),
        api.get('/fertilidade', { params: { de: hoje, ate: hoje } }).catch(() => null),
      ]);
      const ciclo = perfil.data?.ciclo ?? null;
      const lista: any[] = Array.isArray(regs?.data) ? regs.data : regs?.data?.data || [];
      const fert = fertilidade?.data?.data?.[0];
      const regHoje = lista[0]?.dataRegistro && isToday(parseDateOnly(lista[0].dataRegistro)) ? lista[0] : null;
      setStatus({
        goal: getFertilityGoal(ciclo),
        ciclo,
        consentimento: !!perfil.data?.user?.consentimentoSaudeSexual,
        menstruacaoEmAndamento: !!menstruacao?.data?.emAndamento,
        sintomasFeitos: !!regHoje,
        sintomasHoje: regHoje
          ? {
              inchaco: Number(regHoje.inchaco ?? 0),
              fomeCompulsao: Number(regHoje.fomeCompulsao ?? 0),
              humorIrritacao: Number(regHoje.humorIrritacao ?? 0),
              qualidadeSono: Number(regHoje.qualidadeSono ?? 0),
            }
          : null,
        relacaoFeita: !!fert?.relacao,
        testeFeito: !!(fert?.testeOvulacao || fert?.testeGravidez),
      });
    } catch {
      // sem rede/sessao: mantem o ultimo status
    }
  }, []);

  // Recarrega ao abrir o app e quando o dia muda (o "registrado hoje" de ontem nao vale mais)
  const hoje = useDiaAtual();
  useEffect(() => {
    refresh();
  }, [refresh, hoje]);

  const salvo = useCallback(async () => {
    await refresh();
    setSavedAt(Date.now());
  }, [refresh]);

  const abrir = useCallback(
    (action: QuickLogAction) => {
      if (action === 'sintomas') {
        router.push('/(app)/registro');
      } else if (action === 'menstruacao') {
        setSheet('menstruacao');
      } else if (!assinatura.temModulo('FERTILIDADE')) {
        // Relacao e testes fazem parte do Premium
        assinatura.abrirPlanos('FERTILIDADE');
      } else if (status.consentimento) {
        setSheet(action);
      } else {
        aposConsentimento.current = action;
        setSheet('consentimento');
      }
    },
    [router, status.consentimento, assinatura]
  );

  // A partir do menu do "+": fecha o menu antes de abrir a proxima janela.
  const start = useCallback(
    (action: QuickLogAction) => {
      if (sheet === 'menu') {
        setSheet(null);
        depoisDeFechar(() => abrir(action));
      } else {
        abrir(action);
      }
    },
    [sheet, abrir]
  );

  const openMenu = useCallback(() => {
    refresh();
    setSheet('menu');
  }, [refresh]);

  const value = useMemo(
    () => ({ ...status, start, openMenu, refresh, savedAt, notifySaved: salvo }),
    [status, start, openMenu, refresh, savedAt, salvo]
  );

  return (
    <QuickLogContext.Provider value={value}>
      {children}

      {/* Menu do botao "+" */}
      <Modal visible={sheet === 'menu'} transparent animationType="slide" onRequestClose={() => setSheet(null)}>
        <Pressable style={styles.backdrop} onPress={() => setSheet(null)} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>O que você quer registrar?</Text>
          <QuickActions
            goal={status.goal}
            menstruacaoEmAndamento={status.menstruacaoEmAndamento}
            ultimaMenstruacao={status.ciclo?.dataUltimaMenstruacao}
            sintomasFeitos={status.sintomasFeitos}
            relacaoFeita={status.relacaoFeita}
            testeFeito={status.testeFeito}
            onMenstruacao={() => start('menstruacao')}
            onSintomas={() => start('sintomas')}
            onRelacao={() => start('relacao')}
            onTeste={() => start('teste')}
            surface="sheet"
          />
          <TouchableOpacity onPress={() => setSheet(null)} style={styles.close}>
            <Text style={styles.closeText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <MenstruacaoSheet
        visible={sheet === 'menstruacao'}
        acao={status.menstruacaoEmAndamento ? 'fim' : ('inicio' as MenstruacaoAcao)}
        onClose={() => setSheet(null)}
        onSaved={async ({ registroId, acao }) => {
          setSheet(null);
          await salvo();
          depoisDeFechar(() =>
            Alert.alert(
              acao === 'inicio' ? 'Menstruação registrada' : 'Fim registrado',
              'Suas previsões e o calendário foram atualizados.',
              acao === 'inicio' && registroId
                ? [
                    {
                      text: 'Desfazer',
                      style: 'destructive',
                      onPress: async () => {
                        await api.delete(`/menstruacao/${registroId}`).catch(() => null);
                        await salvo();
                      },
                    },
                    { text: 'OK' },
                  ]
                : undefined
            )
          );
        }}
      />

      <ConsentimentoSheet
        visible={sheet === 'consentimento'}
        onClose={() => setSheet(null)}
        onAccepted={async () => {
          setSheet(null);
          await refresh();
          const proxima = aposConsentimento.current;
          if (proxima) depoisDeFechar(() => setSheet(proxima));
        }}
      />

      <RelacaoSheet
        visible={sheet === 'relacao'}
        onClose={() => setSheet(null)}
        onSaved={async ({ data, relacao }) => {
          setSheet(null);
          await salvo();
          const fb = feedbackRelacao(status.goal, status.ciclo, data, relacao);
          depoisDeFechar(() => Alert.alert(fb.title, fb.message));
        }}
      />

      <TesteSheet
        visible={sheet === 'teste'}
        onClose={() => setSheet(null)}
        onSaved={async ({ tipo, resultado }) => {
          setSheet(null);
          await salvo();
          const fb = feedbackTeste(tipo, resultado);
          depoisDeFechar(() => Alert.alert(fb.title, fb.message));
        }}
      />
    </QuickLogContext.Provider>
  );
}

export function useQuickLog() {
  const ctx = useContext(QuickLogContext);
  if (!ctx) throw new Error('useQuickLog precisa estar dentro de <QuickLogProvider>');
  return ctx;
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(17,24,19,0.35)' },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 36,
  },
  handle: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: Colors.border, marginBottom: 16 },
  title: { fontSize: 20, fontWeight: '900', color: Colors.text, textAlign: 'center', marginBottom: 20 },
  close: { alignItems: 'center', paddingVertical: 8 },
  closeText: { color: Colors.textLight, fontWeight: '700' },
});
