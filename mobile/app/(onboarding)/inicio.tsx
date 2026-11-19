import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Logo } from '@/components/Marca';
import { Colors } from '@/constants/Colors';
import { useOnboardingStore } from '@/stores/onboardingStore';

// Primeira tela para quem ainda nao tem conta.
export default function Inicio() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const reset = useOnboardingStore((s) => s.reset);

  return (
    <View style={[styles.tela, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 16 }]}>
      <View style={styles.centro}>
        <Logo largura={240} />
        <Text style={styles.texto}>
          Acompanhe seu ciclo e receba dicas do dia de acordo com a fase e com o que você sente.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.botao}
        activeOpacity={0.85}
        onPress={() => {
          reset();
          router.push('/(onboarding)/passos');
        }}
      >
        <Text style={styles.botaoTexto}>Começar</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.secundario} onPress={() => router.push('/(auth)/login')}>
        <Text style={styles.secundarioTexto}>Já tenho conta</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: Colors.background, paddingHorizontal: 24 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  texto: { fontSize: 16, color: Colors.textLight, textAlign: 'center', marginTop: 28, lineHeight: 23, maxWidth: 300 },
  botao: { backgroundColor: Colors.primary.DEFAULT, borderRadius: 999, paddingVertical: 17, alignItems: 'center' },
  botaoTexto: { color: Colors.onPrimary, fontSize: 17, fontWeight: '900' },
  secundario: { paddingVertical: 16, alignItems: 'center' },
  secundarioTexto: { color: Colors.primary.dark, fontSize: 16, fontWeight: '800' },
});
