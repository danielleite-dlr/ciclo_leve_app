import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '@/services/api';

type PerfilResponse = {
  user: { nomeCompleto?: string };
  ciclo: any | null;
  faseAtual: { nomeFase?: string; diaCiclo?: number } | null;
};

const PRIMARY = '#13ec5b';
const BG_LIGHT = '#F6F8F6';

function capFirst(s: string) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [perfil, setPerfil] = useState<PerfilResponse | null>(null);

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

  const headerDate = useMemo(() => {
    // Ex: "Terça, 14 Out"
    const d = format(new Date(), 'EEEE, d MMM', { locale: ptBR });
    return capFirst(d);
  }, []);

  const fetchPerfil = useCallback(async () => {
    try {
      const res = await api.get('/perfil');
      setPerfil(res.data);

      if (!res.data?.ciclo) {
        router.replace('/(onboarding)/dados-corpo');
      }
    } catch (error: any) {
      console.error(error);
      Alert.alert(
        'Erro ao carregar',
        error.response?.data?.message || error.response?.data?.error || 'Não foi possível carregar seu perfil.'
      );
    }
  }, [router]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchPerfil();
      setLoading(false);
    })();
  }, [fetchPerfil]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPerfil();
    setRefreshing(false);
  }, [fetchPerfil]);

  // MVP: headline/descricao (depois podemos amarrar em recomendacoes reais por fase)
  const headlineTitle = useMemo(() => {
    if (phaseName === '—') return 'Complete seu onboarding';
    return 'Energia em Alta';
  }, [phaseName]);

  const headlineDesc = useMemo(() => {
    if (phaseName === '—') return 'Finalize seu onboarding para ver recomendações personalizadas.';
    return 'Seus níveis de estrogênio estão subindo. É um ótimo momento para atividades físicas e planejamento estratégico.';
  }, [phaseName]);

  const doList = useMemo(
    () => [
      {
        icon: 'directions-run' as const,
        title: 'Exercício Cardio',
        subtitle: 'Corrida leve ou caminhada rápida (30min)',
      },
      {
        icon: 'eco' as const,
        title: 'Folhas Verdes',
        subtitle: 'Espinafre ou couve no almoço',
      },
      {
        icon: 'water-drop' as const,
        title: 'Hidratação Extra',
        subtitle: 'Beba pelo menos 2,5L de água',
      },
    ],
    []
  );

  const avoidList = useMemo(
    () => [
      { icon: 'coffee' as const, text: 'Excesso de cafeína após as 14h' },
      { icon: 'bedtime-off' as const, text: 'Dormir depois das 23h' },
    ],
    []
  );

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* Top App Bar (fixo) */}
      <View style={styles.topBar}>
        <View style={styles.topLeft}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar} />
            <View style={styles.onlineDot} />
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
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Status Chip & Headline */}
        <View style={styles.section}>
          <View style={styles.statusRow}>
            <View style={styles.phaseChip}>
              <View style={styles.pulseDot} />
              <Text style={styles.phaseChipText}>Fase {phaseName}</Text>
            </View>
            <Text style={styles.dayTag}>DIA {cycleDay || '—'}</Text>
          </View>

          <Text style={styles.h1}>
            {headlineTitle} <Text style={styles.h1Emoji}>⚡</Text>
          </Text>
          <Text style={styles.h1Desc}>{headlineDesc}</Text>
        </View>

        {/* Faça hoje */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardHeaderIcon, styles.cardHeaderIconOk]}>
              <MaterialIcons name="check-circle" size={20} color="#16A34A" />
            </View>
            <Text style={styles.cardTitle}>Faça hoje</Text>
          </View>

          <View style={styles.list}>
            {doList.map((item) => (
              <View key={item.title} style={styles.doItem}>
                <MaterialIcons name={item.icon} size={20} color={PRIMARY} style={{ marginTop: 2 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
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
            {avoidList.map((item) => (
              <View key={item.text} style={styles.avoidItem}>
                <MaterialIcons name={item.icon} size={20} color="#F87171" />
                <Text style={styles.avoidText}>{item.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Nota da Especialista */}
        <View style={styles.noteCard}>
          <MaterialIcons name="lightbulb" size={120} color="#000" style={styles.noteBgIcon} />
          <Text style={styles.noteLabel}>NOTA DA ESPECIALISTA</Text>
          <Text style={styles.noteText}>
            "Aproveite a clareza mental de hoje para resolver aquela pendência difícil. Seu cérebro está mais afiado!"
          </Text>
        </View>

        {/* Spacer pro FAB */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* FAB */}
      <View style={styles.fabWrap} pointerEvents="box-none">
        <TouchableOpacity style={styles.fab} onPress={() => router.push('/(app)/registro')}>
          <MaterialIcons name="edit" size={22} color={PRIMARY} />
          <Text style={styles.fabText}>Registrar meu dia</Text>
        </TouchableOpacity>
      </View>
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
    paddingTop: 44,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: 'rgba(246,248,246,0.86)',
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
  avatarWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  avatar: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: '#D1FAE5',
  },
  onlineDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: PRIMARY,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  dateText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  helloText: {
    marginTop: 2,
    fontSize: 18,
    fontWeight: '900',
    color: '#111813',
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
    paddingTop: 96,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  section: {
    gap: 12,
    marginBottom: 14,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  phaseChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 32,
    paddingLeft: 12,
    paddingRight: 14,
    borderRadius: 999,
    backgroundColor: 'rgba(19,236,91,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(19,236,91,0.22)',
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
    color: '#14532D',
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
    backgroundColor: 'rgba(34,197,94,0.16)',
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
    borderColor: 'rgba(19,236,91,0.22)',
    backgroundColor: 'rgba(19,236,91,0.14)',
    overflow: 'hidden',
    marginBottom: 12,
  },
  noteBgIcon: {
    position: 'absolute',
    right: -18,
    top: -18,
    opacity: 0.06,
  },
  noteLabel: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.1,
    color: '#166534',
  },
  noteText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    lineHeight: 20,
  },
  fabWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    // acima do bottom tab bar
    bottom: 84,
    paddingHorizontal: 16,
    alignItems: 'center',
    zIndex: 40,
  },
  fab: {
    width: '100%',
    maxWidth: 420,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#111813',
    borderRadius: 999,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
});
