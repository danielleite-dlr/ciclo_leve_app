import { useEffect } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { registrarErro } from '@/services/monitoramento';

export default function GlobalError({ error }: { error: unknown }) {
  const router = useRouter();

  useEffect(() => {
    // Best-effort: surface the error in native logs
    // eslint-disable-next-line no-console
    console.error('[GLOBAL_ERROR_BOUNDARY]', error);
    registrarErro(error, 'tela de erro');
  }, [error]);

  const message =
    error instanceof Error
      ? `${error.name}: ${error.message}`
      : typeof error === 'string'
        ? error
        : 'Erro desconhecido';

  const stack = error instanceof Error ? error.stack : undefined;

  return (
    <View className="flex-1 bg-[#0b0f0d] px-5 py-10">
      <Text className="text-white text-xl font-bold">Não foi possível abrir esta tela</Text>
      <Text className="text-white/80 mt-2">{message}</Text>

      {stack ? (
        <ScrollView className="mt-4 rounded-xl bg-white/5 p-4" contentContainerStyle={{ paddingBottom: 20 }}>
          <Text className="text-white/70 text-xs">{stack}</Text>
        </ScrollView>
      ) : null}

      <View className="mt-6 flex-row gap-3">
        <Pressable
          className="rounded-xl bg-primary px-4 py-3"
          onPress={() => {
            // Try to restart navigation stack
            router.replace('/');
          }}
        >
          <Text className="text-black font-semibold">Tentar novamente</Text>
        </Pressable>

        <Pressable
          className="rounded-xl bg-white/10 px-4 py-3"
          onPress={() => {
            // eslint-disable-next-line no-console
            console.log('[GLOBAL_ERROR_BOUNDARY] retry pressed');
          }}
        >
          <Text className="text-white font-semibold">Logar</Text>
        </Pressable>
      </View>

      <Text className="text-white/50 mt-8 text-xs">
        Dica: se isso acontecer no APK (preview), copie os logs do ADB procurando por ReactNativeJS.
      </Text>
    </View>
  );
}
