import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter, Link } from 'expo-router';
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
  password: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres'),
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
  });

  const onSubmit = async (data: CadastroFormData) => {
    setIsLoading(true);
    try {
      await api.post('/auth/register', {
        email: data.email,
        password: data.password,
        name: data.name
      });
      
      Alert.alert('Sucesso', 'Conta criada com sucesso! Faça login para continuar.', [
        { text: 'OK', onPress: () => router.replace('/(auth)/login') }
      ]);
    } catch (error: any) {
      console.error(error);
      Alert.alert(
        'Erro ao cadastrar',
        error.response?.data?.message || 'Tente novamente mais tarde.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView 
      contentContainerStyle={{ flexGrow: 1 }} 
      className="bg-[#f6f8f6] dark:bg-[#102216]"
      keyboardShouldPersistTaps="handled"
    >
      {/* Navbar simple */}
      <View className="flex-row items-center p-4 sticky top-0 z-10 bg-[#f6f8f6]/90 dark:bg-[#102216]/90">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="size-12 items-center justify-center rounded-full bg-white/50"
        >
          <MaterialIcons name="arrow-back" size={24} color="#111813" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-bold pr-12 text-[#111813] dark:text-white">
          Cadastro
        </Text>
      </View>

      <View className="flex-1 px-6 pb-8">
        <View className="py-4">
          <Text className="text-[#111813] dark:text-white text-3xl font-bold text-center">Criar conta</Text>
          <Text className="text-[#61896f] dark:text-[#a1b8aa] text-center mt-3">
            Preencha os dados abaixo para começar seu acompanhamento personalizado.
          </Text>
        </View>

        <View className="gap-5 py-6">
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
              name="password"
              render={({ field: { onChange, value } }) => (
                <View className="relative">
                   <Input
                    label="Senha"
                    placeholder="Mínimo 8 caracteres"
                    secureTextEntry={!showPassword}
                    value={value}
                    onChangeText={onChange}
                    error={errors.password?.message}
                  />
                  <TouchableOpacity 
                    onPress={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-[42px]"
                  >
                    <MaterialIcons 
                      name={showPassword ? "visibility" : "visibility"} 
                      size={22} 
                      color="#9CA3AF" 
                    />
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

        <Button 
          title="Cadastrar" 
          onPress={handleSubmit(onSubmit)}
          isLoading={isLoading}
          className="bg-[#13ec5b]"
        />

        <View className="flex-row justify-center gap-2 mt-8">
          <Text className="text-[#61896f] dark:text-[#a1b8aa]">Já possui uma conta?</Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text className="font-bold text-[#13ec5b]">Fazer login</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}
