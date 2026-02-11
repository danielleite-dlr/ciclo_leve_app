import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import api from '@/services/api';
import { format, isToday, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const PRIMARY = '#13ec5b';
const BG = '#F6F8F6';

type Registro = {
  id: string;
  data: string;
  sintomas: any;
};

export default function InsightsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRegistro, setLastRegistro] = useState<Registro | null>(null);

  const fetchInsights = useCallback(async () => {
    try {
      const res = await api.get('/registros');
      // Assumindo que vem array ordenado ou lista
      // Se vier paginado ou desordenado, ideal seria ordenar.
      // O endpoint default costuma retornar lista. Vamos pegar o[0] se for desc ou o ultimo.
      // Assumindo lista simples
      const lista = Array.isArray(res.data) ? res.data : [];
      // Ordenar por data desc
      lista.sort((a: any, b: any) => new Date(b.data).getTime() - new Date(a.data).getTime());
      
      setLastRegistro(lista[0] || null);
    } catch (error) {
      console.log('Erro ao buscar insights:', error);
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchInsights();
      setLoading(false);
    })();
  }, [fetchInsights]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchInsights();
    setRefreshing(false);
  }, [fetchInsights]);

  const tip = useMemo(() => {
    if (!lastRegistro) return null;

    const s = lastRegistro.sintomas || {};
    const inchaco = Number(s.inchaco || 0);
    const fome = Number(s.fomeCompulsao || 0);
    const humor = Number(s.humorIrritacao || 0);
    const sono = Number(s.qualidadeSono || 0);

    const scores = [
      { key: 'inchaco', label: 'inchaço', value: inchaco },
      { key: 'fome', label: 'fome/compulsão', value: fome },
      { key: 'humor', label: 'irritabilidade', value: humor },
      { key: 'sono', label: 'sono', value: sono },
    ].sort((a, b) => b.value - a.value);

    const top = scores[0];
    const second = scores[1];
    
    // Se tudo for 0
    if (top.value === 0) {
      return {
        badge: 'Tudo equilibrado',
        title: 'Dia Leve',
        basedText: 'Você não relatou sintomas intensos hoje.',
        cardIcon: 'spa' as const,
        cardTitle: 'Continue assim!',
        cardText: 'Manter a constância nos registros ajuda a entender melhor seu corpo.',
        extra: 'Que tal aproveitar para meditar um pouco?'
      };
    }

    const basedOn = [top, second].filter((s) => s.value > 0).map((s) => s.label);
    const basedText = `Baseado no ${basedOn.map((x) => `"${x}"`).join(' e ')} do seu último registro.`;

    if (top.key === 'inchaco') {
      return {
        badge: 'Seu Feedback',
        title: 'Priorize o conforto',
        basedText,
        cardIcon: 'water-drop' as const,
        cardTitle: 'Hidratação é chave',
        cardText:
          'Para reduzir o inchaço, beba mais água e evite sódio. Chá de hibisco pode ajudar.',
        extra: 'Reserve 10 min para pernas para cima antes de dormir.',
      };
    }
    if (top.key === 'sono') {
      return {
        badge: 'Seu Feedback',
        title: 'Sono Restaurador',
        basedText,
        cardIcon: 'bedtime' as const,
        cardTitle: 'Higiene do sono',
        cardText:
          'Priorize luz baixa e evite telas 1h antes de deitar. Um banho morno ajuda a relaxar.',
        extra: 'Evite cafeína após o almoço amanhã.',
      };
    }
    if (top.key === 'humor') {
      return {
        badge: 'Seu Feedback',
        title: 'Pegue leve',
        basedText,
        cardIcon: 'self-improvement' as const,
        cardTitle: 'Pausas estratégicas',
        cardText:
          'Faça pausas de 5 min para respiração (4s in, 6s out). Ajuda a baixar o cortisol.',
        extra: 'Evite decisões complexas hoje se possível.',
      };
    }
    // fome
    return {
      badge: 'Seu Feedback',
      title: 'Nutrição Inteligente',
      basedText,
      cardIcon: 'restaurant' as const,
      cardTitle: 'Fibras + Proteína',
      cardText:
        'Combine fibras e proteínas para aumentar a saciedade e evitar picos de glicose.',
      extra: 'Tenha lanches saudáveis à mão para evitar impulsos.',
    };
  }, [lastRegistro]);

  const registroDate = useMemo(() => {
    if (!lastRegistro) return '';
    try {
      const d = parseISO(lastRegistro.data);
      if (isToday(d)) return 'Hoje';
      return format(d, "d 'de' MMMM", { locale: ptBR });
    } catch {
      return '';
    }
  }, [lastRegistro]);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
       {/* Top Bar */}
       <View style={styles.topBar}>
        <Text style={styles.topTitle}>Insights</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {!lastRegistro ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconBg}>
              <MaterialIcons name="insights" size={48} color={PRIMARY} />
            </View>
            <Text style={styles.emptyTitle}>Sem dados ainda</Text>
            <Text style={styles.emptyText}>
              Faça seu primeiro registro diário para receber dicas personalizadas e entender seus padrões.
            </Text>
            <TouchableOpacity style={styles.btnPrimary} onPress={() => router.push('/(app)/registro')}>
              <Text style={styles.btnPrimaryText}>Registrar agora</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.dateBadge}>
              <Text style={styles.dateBadgeText}>REGISTRO DE: {registroDate.toUpperCase()}</Text>
            </View>

            {tip && (
              <>
                 <View style={styles.header}>
                    <Text style={styles.badge}>{tip.badge}</Text>
                    <Text style={styles.h1}>{tip.title}</Text>
                    <Text style={styles.sub}>{tip.basedText}</Text>
                 </View>

                 <View style={styles.card}>
                    <View style={styles.cardHeader}>
                      <View style={styles.cardIcon}>
                        <MaterialIcons name={tip.cardIcon} size={20} color={PRIMARY} />
                      </View>
                      <Text style={styles.cardTitle}>{tip.cardTitle}</Text>
                    </View>
                    <Text style={styles.cardText}>{tip.cardText}</Text>
                 </View>

                 <View style={styles.extraRow}>
                    <MaterialIcons name="psychology" size={20} color={PRIMARY} />
                    <Text style={styles.extraText}>
                      <Text style={styles.extraBold}>Dica Extra{'\n'}</Text>
                      {tip.extra}
                    </Text>
                 </View>
              </>
            )}
            
            <View style={{ height: 40 }} />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BG,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBar: {
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    alignItems: 'center',
  },
  topTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111813',
  },
  content: {
    padding: 24,
    minHeight: '100%',
  },
  emptyState: {
    marginTop: 60,
    alignItems: 'center',
  },
  emptyIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(19,236,91,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111813',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  btnPrimary: {
    backgroundColor: '#111813',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 999,
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 16,
  },
  dateBadge: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
    marginBottom: 24,
  },
  dateBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#374151',
    letterSpacing: 0.5,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  badge: {
    fontSize: 12,
    fontWeight: '800',
    color: PRIMARY,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  h1: {
    fontSize: 28,
    fontWeight: '900',
    color: '#111813',
    textAlign: 'center',
    marginBottom: 8,
  },
  sub: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(19,236,91,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111813',
  },
  cardText: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
  },
  extraRow: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(19,236,91,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(19,236,91,0.12)',
  },
  extraText: {
    flex: 1,
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 19,
  },
  extraBold: {
    fontWeight: '800',
    color: '#166534',
  },
});
