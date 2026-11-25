import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppLock } from '@/components/AppLock';
import { AssinaturaProvider } from '@/contexts/AssinaturaContext';
import { iniciarMonitoramento } from '@/services/monitoramento';
import '../global.css';

// Relatorio de falhas: liga antes de qualquer tela renderizar
iniciarMonitoramento();

export default function RootLayout() {
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
