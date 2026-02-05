import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { X, Check } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Button } from '@/components/ui/Button';
import api from '@/services/api';

export default function Registro() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Form States
  const [fluxo, setFluxo] = useState('');
  const [sintomas, setSintomas] = useState<string[]>([]);
  const [humor, setHumor] = useState('');
  const [notas, setNotas] = useState('');

  useEffect(() => {
    // Gate simples: se não houver ciclo/perfil, manda pro onboarding
    (async () => {
      try {
        const res = await api.get('/perfil');
        if (!res.data?.ciclo) {
          Alert.alert('Complete seu onboarding', 'Antes de registrar, finalize seu ciclo para calcular a fase corretamente.');
          router.replace('/(onboarding)/dados-corpo');
        }
      } catch (e) {
        // Se falhar, não bloqueia a tela (pode ser instabilidade); o save já trata erro.
      }
    })();
  }, [router]);

  const toggleSintoma = (sintoma: string) => {
    if (sintomas.includes(sintoma)) {
      setSintomas(sintomas.filter(s => s !== sintoma));
    } else {
      setSintomas([...sintomas, sintoma]);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Mapeamento mínimo pro backend (DTO atual):
      // - humorTags: usamos humor + sintomas selecionados
      // - notas: texto livre
      await api.post('/registros', {
        humorTags: [humor, ...sintomas].filter(Boolean),
        notas: notas?.trim() || undefined,
      });

      Alert.alert('Salvo!', 'Seu registro de hoje foi salvo.');
      router.replace('/(app)/home');
    } catch (error: any) {
      console.error(error);
      Alert.alert(
        'Erro ao salvar registro',
        error.response?.data?.message || error.response?.data?.error || 'Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const OptionChip = ({
    label,
    selected,
    onPress,
  }: {
    label: string;
    selected: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity onPress={onPress} style={[styles.chip, selected ? styles.chipSelected : null]}>
      <Text style={[styles.chipText, selected ? styles.chipTextSelected : null]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <X color={Colors.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Registrar</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading} style={styles.headerButton}>
          <Check color={Colors.primary.DEFAULT} size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.intro}>Como você está se sentindo hoje?</Text>

        {/* Section: Fluxo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fluxo Menstrual</Text>
          <View style={styles.chipsWrap}>
            {['Inexistente', 'Leve', 'Médio', 'Intenso'].map((opt) => (
              <OptionChip key={opt} label={opt} selected={fluxo === opt} onPress={() => setFluxo(opt)} />
            ))}
          </View>
        </View>

        {/* Section: Sintomas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sintomas Físicos</Text>
          <View style={styles.chipsWrap}>
            {['Cólica', 'Dor de Cabeça', 'Inchaço', 'Acne', 'Cansaço', 'Tontura'].map((opt) => (
              <OptionChip
                key={opt}
                label={opt}
                selected={sintomas.includes(opt)}
                onPress={() => toggleSintoma(opt)}
              />
            ))}
          </View>
        </View>

        {/* Section: Humor */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Humor</Text>
          <View style={styles.chipsWrap}>
            {['Feliz', 'Triste', 'Ansiosa', 'Irritada', 'Sensível', 'Neutra'].map((opt) => (
              <OptionChip key={opt} label={opt} selected={humor === opt} onPress={() => setHumor(opt)} />
            ))}
          </View>
        </View>

        {/* Section: Notas */}
        <View style={styles.sectionNotes}>
          <Text style={styles.sectionTitle}>Notas</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Alguma observação importante?"
            placeholderTextColor="#9CA3AF"
            multiline
            textAlignVertical="top"
            value={notas}
            onChangeText={setNotas}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Cancelar" onPress={() => router.back()} variant="outline" style={styles.footerBtn} />
        <Button title="Salvar" onPress={handleSave} isLoading={loading} style={[styles.footerBtn, styles.footerBtnPrimary]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 120,
  },
  intro: {
    color: '#6B7280',
    marginBottom: 20,
  },
  section: {
    marginBottom: 28,
  },
  sectionNotes: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1F2937',
    marginBottom: 12,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: {
    backgroundColor: '#CCFBF1',
    borderColor: '#14B8A6',
  },
  chipText: {
    color: '#4B5563',
    fontWeight: '700',
  },
  chipTextSelected: {
    color: '#115E59',
    fontWeight: '900',
  },
  notesInput: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 14,
    color: '#111827',
    minHeight: 120,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    flexDirection: 'row',
    gap: 12,
  },
  footerBtn: {
    flex: 1,
  },
  footerBtnPrimary: {
    backgroundColor: '#13ec5b',
  },
});
