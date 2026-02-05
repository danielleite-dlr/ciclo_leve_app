import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import api from '@/services/api';
import { setToken } from '@/services/storage';

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      // Backend usa `senha` (PT-BR). Mantemos `password` no form e adaptamos no payload.
      const response = await api.post('/auth/login', {
        email: data.email,
        senha: data.password,
      });
      await setToken(response.data.token);
      router.replace('/(app)/home');
    } catch (error: any) {
      console.error(error);
      Alert.alert(
        'Erro ao entrar',
        error.response?.data?.message || 'Verifique suas credenciais e tente novamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
      <View style={styles.screen}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconWrap}>
            <MaterialIcons name="female" size={40} color="#13ec5b" />
          </View>
          <Text style={styles.title}>Entrar</Text>
          <Text style={styles.subtitle}>Acesse sua conta para acompanhar seu ciclo e gerenciar sua saúde.</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <Input
                label="E-mail" // Input component modified to accept label or we can adjust Input component
                placeholder="Digite seu e-mail"
                keyboardType="email-address"
                autoCapitalize="none"
                value={value}
                onChangeText={onChange}
                error={errors.email?.message}
              />
            )}
          />

          <View>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <View style={styles.passwordWrap}>
                  <Input
                    label="Senha"
                    placeholder="Digite sua senha"
                    secureTextEntry={!showPassword}
                    value={value}
                    onChangeText={onChange}
                    error={errors.password?.message}
                  />

                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                    <MaterialIcons name={showPassword ? 'visibility' : 'visibility-off'} size={22} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
              )}
            />
            <View style={styles.forgotRow}>
              <Link href="/(auth)/recuperar-senha" asChild>
                <TouchableOpacity>
                  <Text style={styles.forgotText}>Esqueci minha senha</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>

          <Button title="Entrar" onPress={handleSubmit(onSubmit)} isLoading={isLoading} style={styles.submit} />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Não tem uma conta?</Text>
          <Link href="/(auth)/cadastro" asChild>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Cadastre-se</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#F6F8F6',
  },
  screen: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: 'rgba(19, 236, 91, 0.20)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#111813',
    marginBottom: 8,
  },
  subtitle: {
    color: '#6B7280',
    textAlign: 'center',
    maxWidth: 320,
  },
  form: {
    width: '100%',
    gap: 20,
  },
  passwordWrap: {
    position: 'relative',
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 44,
    padding: 6,
  },
  forgotRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  submit: {
    marginTop: 12,
    backgroundColor: '#13ec5b',
  },
  footer: {
    marginTop: 'auto',
    paddingVertical: 40,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  footerText: {
    color: '#4B5563',
    fontSize: 14,
  },
  footerLink: {
    fontWeight: '800',
    color: '#111813',
    fontSize: 14,
  },
});
