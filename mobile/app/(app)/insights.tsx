import { StyleSheet, Text, View } from 'react-native';

export default function InsightsScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Insights</Text>
      <Text style={styles.subtitle}>
        Em breve: gráficos, padrões de sintomas e evolução do ciclo.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 48,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111813',
  },
  subtitle: {
    marginTop: 12,
    color: '#6B7280',
  },
});
