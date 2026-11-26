import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAoVoltarAoApp, useDiaAtual } from '@/hooks/useDiaAtual';
import { parseDateOnly } from '@/services/cycle';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '@/services/api';
import { Colors } from '@/constants/Colors';
import { FertilityHero, getFertilityGoal } from '@/components/FertilityHero';
import { QuickActions } from '@/components/QuickActions';
import { useQuickLog } from '@/contexts/QuickLogContext';
import { useAssinatura } from '@/contexts/AssinaturaContext';
import { PremiumAviso } from '@/components/PremiumAviso';
import { ParaLer } from '@/components/conteudo/ParaLer';
import { Respiro } from '@/components/Respiro';
import { sincronizarSaude } from '@/services/saude';
import { ajustarDia, gerarDica, sintomasRelevantes, soLeves, textoRegistro, textoRelato } from '@/services/dicaDoDia';

type PerfilResponse = {
  user: { nomeCompleto?: string };
  ciclo: any | null;
  faseAtual: { 
    fase?: string;
    nomeFase?: string; 
    diaCiclo?: number;
    insight?: {
      titulo: string;
      emoji: string;
      descricao: string;
      facaHoje?: string[];
      eviteHoje?: string[];
      notaEspecialista?: string;
      dicasExtras?: string[];
    };
  } | null;
};

const PRIMARY = Colors.primary.DEFAULT;
const BG_LIGHT = Colors.background;

function capFirst(s: string) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [perfil, setPerfil] = useState<PerfilResponse | null>(null);
  // Atalhos de registro (status do dia e janelas) vem do provedor compartilhado com o botao "+"
  const quickLog = useQuickLog();
  const assinatura = useAssinatura();
  const podeAdaptar = assinatura.temModulo('DICAS_ADAPTADAS');
  const podeFertilidade = assinatura.temModulo('FERTILIDADE');

  const userFirstName = useMemo(() => {
    const full = (perfil?.user?.nomeCompleto || '').trim();
    const first = full.split(' ').filter(Boolean)[0];
    return first || 'Olá';
  }, [perfil]);

  const cycleDay = perfil?.faseAtual?.diaCiclo ?? 0;
  const rawPhase = perfil?.faseAtual?.nomeFase ?? '—';
  const phaseName = useMemo(() => {
    const v = (rawPhase || '').trim();
    if (!v || v === '—') return '—';
    return v.replace(/^Fase\s+/i, '').trim();
  }, [rawPhase]);

  // Destaque de fertilidade para quem quer engravidar ou evitar (objetivos do onboarding).
  const fertilityGoal = useMemo(() => getFertilityGoal(perfil?.ciclo), [perfil]);

  // Cor do chip segue a fase, igual ao calendario: ovulatoria = verde-agua (fertil), demais = rose.
  const phaseColors =
    perfil?.faseAtual?.fase === 'OVULATORIA'
      ? { bg: Colors.accent.light, dot: Colors.accent.DEFAULT, text: Colors.accent.dark }
      : { bg: Colors.primary.light, dot: Colors.primary.DEFAULT, text: Colors.primary.dark };

  // Muda sozinho na virada do dia e quando o app volta do segundo plano
  const hoje = useDiaAtual();

  const headerDate = useMemo(() => {
    // Ex: "Terça, 14 Out"
    const d = format(parseDateOnly(hoje), 'EEEE, d MMM', { locale: ptBR });
    return capFirst(d);
  }, [hoje]);

  const fetchPerfil = useCallback(async () => {
    try {
      const res = await api.get('/perfil', { params: { hoje: format(new Date(), 'yyyy-MM-dd') } });
      setPerfil(res.data);

      if (!res.data?.ciclo) {
        router.replace('/(onboarding)/passos');
      }
    } catch (error: any) {
      console.error(error);
      Alert.alert(
        'Erro ao carregar',
        error.response?.data?.message || error.response?.data?.error || 'Não foi possível carregar seu perfil.'
      );
    }
  }, [router]);

  // Carrega ao abrir e sempre que a home volta a aparecer (ex.: depois de editar objetivos ou
  // salvar o registro). O loading de tela cheia so aparece na primeira carga.
  const carregar = useCallback(async () => {
    await Promise.all([fetchPerfil(), quickLog.refresh()]);
    setLoading(false);
    // App Saude: traz menstruacoes registradas fora do CicloLeve (ex.: Apple Watch)
    const { importadas } = await sincronizarSaude().catch(() => ({ importadas: 0 }));
    if (importadas > 0) await Promise.all([fetchPerfil(), quickLog.refresh()]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchPerfil]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  // Reabriu o app (ex.: deixou aberto de ontem para hoje): fase, dicas e registro do dia mudam.
  useAoVoltarAoApp(carregar);

  // Virou o dia com o app aberto na tela
  const diaCarregado = useRef(hoje);
  useEffect(() => {
    if (diaCarregado.current === hoje) return;
    diaCarregado.current = hoje;
    carregar();
  }, [hoje, carregar]);

  // Algo foi registrado (pela home ou pelo "+"): fase, destaque e dicas podem ter mudado.
  useEffect(() => {
    if (quickLog.savedAt) fetchPerfil();
  }, [quickLog.savedAt, fetchPerfil]);

  const initials = useMemo(() => {
    const parts = (perfil?.user?.nomeCompleto || '').trim().split(/\s+/).filter(Boolean);
    return parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || '?';
  }, [perfil]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPerfil();
    setRefreshing(false);
  }, [fetchPerfil]);

  // Consome Insight direto da API (regra no backend)
  const insight = perfil?.faseAtual?.insight || {
    titulo: 'Energia em Alta',
    emoji: '⚡',
    descricao: 'Siga seu ritmo e observe os sinais do seu corpo hoje.',
    facaHoje: ['Exercício Cardio', 'Folhas Verdes', 'Hidratação Extra'],
    eviteHoje: ['Excesso de cafeína', 'Dormir tarde']
  };

  const headlineTitle = insight.titulo;
  const headlineDesc = insight.descricao;

  // Ícones mapeados para dicas (simples por enquanto)
  const getIconForTip = (text: string) => {
    const t = text.toLowerCase();
    const tem = (...p: string[]) => p.some((x) => t.includes(x));
    if (tem('sono', 'dormir', 'cochilo', 'banho', 'chá', 'telas', 'celular')) return 'bedtime';
    if (tem('treino', 'caminhada', 'exercício', 'yoga', 'alongamento', 'bicicleta', 'natação', 'hidroginástica', 'pilates', 'dança', 'corrida', 'escadas', 'mobilidade')) return 'directions-run';
    if (tem('água', 'hidrata')) return 'water-drop';
    if (tem('proteína', 'vegetais', 'fibra', 'ovos', 'peixe', 'frango', 'feijão', 'lentilha', 'iogurte', 'banana', 'aveia', 'castanhas', 'chocolate', 'refeições', 'sardinha', 'carne', 'sopa', 'tofu', 'arroz')) return 'restaurant';
    return 'check-circle'; // default
  };

  // O registro de hoje vem antes da fase: se ela relatou sintomas, a Home se adapta.
  const sintomasHoje = quickLog.sintomasHoje;
  const dia = ajustarDia(
    {
      faca: insight.facaHoje || [],
      evite: insight.eviteHoje || [],
      nota: insight?.notaEspecialista || 'Aproveite seu dia respeitando seu ritmo.',
    },
    podeAdaptar ? sintomasHoje : null
  );
  const relatoHoje = sintomasHoje && sintomasRelevantes(sintomasHoje).length ? textoRelato(sintomasRelevantes(sintomasHoje)) : null;
  // A dica do registro de hoje e gratis; o Premium ajusta tambem o Faca/Evite e a nota.
  // Todo registro tem retorno: forte ajusta o dia (Premium), leve e "tudo bem" so comentam.
  const hojeParaVoce = sintomasHoje
    ? {
        ...gerarDica(sintomasHoje),
        texto: relatoHoje
          ? podeAdaptar
            ? `Você relatou ${relatoHoje}. Ajustamos as dicas de hoje.`
            : `Você relatou ${relatoHoje}. Toque para ver a dica de hoje.`
          : soLeves(sintomasHoje)
            ? `Você relatou ${textoRegistro(sintomasHoje)}. Como é leve, as dicas da fase seguem valendo.`
            : 'Você registrou que está bem hoje. As dicas da fase seguem valendo.',
      }
    : null;

  const abrirDica = () => {
    if (!sintomasHoje) return;
    router.push({
      pathname: '/(app)/dica-do-dia',
      params: {
        inchaco: String(sintomasHoje.inchaco),
        fomeCompulsao: String(sintomasHoje.fomeCompulsao),
        humorIrritacao: String(sintomasHoje.humorIrritacao),
        qualidadeSono: String(sintomasHoje.qualidadeSono),
      },
    });
  };

  const doList = dia.faca.map((item) => ({
    icon: getIconForTip(item),
    title: item,
  }));

  const avoidList = dia.evite.map((item) => ({
    icon: 'block',
    text: item,
  }));

  const showCycleHelp = useCallback(() => {
    Alert.alert(
      'Dia do Ciclo',
      'Este número indica quantos dias se passaram desde o primeiro dia da sua última menstruação.\n\nEle ajuda a entender em qual fase biológica você está agora.'
    );
  }, []);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  // Header height dinâmico (insets.top + altura do conteúdo ~60)
  const headerHeight = insets.top + 64;

  return (
    <View style={styles.screen}>
      {/* Top App Bar (fixo) */}
      <View style={[styles.topBar, { paddingTop: insets.top + 12, height: headerHeight }]}>
        <View style={styles.topLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View>
            <Text style={styles.dateText}>{headerDate}</Text>
            <Text style={styles.helloText}>Olá, {userFirstName}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.notifBtn}>
          <MaterialIcons name="notifications" size={22} color="#374151" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: headerHeight + 20 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {fertilityGoal && perfil?.ciclo && !podeFertilidade ? (
          <View style={{ marginBottom: 16 }}>
            <PremiumAviso
              modulo="FERTILIDADE"
              titulo={fertilityGoal === 'ENGRAVIDAR' ? 'Seus dias férteis' : 'Dias de maior risco de gravidez'}
              texto={
                fertilityGoal === 'ENGRAVIDAR'
                  ? 'Veja quando sua chance de engravidar é maior e registre relações e testes.'
                  : 'Veja em quais dias a chance de engravidar é maior e registre relações.'
              }
            />
          </View>
        ) : null}

        {fertilityGoal && perfil?.ciclo && podeFertilidade ? (
          <FertilityHero
            goal={fertilityGoal}
            ciclo={perfil.ciclo}
            onPressCalendar={() => router.push('/(app)/calendario')}
          />
        ) : null}

        {/* Atalhos fixos: menstruacao (corrige as previsoes) e sintomas (registro diario) */}
        <QuickActions
          goal={fertilityGoal}
          menstruacaoEmAndamento={quickLog.menstruacaoEmAndamento}
          ultimaMenstruacao={quickLog.ciclo?.dataUltimaMenstruacao}
          sintomasFeitos={quickLog.sintomasFeitos}
          relacaoFeita={quickLog.relacaoFeita}
          testeFeito={quickLog.testeFeito}
          onMenstruacao={() => quickLog.start('menstruacao')}
          onSintomas={() => quickLog.start('sintomas')}
          onRelacao={() => quickLog.start('relacao')}
          onTeste={() => quickLog.start('teste')}
        />

        {/* Hoje para voce: resumo do feedback do registro de hoje */}
        {hojeParaVoce ? (
          <TouchableOpacity style={styles.todayCard} onPress={abrirDica} activeOpacity={0.85}>
            <View style={styles.todayIcon}>
              <MaterialIcons name={hojeParaVoce.icon} size={22} color={PRIMARY} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.todayLabel}>HOJE PARA VOCÊ</Text>
              <Text style={styles.todayTitle}>{hojeParaVoce.title}</Text>
              <Text style={styles.todayText}>{hojeParaVoce.texto}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={22} color="#9CA3AF" />
          </TouchableOpacity>
        ) : null}

        {/* Status Chip & Headline */}
        <View style={styles.section}>
          <View style={styles.statusRow}>
            <View style={[styles.phaseChip, { backgroundColor: phaseColors.bg }]}>
              <View style={[styles.pulseDot, { backgroundColor: phaseColors.dot }]} />
              <Text style={[styles.phaseChipText, { color: phaseColors.text }]}>Fase {phaseName}</Text>
            </View>
          </View>

          {/* Dia do Ciclo com Tooltip */}
          <TouchableOpacity onPress={showCycleHelp} activeOpacity={0.7} style={styles.cycleDayRow}>
            <Text style={styles.dayTag}>DIA {cycleDay || '—'} DO SEU CICLO MENSTRUAL</Text>
            <MaterialIcons name="help-outline" size={14} color="#9CA3AF" />
          </TouchableOpacity>

          <Text style={styles.h1}>
            {headlineTitle}
          </Text>
          <Text style={styles.h1Desc}>{headlineDesc}</Text>
        </View>

        {relatoHoje && !podeAdaptar ? (
          <View style={{ marginBottom: 12 }}>
            <PremiumAviso
              modulo="DICAS_ADAPTADAS"
              titulo="Faça e evite ajustados ao seu dia"
              texto={`As listas abaixo seguem a fase do ciclo. No Premium elas mudam conforme o que você registrou (${relatoHoje}).`}
            />
          </View>
        ) : null}

        {/* Faça hoje */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardHeaderIcon, styles.cardHeaderIconOk]}>
              <MaterialIcons name="check-circle" size={20} color={Colors.accent.DEFAULT} />
            </View>
            <Text style={styles.cardTitle}>Faça hoje</Text>
          </View>

          <View style={styles.list}>
            {doList.map((item, i) => (
              <View key={i} style={styles.doItem}>
                <MaterialIcons name={item.icon as any} size={20} color={PRIMARY} style={{ marginTop: 2 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Evite hoje */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardHeaderIcon, styles.cardHeaderIconNo]}>
              <MaterialIcons name="block" size={20} color="#EF4444" />
            </View>
            <Text style={styles.cardTitle}>Evite hoje</Text>
          </View>

          <View style={styles.list}>
            {avoidList.map((item, i) => (
              <View key={i} style={styles.avoidItem}>
                <MaterialIcons name={item.icon as any} size={20} color="#F87171" />
                <Text style={styles.avoidText}>{item.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Nota da Especialista */}
        <View style={styles.noteCard}>
          <Text style={styles.noteLabel}>NOTA DA ESPECIALISTA</Text>
          <Text style={styles.noteText}>{dia.nota}</Text>
        </View>

        {/* Dica extra de hoje (gatilhos de sintomas) */}
        {!dia.ajustado && insight?.dicasExtras && insight.dicasExtras.length > 0 && (
          <View style={styles.extraCard}>
            <Text style={styles.extraLabel}>DICA EXTRA DE HOJE</Text>
            {insight.dicasExtras.map((texto, index) => (
              <Text key={index} style={styles.extraText}>
                • {texto}
              </Text>
            ))}
          </View>
        )}

        <Respiro />

        <ParaLer />

        <View style={{ height: 32 }} />
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BG_LIGHT,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  topBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    zIndex: 50,
    paddingHorizontal: 16,
    // paddingTop/height definidos inline via style
    backgroundColor: BG_LIGHT, // sem transparência pra não vazar conteúdo por baixo
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  // Header: Aumentar avatar e fontes
  dateText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '700',
    marginBottom: 2,
  },
  helloText: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.text,
  },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    // paddingTop definido inline
  },
  section: {
    gap: 8,
    marginBottom: 14,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cycleDayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    marginBottom: 4,
  },
  phaseChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 32,
    paddingLeft: 12,
    paddingRight: 14,
    borderRadius: 999,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: PRIMARY,
  },
  phaseChipText: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.accent.dark,
  },
  dayTag: {
    fontSize: 12,
    fontWeight: '900',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  h1: {
    fontSize: 30,
    fontWeight: '900',
    color: '#111827',
  },
  h1Emoji: {
    fontSize: 26,
  },
  h1Desc: {
    color: '#4B5563',
    lineHeight: 22,
    fontSize: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  cardHeaderIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderIconOk: {
    backgroundColor: 'rgba(20,184,166,0.16)',
  },
  cardHeaderIconNo: {
    backgroundColor: 'rgba(239,68,68,0.16)',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
  },
  list: {
    gap: 12,
  },
  doItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: BG_LIGHT,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#111827',
  },
  itemSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: '#6B7280',
  },
  avoidItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.18)',
    backgroundColor: 'rgba(254,226,226,0.55)',
  },
  avoidText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },
  noteCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(227,124,150,0.22)',
    backgroundColor: 'rgba(227,124,150,0.14)',
    overflow: 'hidden',
    marginBottom: 12,
  },
  noteLabel: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.1,
    color: Colors.primary.dark,
  },
  noteText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    lineHeight: 20,
  },
  extraCard: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: Colors.surface,
    marginBottom: 12,
  },
  extraLabel: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.1,
    color: Colors.primary.dark,
    marginBottom: 6,
  },
  extraText: {
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 20,
    marginTop: 2,
  },
  todayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(227,124,150,0.35)',
    marginBottom: 16,
  },
  todayIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayLabel: { fontSize: 11, fontWeight: '900', letterSpacing: 1.1, color: Colors.primary.dark },
  todayTitle: { fontSize: 17, fontWeight: '900', color: Colors.text, marginTop: 2 },
  todayText: { fontSize: 13, color: '#4B5563', marginTop: 2, lineHeight: 18 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 17, fontWeight: '900', color: Colors.primary.dark },
});
