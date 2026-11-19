import { ReactNode, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { addDays, format } from 'date-fns';
import api from '@/services/api';
import { Colors } from '@/constants/Colors';

// ---------------------------------------------------------------------------
// Primitivas

function Sheet({ visible, onClose, children }: { visible: boolean; onClose: () => void; children: ReactNode }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        {children}
      </View>
    </Modal>
  );
}

function Choices<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label?: string;
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.choicesBlock}>
      {label ? <Text style={styles.choicesLabel}>{label}</Text> : null}
      <View style={styles.choices}>
        {options.map((o) => {
          const active = value === o.value;
          return (
            <TouchableOpacity
              key={o.value}
              onPress={() => onChange(o.value)}
              style={[styles.choice, active && styles.choiceActive]}
              activeOpacity={0.8}
            >
              <Text style={[styles.choiceText, active && styles.choiceTextActive]}>{o.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function PrimaryButton({ label, onPress, disabled, loading }: { label: string; onPress: () => void; disabled?: boolean; loading?: boolean }) {
  return (
    <TouchableOpacity
      style={[styles.primary, (disabled || loading) && styles.primaryDisabled]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
    >
      {loading ? <ActivityIndicator color={Colors.onPrimary} /> : <Text style={styles.primaryText}>{label}</Text>}
    </TouchableOpacity>
  );
}

type Dia = 'hoje' | 'ontem';
const DIAS: { value: Dia; label: string }[] = [
  { value: 'hoje', label: 'Hoje' },
  { value: 'ontem', label: 'Ontem' },
];
const diaParaData = (d: Dia) => (d === 'hoje' ? new Date() : addDays(new Date(), -1));

async function salvarFertilidade(data: Date, body: Record<string, string>) {
  await api.put(`/fertilidade/${format(data, 'yyyy-MM-dd')}`, body);
}

// ---------------------------------------------------------------------------
// Consentimento (RASCUNHO de texto: revisar com o juridico antes de publicar)

export function ConsentimentoSheet({
  visible,
  onClose,
  onAccepted,
}: {
  visible: boolean;
  onClose: () => void;
  onAccepted: () => void;
}) {
  const [salvando, setSalvando] = useState(false);

  const aceitar = async () => {
    setSalvando(true);
    try {
      await api.post('/fertilidade/consentimento', { aceito: true });
      onAccepted();
    } catch (error: any) {
      Alert.alert('Não foi possível salvar', error?.response?.data?.error || 'Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Sheet visible={visible} onClose={onClose}>
      <ScrollView bounces={false}>
        <Text style={styles.title}>Seus dados íntimos, com cuidado</Text>
        <Text style={styles.body}>
          Para registrar relações sexuais e resultados de testes, precisamos da sua autorização. Esses são dados
          sensíveis de saúde (LGPD, art. 11).
        </Text>
        <Text style={styles.bullet}>• Usamos esses dados apenas para calcular suas previsões e mostrar dicas para o seu objetivo.</Text>
        <Text style={styles.bullet}>• Eles não são usados para publicidade.</Text>
        <Text style={styles.bullet}>
          • Você pode apagar tudo e revogar a autorização quando quiser, em Perfil → Privacidade dos dados íntimos.
        </Text>
        <PrimaryButton label="Autorizo" onPress={aceitar} loading={salvando} />
        <TouchableOpacity onPress={onClose} style={styles.secondary}>
          <Text style={styles.secondaryText}>Agora não</Text>
        </TouchableOpacity>
      </ScrollView>
    </Sheet>
  );
}

// ---------------------------------------------------------------------------
// Relacao

export type Relacao = 'SEM_RELACAO' | 'PROTEGIDA' | 'SEM_PROTECAO';

export function RelacaoSheet({
  visible,
  onClose,
  onSaved,
}: {
  visible: boolean;
  onClose: () => void;
  onSaved: (r: { data: Date; relacao: Relacao }) => void;
}) {
  const [dia, setDia] = useState<Dia>('hoje');
  const [relacao, setRelacao] = useState<Relacao | null>(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (visible) {
      setDia('hoje');
      setRelacao(null);
    }
  }, [visible]);

  const salvar = async () => {
    if (!relacao) return;
    setSalvando(true);
    try {
      const data = diaParaData(dia);
      await salvarFertilidade(data, { relacao });
      onSaved({ data, relacao });
    } catch (error: any) {
      Alert.alert('Não foi possível registrar', error?.response?.data?.error || 'Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Sheet visible={visible} onClose={onClose}>
      <Text style={styles.title}>Registrar relação</Text>
      <Choices options={DIAS} value={dia} onChange={setDia} />
      <Choices
        options={[
          { value: 'SEM_PROTECAO', label: 'Sem proteção' },
          { value: 'PROTEGIDA', label: 'Com proteção' },
          { value: 'SEM_RELACAO', label: 'Não tive' },
        ]}
        value={relacao}
        onChange={setRelacao}
      />
      <PrimaryButton label="Salvar" onPress={salvar} disabled={!relacao} loading={salvando} />
      <TouchableOpacity onPress={onClose} style={styles.secondary}>
        <Text style={styles.secondaryText}>Cancelar</Text>
      </TouchableOpacity>
    </Sheet>
  );
}

// ---------------------------------------------------------------------------
// Teste

export type TipoTeste = 'OVULACAO' | 'GRAVIDEZ';
export type Resultado = 'POSITIVO' | 'NEGATIVO';

export function TesteSheet({
  visible,
  onClose,
  onSaved,
}: {
  visible: boolean;
  onClose: () => void;
  onSaved: (r: { data: Date; tipo: TipoTeste; resultado: Resultado }) => void;
}) {
  const [dia, setDia] = useState<Dia>('hoje');
  const [tipo, setTipo] = useState<TipoTeste | null>(null);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (visible) {
      setDia('hoje');
      setTipo(null);
      setResultado(null);
    }
  }, [visible]);

  const salvar = async () => {
    if (!tipo || !resultado) return;
    setSalvando(true);
    try {
      const data = diaParaData(dia);
      await salvarFertilidade(data, tipo === 'OVULACAO' ? { testeOvulacao: resultado } : { testeGravidez: resultado });
      onSaved({ data, tipo, resultado });
    } catch (error: any) {
      Alert.alert('Não foi possível registrar', error?.response?.data?.error || 'Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Sheet visible={visible} onClose={onClose}>
      <Text style={styles.title}>Registrar teste</Text>
      <Choices options={DIAS} value={dia} onChange={setDia} />
      <Choices
        label="Tipo de teste"
        options={[
          { value: 'OVULACAO', label: 'Ovulação' },
          { value: 'GRAVIDEZ', label: 'Gravidez' },
        ]}
        value={tipo}
        onChange={setTipo}
      />
      <Choices
        label="Resultado"
        options={[
          { value: 'POSITIVO', label: 'Positivo' },
          { value: 'NEGATIVO', label: 'Negativo' },
        ]}
        value={resultado}
        onChange={setResultado}
      />
      <PrimaryButton label="Salvar" onPress={salvar} disabled={!tipo || !resultado} loading={salvando} />
      <TouchableOpacity onPress={onClose} style={styles.secondary}>
        <Text style={styles.secondaryText}>Cancelar</Text>
      </TouchableOpacity>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(17,24,19,0.35)' },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 36,
    maxHeight: '85%',
  },
  handle: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: Colors.border, marginBottom: 16 },
  title: { fontSize: 20, fontWeight: '900', color: Colors.text, textAlign: 'center', marginBottom: 16 },
  body: { fontSize: 15, color: Colors.text, lineHeight: 22, marginBottom: 12 },
  bullet: { fontSize: 14, color: Colors.text, opacity: 0.85, lineHeight: 21, marginBottom: 8 },
  choicesBlock: { marginBottom: 14 },
  choicesLabel: { fontSize: 13, fontWeight: '800', color: Colors.textLight, marginBottom: 8 },
  choices: { flexDirection: 'row', gap: 8 },
  choice: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: Colors.background,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  choiceActive: { backgroundColor: Colors.primary.light, borderColor: Colors.primary.DEFAULT },
  choiceText: { fontSize: 14, fontWeight: '800', color: Colors.text },
  choiceTextActive: { color: Colors.primary.dark },
  primary: {
    marginTop: 8,
    backgroundColor: Colors.primary.DEFAULT,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryDisabled: { opacity: 0.5 },
  primaryText: { color: Colors.onPrimary, fontSize: 17, fontWeight: '900' },
  secondary: { alignItems: 'center', paddingVertical: 12 },
  secondaryText: { color: Colors.textLight, fontWeight: '700' },
});
