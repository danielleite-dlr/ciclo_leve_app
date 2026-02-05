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
import { Colors } from '@/constants/Colors';

type PerfilResponse = {
  user: { nomeCompleto?: string };
  ciclo: any | null;
  faseAtual: { nomeFase?: string; diaCiclo?: number } | null;
};

function capitalizeFirst(s: string) {
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
    const d = format(new Date(), "EEEE, d MMM", { locale: ptBR });
    return capitalizeFirst(d);
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

  // MVP: como ainda não temos "mensagem do dia" do backend, deixamos um texto fixo
  // (depois podemos mapear por fase e puxar recomendações reais).
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
      { icon: 'directions-run', title: 'Exercício Cardio', subtitle: 'Corrida leve ou caminhada rápida (30min)' },
      { icon: 'eco', title: 'Folhas Verdes', subtitle: 'Espinafre ou couve no almoço' },
      { icon: 'water-drop', title: 'Hidratação Extra', subtitle: 'Beba pelo menos 2,5L de água' },
    ],
    []
  );

  const avoidList = useMemo(
    () => [
      { icon: 'coffee', text: 'Excesso de cafeína após as 14h' },
      { icon: 'bedtime-off', text: 'Dormir depois das 23h' },
    ],
    []
  );

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary.DEFAULT} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar} />
            <View style={styles.onlineDot} />
          </View>
          <View>
            <Text style={styles.topBarDate}>{headerDate}</Text>
            <Text style={styles.topBarTitle}>Olá, {userFirstName}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.topBarBtn}>
          <MaterialIcons name="notifications" size={22} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Status chip + headline */}
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
            <View style={[styles.cardIcon, styles.cardIconOk]}>
              <MaterialIcons name="check-circle" size={20} color="#10B981" />
            </View>
            <Text style={styles.cardTitle}>Faça hoje</Text>
          </View>

          <View style={styles.list}>
            {doList.map((item) => (
              <View key={item.title} style={styles.listItem}>
                <MaterialIcons name={item.icon as any} size={20} color="#13ec5b" style={styles.listItemIcon} />
                <View style={styles.listItemTextWrap}>
                  <Text style={styles.listItemTitle}>{item.title}</Text>
                  <Text style={styles.listItemSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Evite hoje */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, styles.cardIconNo]}>
              <MaterialIcons name="block" size={20} color="#EF4444" />
            </View>
            <Text style={styles.cardTitle}>Evite hoje</Text>
          </View>

          <View style={styles.list}>
            {avoidList.map((item) => (
              <View key={item.text} style={styles.avoidItem}>
                <MaterialIcons name={item.icon as any} size={20} color="#F87171" style={styles.listItemIcon} />
                <Text style={styles.avoidText}>{item.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Nota */}
        <View style={styles.noteCard}>
          <Text style={styles.noteLabel}>NOTA DA ESPECIALISTA</Text>
          <Text style={styles.noteText}>
            "Aproveite a clareza mental de hoje para resolver aquela pendência difícil. Seu cérebro está mais afiado!"
          </Text>
        </View>

        {/* Spacer pro botão flutuante */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* CTA flutuante */}
      <View style={styles.fabWrap} pointerEvents="box-none">
        <TouchableOpacity style={styles.fab} onPress={() => router.push('/(app)/registro')}>
          <MaterialIcons name="edit" size={22} color="#13ec5b" />
          <Text style={styles.fabText}>Registrar meu dia</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F6F8F6',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  topBar: {
    paddingTop: 44,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: 'rgba(246,248,246,0.92)',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
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
    borderRadius: 21,
    backgroundColor: '#D1FAE5',
  },
  onlineDot: {
    position: 'absolute',
    right: -1,
    bottom: -1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#13ec5b',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  topBarDate: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  topBarTitle: {
    marginTop: 2,
    fontSize: 18,
    fontWeight: '900',
    color: '#111813',
  },
  topBarBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  scrollContent: {
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  section: {
    gap: 10,
    marginBottom: 14,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  phaseChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 34,
    paddingLeft: 14,
    paddingRight: 16,
    borderRadius: 999,
    backgroundColor: '#D1FAE5',
    borderWidth: 1,
    borderColor: 'rgba(19,236,91,0.25)',
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#13ec5b',
    opacity: 0.95,
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
    color: '#111813',
    marginTop: 4,
  },
  h1Emoji: {
    fontSize: 26,
  },
  h1Desc: {
    color: '#4B5563',
    lineHeight: 22,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  cardIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIconOk: {
    backgroundColor: 'rgba(16,185,129,0.12)',
  },
  cardIconNo: {
    backgroundColor: 'rgba(239,68,68,0.12)',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111813',
  },
  list: {
    gap: 10,
  },
  listItem: {
    flexDirection: 'row',
    gap: 10,
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
  },
  listItemIcon: {
    marginTop: 2,
  },
  listItemTextWrap: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#111813',
  },
  listItemSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: '#6B7280',
  },
  avoidItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.18)',
    backgroundColor: '#FEE2E2',
  },
  avoidText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },
  noteCard: {
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(19,236,91,0.22)',
    backgroundColor: 'rgba(19,236,91,0.18)',
    marginBottom: 12,
  },
  noteLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: '#166534',
    letterSpacing: 1,
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
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
});
