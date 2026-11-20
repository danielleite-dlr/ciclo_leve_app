import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Logo } from '@/components/Marca';
import { getToken } from '@/services/storage';
import { Colors } from '@/constants/Colors';

// Primeira tela: confere se ha sessao e segue para a Home ou para o onboarding.
// Mesmo visual do splash (logo no fundo branco) para a troca nao aparecer.
export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        router.replace(token ? '/(app)/home' : '/(onboarding)/inicio');
      } catch {
        router.replace('/(onboarding)/inicio');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.tela}>
      <Logo largura={240} />
      <ActivityIndicator color={Colors.primary.DEFAULT} style={styles.carregando} />
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  carregando: { position: 'absolute', bottom: 80 },
});
