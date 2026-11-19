import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { Colors } from '@/constants/Colors';

const PRIMARY = Colors.primary.DEFAULT;
const BG = Colors.background;
const PREF_KEY = 'cicloleve_push_optin';

export default function NotificacoesScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await SecureStore.getItemAsync(PREF_KEY);
        if (stored === '0') setEnabled(false);
        if (stored === '1') setEnabled(true);
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggle = async () => {
    try {
      const next = !enabled;
      setEnabled(next);
      await SecureStore.setItemAsync(PREF_KEY, next ? '1' : '0');
      if (next) {
        Alert.alert(
          'Notificações ativadas',
          'Quando a funcionalidade de push estiver ativa no servidor, você começará a receber lembretes.'
        );
      }
    } catch {
      Alert.alert('Erro', 'Não foi possível atualizar sua preferência agora.');
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Notificações</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Lembretes do Ciclo</Text>
        <Text style={styles.subtitle}>
          Ative para receber lembretes suaves sobre registro diário e fases importantes do seu ciclo.
        </Text>

        <View style={styles.row}>
          <View>
            <Text style={styles.rowTitle}>Receber notificações</Text>
            <Text style={styles.rowDesc}>Você pode alterar isso a qualquer momento.</Text>
          </View>

          <Switch
            value={enabled}
            onValueChange={toggle}
            trackColor={{ false: '#D1D5DB', true: 'rgba(227,124,150,0.45)' }}
            thumbColor={enabled ? PRIMARY : '#9CA3AF'}
            disabled={loading}
          />
        </View>

        <Text style={styles.footerText}>
          Obs.: Esta versão ainda não está enviando push real, mas sua preferência já fica registrada para
          quando o servidor estiver pronto.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BG,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 44,
    paddingBottom: 14,
    backgroundColor: 'rgba(246,243,244,0.98)',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
  },
  row: {
    marginTop: 8,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },
  rowDesc: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  footerText: {
    marginTop: 20,
    fontSize: 12,
    color: '#9CA3AF',
  },
});
