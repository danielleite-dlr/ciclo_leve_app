import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { addDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '@/services/api';
import { sincronizarSaude } from '@/services/saude';
import { Colors } from '@/constants/Colors';

export type MenstruacaoAcao = 'inicio' | 'fim';

type Opcao = 'hoje' | 'ontem' | 'outra';

// Janela para registrar inicio/fim da menstruacao: Hoje, Ontem ou outra data.
export function MenstruacaoSheet({
  visible,
  acao,
  onClose,
  onSaved,
}: {
  visible: boolean;
  acao: MenstruacaoAcao;
  onClose: () => void;
  onSaved: (resultado: { registroId?: string; acao: MenstruacaoAcao }) => void;
}) {
  const hoje = new Date();
  const [opcao, setOpcao] = useState<Opcao>('hoje');
  const [outraData, setOutraData] = useState<Date>(addDays(hoje, -2));
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (visible) setOpcao('hoje');
  }, [visible]);

  const dataEscolhida = opcao === 'hoje' ? hoje : opcao === 'ontem' ? addDays(hoje, -1) : outraData;

  const confirmar = async () => {
    setSalvando(true);
    try {
      // Data local (yyyy-MM-dd): evita trocar o dia por causa do fuso
      const res = await api.post(`/menstruacao/${acao}`, { data: format(dataEscolhida, 'yyyy-MM-dd') });
      onSaved({ registroId: res.data?.registro?.id, acao });
      sincronizarSaude({ forcar: true }).catch(() => null);
    } catch (error: any) {
      Alert.alert('Não foi possível registrar', error?.response?.data?.error || 'Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  const titulo = acao === 'inicio' ? 'Quando sua menstruação começou?' : 'Quando sua menstruação acabou?';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.title}>{titulo}</Text>

        <View style={styles.options}>
          {(['hoje', 'ontem', 'outra'] as Opcao[]).map((o) => {
            const ativo = opcao === o;
            const label = o === 'hoje' ? 'Hoje' : o === 'ontem' ? 'Ontem' : 'Outra data';
            return (
              <TouchableOpacity
                key={o}
                onPress={() => setOpcao(o)}
                style={[styles.option, ativo && styles.optionActive]}
                activeOpacity={0.8}
              >
                <Text style={[styles.optionText, ativo && styles.optionTextActive]}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {opcao === 'outra' ? (
          <DateTimePicker
            value={outraData}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            maximumDate={hoje}
            minimumDate={addDays(hoje, -60)}
            accentColor={Colors.primary.DEFAULT}
            locale="pt-BR"
            onChange={(_e: DateTimePickerEvent, d?: Date) => d && setOutraData(d)}
          />
        ) : null}

        <Text style={styles.selected}>{format(dataEscolhida, "EEEE, d 'de' MMMM", { locale: ptBR })}</Text>

        <TouchableOpacity style={styles.confirm} onPress={confirmar} disabled={salvando} activeOpacity={0.85}>
          {salvando ? <ActivityIndicator color={Colors.onPrimary} /> : <Text style={styles.confirmText}>Confirmar</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={onClose} style={styles.cancel}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </Modal>
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
  },
  handle: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: Colors.border, marginBottom: 16 },
  title: { fontSize: 20, fontWeight: '900', color: Colors.text, textAlign: 'center', marginBottom: 16 },
  options: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  option: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: Colors.background,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionActive: { backgroundColor: Colors.primary.light, borderColor: Colors.primary.DEFAULT },
  optionText: { fontSize: 15, fontWeight: '800', color: Colors.text },
  optionTextActive: { color: Colors.primary.dark },
  selected: { textAlign: 'center', color: Colors.textLight, fontSize: 14, marginVertical: 8 },
  confirm: {
    marginTop: 8,
    backgroundColor: Colors.primary.DEFAULT,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmText: { color: Colors.onPrimary, fontSize: 17, fontWeight: '900' },
  cancel: { alignItems: 'center', paddingVertical: 12 },
  cancelText: { color: Colors.textLight, fontWeight: '700' },
});
