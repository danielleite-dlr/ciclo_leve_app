import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import api from '@/services/api';
import { removeToken } from '@/services/storage';
import { limparLembrete } from '@/services/lembrete';
import { limparBloqueio } from '@/services/bloqueio';
import { Colors } from '@/constants/Colors';
import { ScreenHeader } from '@/components/ScreenHeader';

// Exclusao definitiva da conta (LGPD e exigencia da App Store para apps com cadastro).
export default function ExcluirConta() {
  const router = useRouter();
  const [senha, setSenha] = useState('');
  const [excluindo, setExcluindo] = useState(false);

  const excluir = () => {
    Alert.alert('Excluir conta definitivamente?', 'Todos os seus dados serão apagados. Isso não pode ser desfeito.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          setExcluindo(true);
          try {
            await api.delete('/perfil', { data: { senha } });
            await removeToken();
            await limparLembrete();
            await limparBloqueio();
            setSenha('');
            router.replace('/(auth)/login');
            Alert.alert('Conta excluída', 'Seus dados foram apagados.');
          } catch (error: any) {
            Alert.alert('Não foi possível excluir', error?.response?.data?.error || 'Tente novamente.');
          } finally {
            setExcluindo(false);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Excluir conta" />
      <KeyboardAvoidingView style={styles.flex1} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.iconWrap}>
            <MaterialIcons name="delete-outline" size={32} color={Colors.error} />
          </View>
          <Text style={styles.title}>Tem certeza?</Text>
          <Text style={styles.text}>Ao excluir sua conta, apagamos de forma definitiva:</Text>
          {[
            'Seus dados pessoais e de acesso',
            'Dados do ciclo, menstruações e objetivos',
            'Registros diários de sintomas',
            'Registros de relação e testes',
          ].map((item) => (
            <Text key={item} style={styles.bullet}>
              • {item}
            </Text>
          ))}
          <Text style={[styles.text, { marginTop: 12 }]}>Essa ação não pode ser desfeita.</Text>

          <Text style={styles.label}>Digite sua senha para confirmar</Text>
          <TextInput
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
            autoCapitalize="none"
            placeholder="Sua senha"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
          />

          <TouchableOpacity
            style={[styles.danger, (!senha || excluindo) && styles.disabled]}
            onPress={excluir}
            disabled={!senha || excluindo}
            activeOpacity={0.85}
          >
            {excluindo ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.dangerText}>Excluir minha conta</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()} style={styles.cancel}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  flex1: { flex: 1 },
  content: { padding: 24, paddingBottom: 120 },
  iconWrap: {
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 24, fontWeight: '900', color: Colors.text, textAlign: 'center', marginBottom: 12 },
  text: { fontSize: 15, color: Colors.text, lineHeight: 22 },
  bullet: { fontSize: 15, color: Colors.text, opacity: 0.85, lineHeight: 24, marginLeft: 4 },
  label: { marginTop: 24, marginBottom: 8, fontSize: 14, fontWeight: '700', color: Colors.text },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.text,
  },
  danger: { marginTop: 20, backgroundColor: Colors.error, borderRadius: 999, paddingVertical: 16, alignItems: 'center' },
  disabled: { opacity: 0.5 },
  dangerText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
  cancel: { alignItems: 'center', paddingVertical: 14 },
  cancelText: { color: Colors.textLight, fontWeight: '700' },
});
