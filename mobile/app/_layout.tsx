import { Slot, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../global.css';

export default function RootLayout() {
  const pathname = usePathname();

  return (
    <SafeAreaProvider>
      <View className="flex-1 bg-white">
        <Slot />
        <StatusBar style="auto" />

        {/* Debug overlay: helps diagnose 'white screen' in release builds */}
        <View className="absolute bottom-2 left-2 right-2 rounded-lg bg-black/70 px-3 py-2">
          <Text className="text-white text-[11px]">ROUTE: {pathname || '(none)'}</Text>
        </View>
      </View>
    </SafeAreaProvider>
  );
}
