import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import api from '@/services/api';
import { Colors } from '@/constants/Colors';
import { useAssinatura } from '@/contexts/AssinaturaContext';
import { Artigo } from '@/services/conteudo';
import { TextoArtigo } from '@/components/conteudo/TextoArtigo';

// Leitura de um artigo da biblioteca.

export default function ArtigoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { abrirPlanos } = useAssinatura();
  const [artigo, setArtigo] = useState<Artigo | null>(null);
  const [estado, setEstado] = useState<'carregando' | 'ok' | 'bloqueado' | 'erro'>('carregando');

  // Recarrega no foco: depois de assinar, a usuaria volta da tela de planos para ca.
  useFocusEffect(
    useCallback(() => {
      if (!slug) return;
      let ativo = true;
      setEstado('carregando');
      api
        .get<Artigo>(`/conteudo/${slug}`)
        .then((res) => {
          if (!ativo) return;
          setArtigo(res.data);
          setEstado('ok');
        })
        .catch((e) => {
          if (ativo) setEstado(e?.response?.status === 402 ? 'bloqueado' : 'erro');
        });
      return () => {
        ativo = false;
      };
    }, [slug]),
  );

  return (
    <View style={styles.tela}>
      <View style={[styles.topo, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.voltar} accessibilityLabel="Voltar">
          <MaterialIcons name="arrow-back-ios-new" size={20} color={Colors.text} />
        </TouchableOpacity>
      </View>

      {estado === 'carregando' ? (
        <View style={styles.centro}>
          <ActivityIndicator color={Colors.primary.DEFAULT} />
        </View>
      ) : estado === 'bloqueado' ? (
        <View style={styles.centro}>
          <MaterialIcons name="lock" size={32} color={Colors.primary.DEFAULT} />
          <Text style={styles.msg}>Este artigo faz parte do Premium.</Text>
          <TouchableOpacity style={styles.botao} onPress={() => abrirPlanos('BIBLIOTECA')}>
            <Text style={styles.botaoTexto}>Ver planos</Text>
          </TouchableOpacity>
        </View>
      ) : estado === 'erro' || !artigo ? (
        <View style={styles.centro}>
          <Text style={styles.msg}>Não foi possível abrir o artigo.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={[styles.conteudo, { paddingBottom: insets.bottom + 40 }]}>
          <Text style={styles.categoria}>
            {artigo.categoria}
            {artigo.tempoLeituraMin ? `  ·  ${artigo.tempoLeituraMin} min de leitura` : ''}
          </Text>
          <Text style={styles.titulo}>{artigo.titulo}</Text>
          {artigo.descricao ? <Text style={styles.descricao}>{artigo.descricao}</Text> : null}
          <View style={styles.divisor} />
          {artigo.conteudoMarkdown ? <TextoArtigo texto={artigo.conteudoMarkdown} /> : null}
          <Text style={styles.aviso}>Informação geral, que não substitui a consulta com um profissional de saúde.</Text>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: Colors.background },
  topo: { paddingHorizontal: 12, paddingBottom: 4 },
  voltar: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    paddingHorizontal: 32,
  },
  msg: {
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
    fontWeight: '600',
  },
  botao: {
    backgroundColor: Colors.primary.DEFAULT,
    borderRadius: 999,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  botaoTexto: { color: Colors.onPrimary, fontWeight: '900', fontSize: 16 },
  conteudo: { paddingHorizontal: 22, paddingTop: 4 },
  categoria: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary.DEFAULT,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  titulo: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.text,
    lineHeight: 34,
    marginTop: 6,
  },
  descricao: {
    fontSize: 16,
    color: Colors.textLight,
    lineHeight: 23,
    marginTop: 8,
  },
  divisor: { height: 1, backgroundColor: Colors.border, marginVertical: 20 },
  aviso: {
    fontSize: 12,
    color: Colors.textLight,
    lineHeight: 17,
    marginTop: 28,
    textAlign: 'center',
  },
});
