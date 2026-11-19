import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import api from '@/services/api';
import { Colors } from '@/constants/Colors';
import { Fase, ListaArtigos, NOME_FASE } from '@/services/conteudo';
import { CartaoArtigo } from '@/components/conteudo/CartaoArtigo';

// Biblioteca de artigos. Os da fase atual vem primeiro; os chips filtram por fase.

const FASES: Fase[] = ['MENSTRUAL', 'FOLICULAR', 'OVULATORIA', 'LUTEA'];

export default function ConteudoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [lista, setLista] = useState<ListaArtigos | null>(null);
  const [erro, setErro] = useState(false);
  const [filtro, setFiltro] = useState<Fase | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const carregar = useCallback(async () => {
    try {
      const res = await api.get<ListaArtigos>('/conteudo');
      setLista(res.data);
      setErro(false);
    } catch {
      setErro(true);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  const artigos = useMemo(
    () => (lista?.data ?? []).filter((a) => !filtro || a.fasesAplicaveis.includes(filtro)),
    [lista, filtro]
  );
  const daFase = filtro ? [] : artigos.filter((a) => a.daFaseAtual);
  const outros = filtro ? artigos : artigos.filter((a) => !a.daFaseAtual);

  return (
    <View style={styles.tela}>
      <View style={[styles.topo, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.voltar} accessibilityLabel="Voltar">
          <MaterialIcons name="arrow-back-ios-new" size={20} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.titulo}>Para ler</Text>
        <View style={styles.voltar} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} style={styles.chipsWrap}>
        {[null, ...FASES].map((f) => {
          const ativo = filtro === f;
          return (
            <TouchableOpacity
              key={f ?? 'todas'}
              onPress={() => setFiltro(f)}
              style={[styles.chip, ativo && styles.chipAtivo]}
              accessibilityState={{ selected: ativo }}
            >
              <Text style={[styles.chipTexto, ativo && styles.chipTextoAtivo]}>{f ? NOME_FASE[f] : 'Todos'}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {!lista && !erro ? (
        <View style={styles.centro}>
          <ActivityIndicator color={Colors.primary.DEFAULT} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.conteudo, { paddingBottom: insets.bottom + 100 }]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={async () => {
                setRefreshing(true);
                await carregar();
                setRefreshing(false);
              }}
            />
          }
        >
          {erro ? <Text style={styles.vazio}>Não foi possível carregar os artigos. Puxe para tentar de novo.</Text> : null}

          {daFase.length > 0 && lista?.faseAtual ? (
            <>
              <Text style={styles.secao}>Para a sua fase: {NOME_FASE[lista.faseAtual]}</Text>
              {daFase.map((a) => (
                <CartaoArtigo key={a.id} artigo={a} />
              ))}
              {outros.length > 0 ? <Text style={styles.secao}>Outros artigos</Text> : null}
            </>
          ) : null}

          {outros.map((a) => (
            <CartaoArtigo key={a.id} artigo={a} />
          ))}

          {lista && artigos.length === 0 ? <Text style={styles.vazio}>Nenhum artigo para esta fase ainda.</Text> : null}

          <Text style={styles.aviso}>
            Os artigos trazem informação geral e não substituem a consulta com um profissional de saúde.
          </Text>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: Colors.background },
  topo: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingBottom: 8 },
  voltar: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  titulo: { flex: 1, textAlign: 'center', fontSize: 20, fontWeight: '900', color: Colors.text },
  chipsWrap: { flexGrow: 0 },
  chips: { paddingHorizontal: 16, gap: 8, paddingVertical: 6 },
  chip: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 999, backgroundColor: Colors.surface },
  chipAtivo: { backgroundColor: Colors.primary.DEFAULT },
  chipTexto: { fontSize: 14, fontWeight: '700', color: Colors.text },
  chipTextoAtivo: { color: Colors.onPrimary },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  conteudo: { paddingHorizontal: 16, paddingTop: 8, gap: 10 },
  secao: { fontSize: 13, fontWeight: '800', color: Colors.textLight, textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 10 },
  vazio: { fontSize: 15, color: Colors.textLight, textAlign: 'center', marginTop: 24 },
  aviso: { fontSize: 12, color: Colors.textLight, textAlign: 'center', lineHeight: 17, marginTop: 16 },
});
