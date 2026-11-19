import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useAssinatura } from '@/contexts/AssinaturaContext';
import { ArtigoResumo, ICONE_CATEGORIA } from '@/services/conteudo';

/** Cartao de artigo. Bloqueado abre a tela de planos; liberado abre o artigo. */
export function CartaoArtigo({ artigo }: { artigo: ArtigoResumo }) {
  const router = useRouter();
  const { abrirPlanos } = useAssinatura();

  const abrir = () => {
    if (artigo.bloqueado) abrirPlanos('BIBLIOTECA');
    else router.push({ pathname: '/(app)/artigo', params: { slug: artigo.slug } });
  };

  return (
    <TouchableOpacity style={styles.card} onPress={abrir} activeOpacity={0.85}>
      <View style={styles.icone}>
        <MaterialIcons name={ICONE_CATEGORIA[artigo.categoria] ?? 'article'} size={22} color={Colors.primary.DEFAULT} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.meta}>
          <Text style={styles.categoria}>{artigo.categoria}</Text>
          {artigo.tempoLeituraMin ? <Text style={styles.tempo}>· {artigo.tempoLeituraMin} min</Text> : null}
        </View>
        <Text style={styles.titulo}>{artigo.titulo}</Text>
        {artigo.descricao ? (
          <Text style={styles.descricao} numberOfLines={2}>
            {artigo.descricao}
          </Text>
        ) : null}
      </View>
      {artigo.bloqueado ? (
        <View style={styles.selo}>
          <MaterialIcons name="lock" size={12} color={Colors.primary.dark} />
          <Text style={styles.seloTexto}>Premium</Text>
        </View>
      ) : (
        <MaterialIcons name="chevron-right" size={22} color={Colors.textLight} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 14,
  },
  icone: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: { flexDirection: 'row', gap: 4 },
  categoria: { fontSize: 12, fontWeight: '800', color: Colors.primary.DEFAULT, textTransform: 'uppercase', letterSpacing: 0.6 },
  tempo: { fontSize: 12, fontWeight: '600', color: Colors.textLight },
  titulo: { fontSize: 16, fontWeight: '800', color: Colors.text, marginTop: 2 },
  descricao: { fontSize: 13, color: Colors.textLight, lineHeight: 18, marginTop: 2 },
  selo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.primary.light,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  seloTexto: { fontSize: 11, fontWeight: '800', color: Colors.primary.dark },
});
