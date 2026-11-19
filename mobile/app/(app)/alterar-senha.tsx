import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import api from '@/services/api';
import { Colors } from '@/constants/Colors';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Input } from '@/components/ui/Input';

export default function AlterarSenha() {
  const router = useRouter();
  const [atual, setAtual] = useState('');
  const [nova, setNova] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [salvando, setSalvando] = useState(false);

  const erroNova = nova && nova.length < 6 ? 'Mínimo de 6 caracteres' : undefined;
  const erroConfirmacao = confirmacao && confirmacao !== nova ? 'As senhas não conferem' : undefined;
  const valido = !!atual && nova.length >= 6 && nova === confirmacao;

  const salvar = async () => {
    setSalvando(true);
    try {
      await api.put('/perfil/senha', { senhaAtual: atual, novaSenha: nova });
      setAtual('');
      setNova('');
      setConfirmacao('');
      Alert.alert('Senha alterada', 'Use a nova senha no próximo login.');
      router.back();
    } catch (error: any) {
      Alert.alert('Não foi possível alterar', error?.response?.data?.error || 'Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Alterar senha" />
      <KeyboardAvoidingView style={styles.flex1} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Input label="Senha atual" value={atual} onChangeText={setAtual} secureTextEntry autoCapitalize="none" />
          <Input label="Nova senha" value={nova} onChangeText={setNova} secureTextEntry autoCapitalize="none" error={erroNova} />
          <Input
            label="Confirme a nova senha"
            value={confirmacao}
            onChangeText={setConfirmacao}
            secureTextEntry
            autoCapitalize="none"
            error={erroConfirmacao}
          />
          <TouchableOpacity
            style={[styles.save, (!valido || salvando) && { opacity: 0.5 }]}
            onPress={salvar}
            disabled={!valido || salvando}
            activeOpacity={0.85}
          >
            {salvando ? <ActivityIndicator color={Colors.onPrimary} /> : <Text style={styles.saveText}>Alterar senha</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  flex1: { flex: 1 },
  content: { padding: 16, paddingBottom: 120 },
  save: { marginTop: 8, backgroundColor: Colors.primary.DEFAULT, borderRadius: 999, paddingVertical: 16, alignItems: 'center' },
  saveText: { color: Colors.onPrimary, fontSize: 17, fontWeight: '900' },
});
