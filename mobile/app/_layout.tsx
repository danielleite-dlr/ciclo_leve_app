import { useEffect } from 'react';
import { Slot, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppLock } from '@/components/AppLock';
import { AssinaturaProvider } from '@/contexts/AssinaturaContext';
import { iniciarMonitoramento, registrarTela } from '@/services/monitoramento';
import '../global.css';

// Relatorio de falhas: liga antes de qualquer tela renderizar
iniciarMonitoramento();

export default function RootLayout() {
  // Nome da rota sem os ids (ex.: "(app)/conteudo/[id]"), para o Analytics contar telas e nao itens
  const segmentos = useSegments();
  const tela = segmentos.join('/') || 'inicio';
  useEffect(() => registrarTela(tela), [tela]);

  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        <AppLock>
          <AssinaturaProvider>
            <Slot />
          </AssinaturaProvider>
        </AppLock>
        <StatusBar style="auto" />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});
