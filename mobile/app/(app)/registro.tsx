import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Slider from '@react-native-community/slider';
import api from '@/services/api';

type SymptomKey = 'inchaco' | 'fomeCompulsao' | 'humorIrritacao' | 'qualidadeSono';

type SymptomDef = {
  key: SymptomKey;
  title: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  valueLabel: (v: number) => string;
};

const PRIMARY = '#13ec5b';
const BG = '#F6F8F6';

const SYMPTOMS: SymptomDef[] = [
  {
    key: 'inchaco',
    title: 'Inchaço',
    icon: 'water-drop',
    valueLabel: (v) => {
      if (v === 0) return '0 - Sem inchaço';
      if (v === 1) return '1 - Leve';
      if (v === 2) return '2 - Moderado';
      return '3 - Péssimo';
    },
  },
  {
    key: 'fomeCompulsao',
    title: 'Fome / Compulsão',
    icon: 'restaurant',
    valueLabel: (v) => {
      if (v === 0) return '0 - Ótimo';
      if (v === 1) return '1 - Leve';
      if (v === 2) return '2 - Moderado';
      return '3 - Péssimo';
    },
  },
  {
    key: 'humorIrritacao',
    title: 'Humor / Irritação',
    icon: 'sentiment-dissatisfied',
    valueLabel: (v) => {
      if (v === 0) return '0 - Ótimo';
      if (v === 1) return '1 - Leve';
      if (v === 2) return '2 - Moderado';
      return '3 - Péssimo';
    },
  },
  {
    key: 'qualidadeSono',
    title: 'Sono',
    icon: 'bedtime',
    valueLabel: (v) => {
      if (v === 0) return '0 - Ótimo';
      if (v === 1) return '1 - Leve';
      if (v === 2) return '2 - Moderado';
      return '3 - Péssimo';
    },
  },
];

function safeNumber(s: string): number | undefined {
  const t = (s || '').replace(',', '.').trim();
  if (!t) return undefined;
  const n = Number(t);
  if (Number.isNaN(n)) return undefined;
  return n;
}

function SymptomSlider({
  title,
  icon,
  value,
  valueLabel,
  onChange,
}: {
  title: string;
  icon: SymptomDef['icon'];
  value: number;
  valueLabel: (v: number) => string;
  onChange: (v: number) => void;
}) {
  const fillPct = useMemo(() => {
    // 0..3 -> 5%, 33%, 66%, 100% (aprox como modelo)
    if (value <= 0) return 0.05;
    if (value === 1) return 0.33;
    if (value === 2) return 0.66;
    return 1;
  }, [value]);

  return (
    <View style={styles.symptomWrap}>
      <View style={styles.symptomHeader}>
        <View style={styles.symptomTitleRow}>
          <View style={styles.symptomIconWrap}>
            <MaterialIcons name={icon} size={20} color={PRIMARY} />
          </View>
          <Text style={styles.symptomTitle}>{title}</Text>
        </View>

        <View style={[styles.valuePill, value === 0 ? styles.valuePillPrimary : null]}>
          <Text style={[styles.valuePillText, value === 0 ? styles.valuePillTextPrimary : null]}>
            {valueLabel(value)}
          </Text>
        </View>
      </View>

      <View style={styles.sliderArea}>
        <View style={styles.trackBase}>
          <View style={[styles.trackFill, { width: `${Math.round(fillPct * 100)}%` }]} />
        </View>

        {/* Slider nativo por cima (invisível) */}
        <Slider
          style={styles.nativeSlider}
          minimumValue={0}
          maximumValue={3}
          step={1}
          value={value}
          onValueChange={(v) => onChange(Number(v))}
          minimumTrackTintColor="transparent"
          maximumTrackTintColor="transparent"
          thumbTintColor={PRIMARY}
        />

        <View style={styles.ticks} pointerEvents="none">
          {[0, 1, 2, 3].map((n) => (
            <Text key={n} style={styles.tickText}>
              {n}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}

export default function Registro() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const todayLabel = useMemo(() => {
    // Ex: "Hoje, 24 Out"
    const d = format(new Date(), "d MMM", { locale: ptBR });
    return `Hoje, ${d}`;
  }, []);

  const [values, setValues] = useState<Record<SymptomKey, number>>({
    inchaco: 0,
    fomeCompulsao: 0,
    humorIrritacao: 0,
    qualidadeSono: 0,
  });

  const [peso, setPeso] = useState('');

  useEffect(() => {
    // Gate simples: se não houver ciclo/perfil, manda pro onboarding
    (async () => {
      try {
        const res = await api.get('/perfil');
        if (!res.data?.ciclo) {
          Alert.alert(
            'Complete seu onboarding',
            'Antes de registrar, finalize seu ciclo para calcular a fase corretamente.'
          );
          router.replace('/(onboarding)/dados-corpo');
        }
      } catch {
        // Se falhar, não bloqueia a tela; o save já trata erro.
      }
    })();
  }, [router]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const pesoKg = safeNumber(peso);

      await api.post('/registros', {
        inchaco: values.inchaco,
        fomeCompulsao: values.fomeCompulsao,
        humorIrritacao: values.humorIrritacao,
        qualidadeSono: values.qualidadeSono,
        pesoKg,
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

  return (
    <View style={styles.screen}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color="#111813" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Registro Diário</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Headline */}
        <View style={styles.headlineBlock}>
          <Text style={styles.todayTag}>{todayLabel}</Text>
          <Text style={styles.h1}>Como você está se sentindo?</Text>
          <Text style={styles.desc}>
            Avalie seus sintomas de 0 (ótimo) a 3 (péssimo). Seus registros ajudam a personalizar suas dicas.
          </Text>
        </View>

        {/* Sliders */}
        <View style={styles.symptomsList}>
          {SYMPTOMS.map((s) => (
            <SymptomSlider
              key={s.key}
              title={s.title}
              icon={s.icon}
              value={values[s.key]}
              valueLabel={s.valueLabel}
              onChange={(v) => setValues((prev) => ({ ...prev, [s.key]: v }))}
            />
          ))}

          <View style={styles.divider} />

          {/* Peso */}
          <View style={styles.weightBlock}>
            <Text style={styles.weightLabel}>
              <MaterialIcons name="monitor-weight" size={18} color={PRIMARY} />{' '}
              Peso do dia <Text style={styles.weightOptional}>(Opcional)</Text>
            </Text>
            <View style={styles.weightInputWrap}>
              <TextInput
                value={peso}
                onChangeText={setPeso}
                placeholder="00.0"
                placeholderTextColor="#D1D5DB"
                keyboardType="numeric"
                style={styles.weightInput}
              />
              <Text style={styles.weightUnit}>kg</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky footer */}
      <View style={styles.footer} pointerEvents="box-none">
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
          <MaterialIcons name="check" size={22} color="#102216" />
          <Text style={styles.saveBtnText}>{loading ? 'Salvando...' : 'Salvar Registro'}</Text>
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
    backgroundColor: 'rgba(246,248,246,0.92)',
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
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 140,
  },
  headlineBlock: {
    marginTop: 8,
    marginBottom: 20,
  },
  todayTag: {
    fontSize: 12,
    fontWeight: '800',
    color: PRIMARY,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  h1: {
    marginTop: 8,
    fontSize: 30,
    fontWeight: '900',
    color: '#111813',
  },
  desc: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: 18,
    color: '#6B7280',
  },
  symptomsList: {
    gap: 18,
  },
  symptomWrap: {
    gap: 10,
  },
  symptomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  symptomTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  symptomIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  symptomTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111813',
  },
  valuePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#F3F4F6',
  },
  valuePillPrimary: {
    backgroundColor: 'rgba(19,236,91,0.12)',
  },
  valuePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },
  valuePillTextPrimary: {
    color: PRIMARY,
  },
  sliderArea: {
    position: 'relative',
    height: 58,
    justifyContent: 'center',
  },
  trackBase: {
    height: 16,
    borderRadius: 999,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    backgroundColor: PRIMARY,
    borderRadius: 999,
  },
  nativeSlider: {
    position: 'absolute',
    left: -8,
    right: -8,
    top: 0,
    bottom: 0,
    opacity: 0.01,
  },
  ticks: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  tickText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  weightBlock: {
    gap: 10,
  },
  weightLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111813',
  },
  weightOptional: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  weightInputWrap: {
    position: 'relative',
  },
  weightInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    fontSize: 18,
    fontWeight: '700',
    color: '#111813',
  },
  weightUnit: {
    position: 'absolute',
    right: 16,
    top: 18,
    color: '#9CA3AF',
    fontWeight: '700',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: 'rgba(246,248,246,0.98)',
    borderTopWidth: 0,
  },
  saveBtn: {
    height: 56,
    borderRadius: 999,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    shadowColor: PRIMARY,
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#102216',
  },
});
