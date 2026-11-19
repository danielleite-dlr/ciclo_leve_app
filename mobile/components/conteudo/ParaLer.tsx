import { useCallback, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import api from '@/services/api';
import { Colors } from '@/constants/Colors';
import { ArtigoResumo, ListaArtigos } from '@/services/conteudo';
import { CartaoArtigo } from './CartaoArtigo';

/** Secao "Para ler" da Home: 3 artigos (os da fase atual vem primeiro) e o link para a lista. */
export function ParaLer({ quantidade = 3 }: { quantidade?: number }) {
  const router = useRouter();
  const [artigos, setArtigos] = useState<ArtigoResumo[]>([]);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      api
        .get<ListaArtigos>('/conteudo')
        .then((res) => ativo && setArtigos(res.data.data.slice(0, quantidade)))
        .catch(() => ativo && setArtigos([]));
      return () => {
        ativo = false;
      };
    }, [quantidade])
  );

  if (artigos.length === 0) return null;

  return (
    <View style={styles.secao}>
      <View style={styles.topo}>
        <Text style={styles.titulo}>Para ler</Text>
        <TouchableOpacity onPress={() => router.push('/(app)/conteudo')} hitSlop={8}>
          <Text style={styles.verTodos}>Ver todos</Text>
        </TouchableOpacity>
      </View>
      {artigos.map((a) => (
        <CartaoArtigo key={a.id} artigo={a} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  secao: { gap: 10, marginTop: 8 },
  topo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 },
  titulo: { fontSize: 20, fontWeight: '900', color: Colors.text },
  verTodos: { fontSize: 14, fontWeight: '800', color: Colors.primary.DEFAULT },
});
