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

const cadastroSchema = z.object({
  name: z.string().min(3, 'Nome muito curto'),
  email: z.string().email('E-mail inválido'),
  // Opcional: backend aceita null/ausente. Permitimos vazio e validamos somente se preenchido.
  dataNascimento: z
    .string()
    .optional()
    .refine(
      (v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v),
      'Data inválida (AAAA-MM-DD)'
    ),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type CadastroFormData = z.infer<typeof cadastroSchema>;

export default function CadastroScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<CadastroFormData>({
    resolver: zodResolver(cadastroSchema),
    defaultValues: {
      dataNascimento: '',
    },
  });

  const onSubmit = async (data: CadastroFormData) => {
    setIsLoading(true);
    try {
      const payload: Record<string, any> = {
        nome: data.name,
        email: data.email,
        senha: data.password,
      };

      if (data.dataNascimento?.trim()) {
        payload.dataNascimento = data.dataNascimento.trim();
      }

      await api.post('/auth/register', payload);
      
      Alert.alert('Sucesso', 'Conta criada com sucesso! Faça login para continuar.', [
        { text: 'OK', onPress: () => router.replace('/(auth)/login') }
      ]);
    } catch (error: any) {
      // More diagnostics for device APK debugging
      // eslint-disable-next-line no-console
      console.error('[CADASTRO] erro', {
        message: error?.message,
        code: error?.code,
        status: error?.response?.status,
        data: error?.response?.data,
        baseURL: error?.config?.baseURL,
        url: error?.config?.url,
      });

      Alert.alert(
        'Erro ao cadastrar',
        error.response?.data?.message || 'Tente novamente mais tarde.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
      {/* Navbar simple */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#111813" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Cadastro</Text>
      </View>

      <View style={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.title}>Criar conta</Text>
          <Text style={styles.subtitle}>
            Preencha os dados abaixo para começar seu acompanhamento personalizado.
          </Text>
        </View>

        <View style={styles.form}>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Nome completo"
                placeholder="Seu nome"
                value={value}
                onChangeText={onChange}
                error={errors.name?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <Input
                label="E-mail"
                placeholder="exemplo@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={value}
                onChangeText={onChange}
                error={errors.email?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="dataNascimento"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Data de Nascimento (opcional)"
                placeholder="AAAA-MM-DD (ex: 1995-05-20)"
                value={value}
                onChangeText={onChange}
                error={errors.dataNascimento?.message}
                keyboardType="numeric"
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <View style={styles.passwordWrap}>
                <Input
                  label="Senha"
                  placeholder="Mínimo 8 caracteres"
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

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Confirmar senha"
                  placeholder="Repita sua senha"
                  secureTextEntry={!showPassword}
                  value={value}
                  onChangeText={onChange}
                  error={errors.confirmPassword?.message}
                />
              )}
            />
        </View>

        <Button title="Cadastrar" onPress={handleSubmit(onSubmit)} isLoading={isLoading} style={styles.submit} />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Já possui uma conta?</Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Fazer login</Text>
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
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(246, 248, 246, 0.92)',
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  navTitle: {
    flex: 1,
    textAlign: 'center',
    paddingRight: 48,
    fontSize: 18,
    fontWeight: '800',
    color: '#111813',
  },
  screen: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  header: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#111813',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 12,
    color: '#61896f',
    textAlign: 'center',
  },
  form: {
    paddingTop: 24,
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
  submit: {
    marginTop: 8,
    backgroundColor: '#13ec5b',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 32,
  },
  footerText: {
    color: '#61896f',
  },
  footerLink: {
    fontWeight: '800',
    color: '#13ec5b',
  },
});
