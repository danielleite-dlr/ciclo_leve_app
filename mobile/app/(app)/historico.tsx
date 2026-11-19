import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { differenceInCalendarDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '@/services/api';
import { Colors } from '@/constants/Colors';
import { parseDateOnly } from '@/services/cycle';
import { ScreenHeader } from '@/components/ScreenHeader';
import { MenstruacaoSheet } from '@/components/MenstruacaoSheet';
import { useQuickLog } from '@/contexts/QuickLogContext';
import { useAssinatura } from '@/contexts/AssinaturaContext';
import { PremiumAviso } from '@/components/PremiumAviso';

const LIMITE_GRATUITO = 3;

type Item = {
  id: string;
  dataInicio: string;
  dataFim?: string | null;
  duracaoDias?: number | null; // tamanho do ciclo (ate o proximo inicio)
  duracaoSangramento?: number | null;
};

const fmt = (d: Date) => format(d, "d 'de' MMM", { locale: ptBR });

// Historico de menstruacoes + estatisticas do ciclo (medias calculadas pelo backend).
export default function Historico() {
  const quickLog = useQuickLog();
  const [itens, setItens] = useState<Item[]>([]);
  const completo = useAssinatura().temModulo('HISTORICO_COMPLETO');
  const [ciclo, setCiclo] = useState<{ duracaoCiclo: number; duracaoSangramento: number } | null>(null);
  const [emAndamento, setEmAndamento] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adicionando, setAdicionando] = useState(false);

  const carregar = useCallback(async () => {
    try {
      const [m, p] = await Promise.all([
        api.get('/menstruacao', { params: { hoje: format(new Date(), 'yyyy-MM-dd') } }),
        api.get('/perfil'),
      ]);
      setItens(m.data?.historico ?? []);
      setEmAndamento(!!m.data?.emAndamento);
      setCiclo(p.data?.ciclo ?? null);
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar seu histórico.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  // Regularidade: diferenca entre o maior e o menor ciclo registrado
  const variacao = useMemo(() => {
    const ciclos = itens.map((i) => i.duracaoDias).filter((v): v is number => !!v && v >= 21 && v <= 45);
    if (ciclos.length < 2) return null;
    return Math.max(...ciclos) - Math.min(...ciclos);
  }, [itens]);

  const apagar = (item: Item) => {
    Alert.alert('Apagar registro?', `Menstruação de ${fmt(parseDateOnly(item.dataInicio))}. As previsões serão recalculadas.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Apagar',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/menstruacao/${item.id}`);
            await carregar();
            await quickLog.notifySaved();
          } catch (error: any) {
            Alert.alert('Erro', error?.response?.data?.error || 'Não foi possível apagar.');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Histórico do ciclo" />
      {loading ? (
        <ActivityIndicator color={Colors.primary.DEFAULT} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {/* Estatisticas */}
          <View style={styles.statsRow}>
            <Stat value={ciclo ? `${ciclo.duracaoCiclo}` : '—'} unit="dias" label="Ciclo médio" />
            <Stat value={ciclo ? `${ciclo.duracaoSangramento}` : '—'} unit="dias" label="Sangramento" />
            <Stat value={`${itens.length}`} unit={itens.length === 1 ? 'registro' : 'registros'} label="Menstruações" />
          </View>
          {!completo ? (
            <View style={{ marginTop: 12 }}>
              <PremiumAviso
                modulo="HISTORICO_COMPLETO"
                titulo="Regularidade do ciclo"
                texto="Veja quanto seu ciclo varia e todo o histórico de menstruações."
              />
            </View>
          ) : (
          <Text style={styles.statsHint}>
            {variacao == null
              ? 'Registre suas próximas menstruações para calcularmos a regularidade do seu ciclo.'
              : variacao <= 7
                ? `Seu ciclo é regular: varia ${variacao} ${variacao === 1 ? 'dia' : 'dias'} entre o menor e o maior.`
                : `Seu ciclo varia ${variacao} dias entre o menor e o maior. Previsões podem ser menos precisas.`}
          </Text>
          )}

          {/* Lista */}
          <View style={styles.listHeader}>
            <Text style={styles.sectionTitle}>Menstruações registradas</Text>
          </View>
          <View style={styles.card}>
            {itens.length === 0 ? (
              <Text style={styles.empty}>Nenhuma menstruação registrada ainda.</Text>
            ) : (
              (completo ? itens : itens.slice(0, LIMITE_GRATUITO)).map((item, idx, lista) => {
                const inicio = parseDateOnly(item.dataInicio);
                const aberto = idx === 0 && emAndamento;
                const fim = item.dataFim ? parseDateOnly(item.dataFim) : null;
                const dias = fim ? differenceInCalendarDays(fim, inicio) + 1 : item.duracaoSangramento;
                return (
                  <View key={item.id} style={[styles.row, idx === lista.length - 1 && styles.rowLast]}>
                    <View style={styles.dot} />
                    <View style={styles.flex1}>
                      <Text style={styles.rowTitle}>
                        {fim ? `${fmt(inicio)} a ${fmt(fim)}` : fmt(inicio)}
                        {aberto ? '  ·  em andamento' : ''}
                      </Text>
                      <Text style={styles.rowSub}>
                        {[dias ? `${dias} dias de sangramento` : null, item.duracaoDias ? `ciclo de ${item.duracaoDias} dias` : null]
                          .filter(Boolean)
                          .join('  ·  ') || 'Ciclo atual'}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => apagar(item)} style={styles.trash} accessibilityLabel="Apagar registro">
                      <MaterialIcons name="delete-outline" size={22} color={Colors.textLight} />
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </View>

          {!completo && itens.length > LIMITE_GRATUITO ? (
            <Text style={styles.statsHint}>
              Mostrando as {LIMITE_GRATUITO} mais recentes de {itens.length}. O histórico completo faz parte do Premium.
            </Text>
          ) : null}

          <TouchableOpacity style={styles.addBtn} onPress={() => setAdicionando(true)} activeOpacity={0.85}>
            <MaterialIcons name="add" size={20} color={Colors.primary.dark} />
            <Text style={styles.addText}>Registrar menstruação anterior</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      <MenstruacaoSheet
        visible={adicionando}
        acao="inicio"
        onClose={() => setAdicionando(false)}
        onSaved={async () => {
          setAdicionando(false);
          await carregar();
          await quickLog.notifySaved();
        }}
      />
    </View>
  );
}

function Stat({ value, unit, label }: { value: string; unit: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statUnit}>{unit}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  flex1: { flex: 1 },
  content: { padding: 16, paddingBottom: 120 },
  statsRow: { flexDirection: 'row', gap: 10 },
  stat: { flex: 1, backgroundColor: Colors.surface, borderRadius: 20, paddingVertical: 16, alignItems: 'center' },
  statValue: { fontSize: 28, fontWeight: '900', color: Colors.primary.DEFAULT },
  statUnit: { fontSize: 12, fontWeight: '700', color: Colors.primary.dark, marginTop: -2 },
  statLabel: { fontSize: 12, color: Colors.textLight, marginTop: 6, fontWeight: '600' },
  statsHint: { fontSize: 13, color: Colors.textLight, lineHeight: 19, marginTop: 12, paddingHorizontal: 4 },
  listHeader: { marginTop: 24, marginBottom: 8, marginLeft: 8 },
  sectionTitle: { fontSize: 12, fontWeight: '800', color: Colors.textLight, textTransform: 'uppercase', letterSpacing: 1 },
  card: { backgroundColor: Colors.surface, borderRadius: 20, overflow: 'hidden' },
  empty: { padding: 20, color: Colors.textLight, textAlign: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingLeft: 16,
    paddingRight: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background,
  },
  rowLast: { borderBottomWidth: 0 },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.primary.DEFAULT },
  rowTitle: { fontSize: 15, fontWeight: '800', color: Colors.text },
  rowSub: { fontSize: 13, color: Colors.textLight, marginTop: 2 },
  trash: { padding: 8 },
  addBtn: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: Colors.primary.light,
  },
  addText: { color: Colors.primary.dark, fontWeight: '800', fontSize: 15 },
});
