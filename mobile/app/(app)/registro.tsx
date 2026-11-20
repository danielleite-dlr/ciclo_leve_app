import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { format, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Slider from '@react-native-community/slider';
import api from '@/services/api';
import { enviarSintomasSaude } from '@/services/saude';
import { Colors } from '@/constants/Colors';
import { parseDateOnly } from '@/services/cycle';
import { useDiaAtual } from '@/hooks/useDiaAtual';
import { SINTOMAS, SintomaKey } from '@/constants/sintomas';

type SymptomKey = SintomaKey;

const PRIMARY = Colors.primary.DEFAULT;
const BG = Colors.background;

// Cor do nivel: verde-agua sem queixa, rose mais forte quanto pior.
const COR_NIVEL = [
  { bg: Colors.accent.light, fg: Colors.accent.dark },
  { bg: '#F1ECEE', fg: '#4B5563' },
  { bg: Colors.primary.light, fg: Colors.primary.dark },
  { bg: Colors.primary.DEFAULT, fg: Colors.onPrimary },
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
  niveis,
  onChange,
}: {
  title: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  value: number;
  niveis: readonly string[];
  onChange: (v: number) => void;
}) {
  const cor = COR_NIVEL[value] ?? COR_NIVEL[0];
  return (
    <View style={styles.symptomWrap}>
      <View style={styles.symptomHeader}>
        <View style={styles.symptomTitleRow}>
          <View style={styles.symptomIconWrap}>
            <MaterialIcons name={icon} size={20} color={PRIMARY} />
          </View>
          <Text style={styles.symptomTitle}>{title}</Text>
        </View>
      </View>

      <View style={[styles.valuePill, { backgroundColor: cor.bg }]}>
        <Text style={[styles.valuePillText, { color: cor.fg }]}>{niveis[value] ?? value}</Text>
      </View>

      <View style={styles.sliderArea}>
        {/* Slider visivel: no iOS um slider com opacity <= 0.01 nao recebe toques */}
        <Slider
          style={styles.nativeSlider}
          minimumValue={0}
          maximumValue={3}
          step={1}
          value={value}
          onValueChange={(v) => onChange(Number(v))}
          minimumTrackTintColor={PRIMARY}
          maximumTrackTintColor={Colors.border}
          thumbTintColor={PRIMARY}
        />

        <View style={styles.ticks} pointerEvents="none">
          <Text style={styles.tickText}>{niveis[0]}</Text>
          <Text style={styles.tickText}>{niveis[3]}</Text>
        </View>
      </View>
    </View>
  );
}

export default function Registro() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const hoje = useDiaAtual();
  const todayLabel = useMemo(() => {
    // Ex: "Hoje, 24 Out"
    const d = format(parseDateOnly(hoje), 'd MMM', { locale: ptBR });
    return `Hoje, ${d}`;
  }, [hoje]);

  const [values, setValues] = useState<Record<SymptomKey, number>>({
    inchaco: 0,
    fomeCompulsao: 0,
    humorIrritacao: 0,
    qualidadeSono: 0,
  });

  const [peso, setPeso] = useState('');

  // A tela fica montada entre visitas (aba oculta): recarrega ao ganhar foco.
  // Se ja existe registro de hoje, preenche com ele (editar em vez de comecar do zero).
  useFocusEffect(
    useCallback(() => {
    (async () => {
      try {
        const [res, regs] = await Promise.all([
          api.get('/perfil'),
          api.get('/registros', { params: { limit: 1 } }).catch(() => null),
        ]);
        const lista: any[] = Array.isArray(regs?.data) ? regs.data : regs?.data?.data || [];
        const hoje = lista[0]?.dataRegistro && isToday(parseDateOnly(lista[0].dataRegistro)) ? lista[0] : null;
        setValues({
          inchaco: Number(hoje?.inchaco ?? 0),
          fomeCompulsao: Number(hoje?.fomeCompulsao ?? 0),
          humorIrritacao: Number(hoje?.humorIrritacao ?? 0),
          qualidadeSono: Number(hoje?.qualidadeSono ?? 0),
        });
        setPeso(hoje?.pesoKg != null ? String(Number(hoje.pesoKg)) : '');
        if (!res.data?.ciclo) {
          Alert.alert(
            'Complete seu onboarding',
            'Antes de registrar, finalize seu ciclo para calcular a fase corretamente.'
          );
          router.replace('/(onboarding)/passos');
        }
      } catch {
        // Se falhar, não bloqueia a tela; o save já trata erro.
      }
    })();
    }, [router])
  );

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
        // data do aparelho (evita cair no dia seguinte pelo fuso do servidor)
        dataRegistro: format(new Date(), 'yyyy-MM-dd'),
      });
      // App Saude (se ativado). Falha aqui nao atrapalha o registro.
      enviarSintomasSaude(new Date(), values).catch(() => null);

      // Após salvar, mostra feedback (Dica do Dia) no padrão do design.
      router.replace({
        pathname: '/(app)/dica-do-dia',
        params: {
          inchaco: String(values.inchaco),
          fomeCompulsao: String(values.fomeCompulsao),
          humorIrritacao: String(values.humorIrritacao),
          qualidadeSono: String(values.qualidadeSono),
        },
      });
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
          <MaterialIcons name="arrow-back" size={24} color={Colors.text} />
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
            Arraste cada barra até o que mais combina com o seu dia. As dicas de hoje partem dessas respostas.
          </Text>
        </View>

        {/* Sliders */}
        <View style={styles.symptomsList}>
          {SINTOMAS.map((s) => (
            <SymptomSlider
              key={s.key}
              title={s.pergunta}
              icon={s.icone}
              value={values[s.key]}
              niveis={s.niveis}
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
          <MaterialIcons name="check" size={22} color={Colors.onPrimary} />
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
    backgroundColor: 'rgba(246,243,244,0.92)',
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
    color: Colors.text,
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
    color: Colors.text,
  },
  valuePill: {
    alignSelf: 'flex-start',
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#F3F4F6',
  },
  valuePillPrimary: {
    backgroundColor: 'rgba(227,124,150,0.12)',
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
    paddingTop: 4,
  },
  nativeSlider: {
    width: '100%',
    height: 40,
  },
  ticks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  tickText: {
    fontSize: 11,
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
    color: Colors.text,
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
    color: Colors.text,
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
    backgroundColor: 'rgba(246,243,244,0.98)',
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
    color: Colors.onPrimary,
  },
});
