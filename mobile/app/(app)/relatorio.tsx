import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { MaterialIcons } from '@expo/vector-icons';
import api from '@/services/api';
import { Colors } from '@/constants/Colors';
import { ScreenHeader } from '@/components/ScreenHeader';
import { gerarHtmlRelatorio } from '@/services/relatorio';
import { useAssinatura } from '@/contexts/AssinaturaContext';
import { PremiumAviso } from '@/components/PremiumAviso';

const PERIODOS = [3, 6, 12];

// Relatorio em PDF para levar a consulta (gerado no aparelho e compartilhado pela usuaria).
export default function Relatorio() {
  const [meses, setMeses] = useState(6);
  const [incluirIntimos, setIncluirIntimos] = useState(false);
  const [podeIntimos, setPodeIntimos] = useState(false);
  const [gerando, setGerando] = useState(false);
  const liberado = useAssinatura().temModulo('RELATORIO');

  useFocusEffect(
    useCallback(() => {
      api
        .get('/fertilidade/consentimento')
        .then((r) => setPodeIntimos(!!r.data?.aceito))
        .catch(() => setPodeIntimos(false));
    }, [])
  );

  const gerar = async () => {
    setGerando(true);
    try {
      const html = await gerarHtmlRelatorio({ meses, incluirIntimos: podeIntimos && incluirIntimos });
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Relatório do ciclo', UTI: 'com.adobe.pdf' });
      } else {
        await Print.printAsync({ uri });
      }
    } catch {
      Alert.alert('Erro', 'Não foi possível gerar o relatório agora.');
    } finally {
      setGerando(false);
    }
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Relatório para o médico" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.iconWrap}>
          <MaterialIcons name="description" size={30} color={Colors.primary.DEFAULT} />
        </View>
        <Text style={styles.intro}>
          Gere um PDF com seus ciclos, menstruações e sintomas para levar à consulta. O arquivo é criado no seu aparelho e
          você escolhe com quem compartilhar.
        </Text>

        <Text style={styles.label}>Período</Text>
        <View style={styles.choices}>
          {PERIODOS.map((m) => (
            <TouchableOpacity
              key={m}
              onPress={() => setMeses(m)}
              style={[styles.choice, meses === m && styles.choiceActive]}
              activeOpacity={0.8}
            >
              <Text style={[styles.choiceText, meses === m && styles.choiceTextActive]}>{m} meses</Text>
            </TouchableOpacity>
          ))}
        </View>

        {podeIntimos ? (
          <View style={styles.card}>
            <View style={styles.flex1}>
              <Text style={styles.rowLabel}>Incluir relações e testes</Text>
              <Text style={styles.rowSub}>Útil para quem está tentando engravidar</Text>
            </View>
            <Switch
              value={incluirIntimos}
              onValueChange={setIncluirIntimos}
              trackColor={{ false: '#D1D5DB', true: Colors.primary.DEFAULT }}
              thumbColor="#FFFFFF"
            />
          </View>
        ) : null}

        {!liberado ? (
          <PremiumAviso modulo="RELATORIO" titulo="Relatório para o médico" texto="Gere o PDF com seus ciclos e sintomas assinando o Premium." />
        ) : (
        <TouchableOpacity style={[styles.btn, gerando && { opacity: 0.6 }]} onPress={gerar} disabled={gerando} activeOpacity={0.85}>
          {gerando ? (
            <ActivityIndicator color={Colors.onPrimary} />
          ) : (
            <>
              <MaterialIcons name="ios-share" size={20} color={Colors.onPrimary} />
              <Text style={styles.btnText}>Gerar e compartilhar PDF</Text>
            </>
          )}
        </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  flex1: { flex: 1 },
  content: { padding: 16, paddingBottom: 120 },
  iconWrap: {
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  intro: { fontSize: 15, color: Colors.text, lineHeight: 22, textAlign: 'center', marginBottom: 24, paddingHorizontal: 8 },
  label: { fontSize: 13, fontWeight: '800', color: Colors.textLight, marginBottom: 8, marginLeft: 4 },
  choices: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  choice: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  choiceActive: { backgroundColor: Colors.primary.light, borderColor: Colors.primary.DEFAULT },
  choiceText: { fontSize: 14, fontWeight: '800', color: Colors.text },
  choiceTextActive: { color: Colors.primary.dark },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  rowLabel: { fontSize: 15, fontWeight: '700', color: Colors.text },
  rowSub: { fontSize: 13, color: Colors.textLight, marginTop: 2 },
  btn: {
    marginTop: 8,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary.DEFAULT,
    borderRadius: 999,
    paddingVertical: 16,
  },
  btnText: { color: Colors.onPrimary, fontSize: 16, fontWeight: '900' },
});
