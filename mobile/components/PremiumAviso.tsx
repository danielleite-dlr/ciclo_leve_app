import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { ModuloId, useAssinatura } from '@/contexts/AssinaturaContext';

/** Cartao para recurso bloqueado no plano gratuito. Toque abre a tela de planos. */
export function PremiumAviso({ modulo, titulo, texto }: { modulo: ModuloId; titulo: string; texto: string }) {
  const { abrirPlanos } = useAssinatura();
  return (
    <TouchableOpacity style={styles.card} onPress={() => abrirPlanos(modulo)} activeOpacity={0.85}>
      <View style={styles.icone}>
        <MaterialIcons name="lock" size={20} color={Colors.primary.DEFAULT} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.titulo}>{titulo}</Text>
        <Text style={styles.texto}>{texto}</Text>
      </View>
      <View style={styles.selo}>
        <Text style={styles.seloTexto}>Premium</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(227,124,150,0.35)',
    borderStyle: 'dashed',
  },
  icone: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: { fontSize: 15, fontWeight: '800', color: Colors.text },
  texto: { fontSize: 13, color: Colors.textLight, marginTop: 2, lineHeight: 18 },
  selo: { backgroundColor: Colors.primary.DEFAULT, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3 },
  seloTexto: { color: Colors.onPrimary, fontSize: 11, fontWeight: '900' },
});
