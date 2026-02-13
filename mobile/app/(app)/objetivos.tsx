import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

const PRIMARY = '#13ec5b';
const BG = '#F6F8F6';
const STORAGE_KEY = 'cicloleve_objetivos';

const OPTIONS = [
  'TPM',
  'Cólica',
  'Menopausa',
  'Fertilidade',
  'Estabilidade de humor',
  'Sono',
  'Bem-estar geral',
];

export default function ObjetivosScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await SecureStore.getItemAsync(STORAGE_KEY);
        if (raw) {
          const arr = JSON.parse(raw);
          if (Array.isArray(arr)) setSelected(arr);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggle = (label: string) => {
    setSelected((prev) =>
      prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label]
    );
  };

  const handleSave = async () => {
    try {
      await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(selected));
      router.back();
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar seus objetivos agora.');
    }
  };

  return (
    <View style={styles.screen}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={22} color="#111813" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Editar objetivos</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Quais são seus focos principais hoje?</Text>
        <Text style={styles.subtitle}>
          Escolha 1 ou mais objetivos. Isso ajuda a personalizar as notas da especialista e as
          recomendações do app.
        </Text>

        <View style={styles.chipGrid}>
          {OPTIONS.map((label) => {
            const active = selected.includes(label);
            return (
              <TouchableOpacity
                key={label}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => toggle(label)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveBtn, selected.length === 0 && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveText}>Salvar</Text>
        </TouchableOpacity>
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
    backgroundColor: 'rgba(246,248,246,0.98)',
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
    color: '#111813',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 140,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111813',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
  },
  chipGrid: {
    gap: 10,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  chipActive: {
    borderColor: PRIMARY,
    backgroundColor: 'rgba(19,236,91,0.12)',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  chipTextActive: {
    color: '#065F46',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: 'rgba(246,248,246,0.98)',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  saveBtn: {
    height: 52,
    borderRadius: 999,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.9,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#102216',
  },
});
