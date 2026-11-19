import { useEffect } from 'react';
import { View, Text, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Logo } from '@/components/Marca';
import { getToken } from '@/services/storage';
import { Colors } from '@/constants/Colors';

export default function SplashScreen() {
  const router = useRouter();
  const __debugDest = __DEV__ ? 'dev' : 'release';

  useEffect(() => {
    async function checkAuth() {
      try {
        // Pequeno delay para exibir a splash (simulando carregamento)
        await new Promise(resolve => setTimeout(resolve, 2000));

        const token = await getToken();
        const dest = token ? '/(app)/home' : '/(onboarding)/inicio';

        // eslint-disable-next-line no-console
        console.log('[SPLASH] token?', !!token, '→ navigating to', dest);

        router.replace(dest);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[SPLASH] checkAuth failed', err);
        router.replace('/(onboarding)/inicio');
      }
    }

    checkAuth();
  }, []);

  return (
    <View className="flex-1 items-center justify-between bg-background dark:bg-[#102216] py-12 px-8">
      {/* Decorative Backgrounds (Simulated with absolute views) */}
      <View className="absolute top-[-50] right-[-50] w-[400px] h-[400px] rounded-full bg-primary opacity-10 blur-3xl" />
      <View className="absolute bottom-[50] left-[-50] w-[300px] h-[300px] rounded-full bg-primary opacity-5 blur-3xl" />

      {/* Center Content */}
      <View className="flex-1 items-center justify-center">
        <View className="mb-6">
          <Logo largura={240} />
        </View>
        
        <Text className="text-muted dark:text-[#a1b8aa] text-sm text-center max-w-[260px]">
          Seu corpo muda, sua estratégia também.
        </Text>
      </View>

      {/* Footer */}
      <View className="w-full items-center gap-3">
        <View className="w-full flex-row justify-between items-end px-1">
          <Text className="text-ink dark:text-[#e0e6e2] text-sm font-medium">Verificando status...</Text>
          <Text className="text-muted dark:text-[#8baaa1] text-xs">80%</Text>
        </View>
        
        <View className="h-2 w-full rounded-full bg-line dark:bg-[#1f3526] overflow-hidden p-[2px]">
          <View className="h-full w-[80%] rounded-full bg-primary" />
        </View>

        <Text className="mt-4 text-muted dark:text-[#4a6354] text-[10px] font-medium tracking-widest uppercase">
          Versão 2.1.0 ({__debugDest})
        </Text>

        <Text className="mt-1 text-muted dark:text-[#4a6354] text-[10px]">
          Se ficar branco, veja overlay ROUTE.
        </Text>
      </View>
    </View>
  );
}
