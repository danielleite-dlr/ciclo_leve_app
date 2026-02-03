import { useEffect } from 'react';
import { View, Text, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { getToken } from '@/services/storage';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      // Pequeno delay para exibir a splash (simulando carregamento)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const token = await getToken();
      if (token) {
        router.replace('/(app)/home');
      } else {
        router.replace('/(auth)/login');
      }
    }

    checkAuth();
  }, []);

  return (
    <View className="flex-1 items-center justify-between bg-[#f6f8f6] dark:bg-[#102216] py-12 px-8">
      {/* Decorative Backgrounds (Simulated with absolute views) */}
      <View className="absolute top-[-50] right-[-50] w-[400px] h-[400px] rounded-full bg-[#13ec5b] opacity-10 blur-3xl" />
      <View className="absolute bottom-[50] left-[-50] w-[300px] h-[300px] rounded-full bg-[#13ec5b] opacity-5 blur-3xl" />

      {/* Center Content */}
      <View className="flex-1 items-center justify-center">
        <View className="mb-8 h-28 w-28 items-center justify-center rounded-[2rem] bg-white shadow-xl shadow-[#13ec5b]/10 dark:bg-[#1a2c20]">
          <MaterialIcons name="female" size={64} color="#13ec5b" />
        </View>
        
        <Text className="text-[#111813] dark:text-white text-4xl font-bold tracking-tight mb-2">
          CicloLeve
        </Text>
        
        <Text className="text-[#61896f] dark:text-[#a1b8aa] text-sm text-center max-w-[260px]">
          Seu corpo muda, sua estratégia também.
        </Text>
      </View>

      {/* Footer */}
      <View className="w-full items-center gap-3">
        <View className="w-full flex-row justify-between items-end px-1">
          <Text className="text-[#111813] dark:text-[#e0e6e2] text-sm font-medium">Verificando status...</Text>
          <Text className="text-[#61896f] dark:text-[#8baaa1] text-xs">80%</Text>
        </View>
        
        <View className="h-2 w-full rounded-full bg-[#dbe6df] dark:bg-[#1f3526] overflow-hidden p-[2px]">
          <View className="h-full w-[80%] rounded-full bg-[#13ec5b]" />
        </View>

        <Text className="mt-4 text-[#9aa09c] dark:text-[#4a6354] text-[10px] font-medium tracking-widest uppercase">
          Versão 2.1.0
        </Text>
      </View>
    </View>
  );
}
