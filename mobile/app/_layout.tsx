import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppLock } from '@/components/AppLock';
import { AssinaturaProvider } from '@/contexts/AssinaturaContext';
import '../global.css';

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
