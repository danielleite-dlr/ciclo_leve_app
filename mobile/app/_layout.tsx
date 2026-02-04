import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import '../global.css';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <View className="flex-1 bg-white">
        <ErrorBoundary>
          <Slot />
        </ErrorBoundary>
        <StatusBar style="auto" />
      </View>
    </SafeAreaProvider>
  );
}
