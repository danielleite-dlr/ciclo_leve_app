import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { format, subYears } from 'date-fns';
import { MaterialIcons } from '@expo/vector-icons';
import api from '@/services/api';
import { Colors } from '@/constants/Colors';
import { parseDateOnly } from '@/services/cycle';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Input } from '@/components/ui/Input';

export default function EditarDados() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [nascimento, setNascimento] = useState<Date | null>(null);
  const [altura, setAltura] = useState('');
  const [peso, setPeso] = useState('');
  const [email, setEmail] = useState('');
  const [mostrarData, setMostrarData] = useState(false);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useFocusEffect(
    useCallback(() => {
      api
        .get('/perfil')
        .then((res) => {
          const u = res.data?.user ?? {};
          setNome(u.nomeCompleto ?? '');
          setEmail(u.email ?? '');
          setNascimento(u.dataNascimento ? parseDateOnly(u.dataNascimento) : null);
          setAltura(u.alturaCm ? String(u.alturaCm) : '');
          setPeso(u.pesoKg ? String(Number(u.pesoKg)).replace('.', ',') : '');
        })
        .catch(() => Alert.alert('Erro', 'Não foi possível carregar seus dados.'))
        .finally(() => setLoading(false));
    }, [])
  );

  const salvar = async () => {
    setSalvando(true);
    try {
      await api.put('/perfil', {
        nomeCompleto: nome.trim(),
        dataNascimento: nascimento ? format(nascimento, 'yyyy-MM-dd') : null,
        alturaCm: altura.trim() || null,
        pesoKg: peso.trim() || null,
      });
      router.back();
    } catch (error: any) {
      Alert.alert('Não foi possível salvar', error?.response?.data?.error || 'Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Dados pessoais" />
      {loading ? (
        <ActivityIndicator color={Colors.primary.DEFAULT} style={{ marginTop: 40 }} />
      ) : (
        <KeyboardAvoidingView style={styles.flex1} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <Input label="Nome" value={nome} onChangeText={setNome} autoCapitalize="words" placeholder="Seu nome" />

            <Text style={styles.label}>E-mail</Text>
            <Text style={styles.readonly}>{email}</Text>

            <Text style={styles.label}>Data de nascimento</Text>
            <TouchableOpacity style={styles.dateBtn} onPress={() => setMostrarData((v) => !v)} activeOpacity={0.8}>
              <Text style={[styles.dateText, !nascimento && { color: '#9CA3AF' }]}>
                {nascimento ? format(nascimento, 'dd/MM/yyyy') : 'Selecione'}
              </Text>
              <MaterialIcons name="calendar-today" size={20} color={Colors.primary.DEFAULT} />
            </TouchableOpacity>
            {mostrarData ? (
              <DateTimePicker
                value={nascimento ?? subYears(new Date(), 25)}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                locale="pt-BR"
                maximumDate={subYears(new Date(), 10)}
                minimumDate={subYears(new Date(), 80)}
                onChange={(_e: DateTimePickerEvent, d?: Date) => {
                  if (Platform.OS !== 'ios') setMostrarData(false);
                  if (d) setNascimento(d);
                }}
              />
            ) : null}

            <View style={styles.row}>
              <View style={styles.flex1}>
                <Input label="Altura (cm)" value={altura} onChangeText={setAltura} keyboardType="numeric" placeholder="165" />
              </View>
              <View style={styles.flex1}>
                <Input label="Peso (kg)" value={peso} onChangeText={setPeso} keyboardType="decimal-pad" placeholder="60" />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.save, (salvando || nome.trim().length < 2) && { opacity: 0.5 }]}
              onPress={salvar}
              disabled={salvando || nome.trim().length < 2}
              activeOpacity={0.85}
            >
              {salvando ? <ActivityIndicator color={Colors.onPrimary} /> : <Text style={styles.saveText}>Salvar</Text>}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  flex1: { flex: 1 },
  content: { padding: 16, paddingBottom: 120 },
  row: { flexDirection: 'row', gap: 12, marginTop: 16 },
  label: { color: '#374151', fontWeight: '600', marginBottom: 8 },
  readonly: { fontSize: 15, color: Colors.textLight, marginBottom: 16, paddingHorizontal: 4 },
  dateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dateText: { fontSize: 15, color: Colors.text },
  save: { marginTop: 24, backgroundColor: Colors.primary.DEFAULT, borderRadius: 999, paddingVertical: 16, alignItems: 'center' },
  saveText: { color: Colors.onPrimary, fontSize: 17, fontWeight: '900' },
});
