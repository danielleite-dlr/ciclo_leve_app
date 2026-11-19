import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import api from '@/services/api';
import { Colors } from '@/constants/Colors';
import { alternarObjetivo, OBJETIVOS } from '@/constants/objetivos';

// Editar objetivos: mesma lista e visual do onboarding, salvo no perfil (backend).
export default function ObjetivosScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [ciclo, setCiclo] = useState<any | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Aba oculta: a tela continua montada entre visitas, entao recarrega ao ganhar foco.
  useFocusEffect(
    useCallback(() => {
    (async () => {
      try {
        const res = await api.get('/perfil');
        const c = res.data?.ciclo ?? null;
        setCiclo(c);
        setSelected(Array.isArray(c?.objetivos) ? c.objetivos : []);
      } catch {
        Alert.alert('Erro', 'Não foi possível carregar seus objetivos.');
      } finally {
        setLoading(false);
      }
    })();
    }, [])
  );

  // "Engravidar" e "Evitar engravidar" sao exclusivos: marcar um desmarca o outro.
  const toggle = (id: string) => {
    setSelected((prev) => alternarObjetivo(prev, id));
  };

  const handleSave = async () => {
    if (!ciclo || selected.length === 0) return;
    setSaving(true);
    try {
      // O endpoint exige os dados do ciclo junto; reenviamos os atuais com os novos objetivos.
      await api.put('/perfil/ciclo', {
        modoCiclo: ciclo.modoCiclo,
        cicloRegular: ciclo.modoCiclo === 'CICLO_REGULAR',
        duracaoCiclo: ciclo.duracaoCiclo,
        duracaoSangramento: ciclo.duracaoSangramento,
        dataUltimaMenstruacao: String(ciclo.dataUltimaMenstruacao).slice(0, 10),
        objetivos: selected,
      });
      router.back();
    } catch (error: any) {
      Alert.alert('Erro', error?.response?.data?.error || 'Não foi possível salvar seus objetivos agora.');
    } finally {
      setSaving(false);
    }
  };

  const canSave = !!ciclo && selected.length > 0 && !saving;

  return (
    <View style={styles.screen}>
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Voltar">
          <MaterialIcons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Editar objetivos</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.primary.DEFAULT} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Quais são seus principais objetivos?</Text>
          <Text style={styles.subtitle}>Selecione todos que se aplicam a você.</Text>

          {!ciclo ? (
            <Text style={styles.subtitle}>Complete os dados do seu ciclo antes de editar os objetivos.</Text>
          ) : (
            <View style={styles.list}>
              {OBJETIVOS.map((obj) => {
                const isSelected = selected.includes(obj.id);
                return (
                  <TouchableOpacity
                    key={obj.id}
                    onPress={() => toggle(obj.id)}
                    style={[styles.pill, isSelected && styles.pillSelected]}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.pillIcon, isSelected && styles.pillIconSelected]}>
                      <MaterialIcons
                        name={obj.icon}
                        size={22}
                        color={isSelected ? Colors.accent.DEFAULT : Colors.primary.DEFAULT}
                      />
                    </View>
                    <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>{obj.title}</Text>
                    <View style={[styles.pillCheck, isSelected && styles.pillCheckSelected]}>
                      {isSelected ? <MaterialIcons name="check" size={16} color={Colors.onPrimary} /> : null}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={!canSave}
        >
          {saving ? <ActivityIndicator color={Colors.onPrimary} /> : <Text style={styles.saveText}>Salvar</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  topTitle: { fontSize: 16, fontWeight: '900', color: Colors.text },
  content: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 140 },
  title: { fontSize: 24, fontWeight: '900', color: Colors.text, marginBottom: 8 },
  subtitle: { fontSize: 14, color: Colors.textLight, marginBottom: 20 },
  list: { gap: 12 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: Colors.surface,
  },
  pillSelected: { backgroundColor: Colors.accent.light, borderColor: Colors.accent.DEFAULT },
  pillIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    backgroundColor: Colors.background,
  },
  pillIconSelected: { backgroundColor: Colors.surface },
  pillText: { flex: 1, fontSize: 15, fontWeight: '700', color: Colors.text },
  pillTextSelected: { color: Colors.accent.dark },
  pillCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  pillCheckSelected: { backgroundColor: Colors.accent.DEFAULT, borderColor: Colors.accent.DEFAULT },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  saveBtn: {
    height: 52,
    borderRadius: 999,
    backgroundColor: Colors.primary.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveText: { fontSize: 16, fontWeight: '900', color: Colors.onPrimary },
});
