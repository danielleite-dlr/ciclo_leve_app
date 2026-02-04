import { Slot, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../global.css';

export default function RootLayout() {
  const pathname = usePathname();

  // If this doesn't show up, JS/layout isn't rendering on screen.
  console.log('[ROOT_LAYOUT] rendered. pathname=', pathname);

  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        {/* Hard banner (very visible) */}
        <View style={styles.banner} pointerEvents="none">
          <Text style={styles.bannerText}>CICLO LEVE DEBUG</Text>
          <Text style={styles.bannerSub}>ROUTE: {pathname || '(none)'}</Text>
        </View>

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
  banner: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: '#ff0033',
    paddingTop: 24,
    paddingBottom: 12,
    paddingHorizontal: 12,
    zIndex: 10000,
  },
  bannerText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
  bannerSub: {
    marginTop: 4,
    color: '#ffffff',
    fontSize: 13,
  },
  overlayText: {
    color: '#ffffff',
    fontSize: 11,
  },
});
