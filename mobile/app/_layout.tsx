import { Slot, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../global.css';

export default function RootLayout() {
  const pathname = usePathname();

  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        <Slot />
        <StatusBar style="auto" />

        {/* Debug overlay: diagnose 'white screen' even if NativeWind/styles fail */}
        <View style={styles.overlay} pointerEvents="none">
          <Text style={styles.overlayText}>ROUTE: {pathname || '(none)'}</Text>
        </View>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  overlay: {
    position: 'absolute',
    left: 8,
    right: 8,
    bottom: 8,
    backgroundColor: 'rgba(0,0,0,0.85)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    zIndex: 9999,
  },
  overlayText: {
    color: '#ffffff',
    fontSize: 11,
  },
});
