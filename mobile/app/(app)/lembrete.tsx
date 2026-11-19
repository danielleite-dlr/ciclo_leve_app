import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Platform, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Colors } from '@/constants/Colors';
import { ScreenHeader } from '@/components/ScreenHeader';
import { formatarHora, LEMBRETE_PADRAO, LembretePref, lerLembrete, salvarLembrete } from '@/services/lembrete';

export default function Lembrete() {
  const router = useRouter();
  const [pref, setPref] = useState<LembretePref>(LEMBRETE_PADRAO);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mostrarPicker, setMostrarPicker] = useState(false);

  useFocusEffect(
    useCallback(() => {
      lerLembrete().then((p) => {
        setPref(p);
        setLoading(false);
      });
    }, [])
  );

  const horario = new Date();
  horario.setHours(pref.hora, pref.minuto, 0, 0);

  const salvar = async () => {
    setSalvando(true);
    try {
      const ok = await salvarLembrete(pref);
      if (!ok) {
        Alert.alert(
          'Notificações desativadas',
          'Para receber o lembrete, permita as notificações do CicloLeve nos Ajustes do aparelho.',
          [{ text: 'Agora não', style: 'cancel' }, { text: 'Abrir Ajustes', onPress: () => Linking.openSettings() }]
        );
        setPref((p) => ({ ...p, ativo: false }));
        return;
      }
      Alert.alert(
        pref.ativo ? 'Lembrete ativado' : 'Lembrete desativado',
        pref.ativo ? `Vamos te lembrar todos os dias às ${formatarHora(pref)}.` : 'Você não receberá mais o lembrete diário.'
      );
      router.back();
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar o lembrete.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Lembrete diário" />
      {loading ? (
        <ActivityIndicator color={Colors.primary.DEFAULT} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.intro}>
            Um lembrete por dia para registrar como você está. Quanto mais você registra, mais certeiras ficam as dicas e
            previsões.
          </Text>

          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Lembrar todos os dias</Text>
              <Switch
                value={pref.ativo}
                onValueChange={(v) => setPref((p) => ({ ...p, ativo: v }))}
                trackColor={{ false: '#D1D5DB', true: Colors.primary.DEFAULT }}
                thumbColor="#FFFFFF"
              />
            </View>

            {pref.ativo ? (
              <>
                <View style={styles.divider} />
                <TouchableOpacity style={styles.row} onPress={() => setMostrarPicker((v) => !v)} activeOpacity={0.7}>
                  <Text style={styles.rowLabel}>Horário</Text>
                  <Text style={styles.time}>{formatarHora(pref)}</Text>
                </TouchableOpacity>
                {mostrarPicker || Platform.OS === 'ios' ? (
                  <DateTimePicker
                    value={horario}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    locale="pt-BR"
                    onChange={(_e: DateTimePickerEvent, d?: Date) => {
                      if (Platform.OS !== 'ios') setMostrarPicker(false);
                      if (d) setPref((p) => ({ ...p, hora: d.getHours(), minuto: d.getMinutes() }));
                    }}
                  />
                ) : null}
              </>
            ) : null}
          </View>

          <View style={styles.preview}>
            <Text style={styles.previewLabel}>Como vai aparecer</Text>
            <Text style={styles.previewTitle}>Como você está hoje? 💕</Text>
            <Text style={styles.previewBody}>Leva menos de 1 minuto registrar seus sintomas.</Text>
          </View>

          <TouchableOpacity style={[styles.save, salvando && { opacity: 0.6 }]} onPress={salvar} disabled={salvando}>
            {salvando ? <ActivityIndicator color={Colors.onPrimary} /> : <Text style={styles.saveText}>Salvar</Text>}
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 120 },
  intro: { fontSize: 15, color: Colors.text, lineHeight: 22, marginBottom: 16, paddingHorizontal: 4 },
  card: { backgroundColor: Colors.surface, borderRadius: 20, paddingHorizontal: 16 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14 },
  rowLabel: { fontSize: 16, fontWeight: '700', color: Colors.text },
  time: { fontSize: 18, fontWeight: '900', color: Colors.primary.DEFAULT },
  divider: { height: 1, backgroundColor: Colors.background },
  preview: { marginTop: 16, backgroundColor: Colors.surface, borderRadius: 20, padding: 16 },
  previewLabel: { fontSize: 12, fontWeight: '800', color: Colors.textLight, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  previewTitle: { fontSize: 15, fontWeight: '800', color: Colors.text },
  previewBody: { fontSize: 14, color: Colors.textLight, marginTop: 2 },
  save: { marginTop: 24, backgroundColor: Colors.primary.DEFAULT, borderRadius: 999, paddingVertical: 16, alignItems: 'center' },
  saveText: { color: Colors.onPrimary, fontSize: 17, fontWeight: '900' },
});
