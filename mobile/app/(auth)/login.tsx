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
      const response = await api.post('/auth/login', data);
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
    <ScrollView 
      contentContainerStyle={{ flexGrow: 1 }} 
      className="bg-[#f6f8f6] dark:bg-[#102216]"
      keyboardShouldPersistTaps="handled"
    >
      <View className="flex-1 px-6 pt-12">
        {/* Header */}
        <View className="items-center mb-8">
          <View className="size-20 rounded-3xl bg-[#13ec5b]/20 items-center justify-center mb-6">
            <MaterialIcons name="female" size={40} color="#13ec5b" />
          </View>
          <Text className="text-[#111813] dark:text-white text-3xl font-bold mb-2">Entrar</Text>
          <Text className="text-gray-500 dark:text-gray-400 text-center max-w-xs">
            Acesse sua conta para acompanhar seu ciclo e gerenciar sua saúde.
          </Text>
        </View>

        {/* Form */}
        <View className="w-full gap-5">
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
                <View className="relative">
                   <Input
                    label="Senha"
                    placeholder="Digite sua senha"
                    secureTextEntry={!showPassword}
                    value={value}
                    onChangeText={onChange}
                    error={errors.password?.message}
                  />
                  {/* Eye Icon Override/Overlay - A bit hacky with current Input component, but works */}
                  <TouchableOpacity 
                    onPress={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-[42px]" // Adjusted position based on Input style
                  >
                    <MaterialIcons 
                      name={showPassword ? "visibility" : "visibility-off"} 
                      size={22} 
                      color="#9CA3AF" 
                    />
                  </TouchableOpacity>
                </View>
              )}
            />
            <View className="flex-row justify-end mt-1">
              <Link href="/(auth)/recuperar-senha" asChild>
                <TouchableOpacity>
                  <Text className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Esqueci minha senha
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>

          <Button 
            title="Entrar"
            onPress={handleSubmit(onSubmit)}
            isLoading={isLoading}
            className="mt-4 bg-[#13ec5b]"
          />
        </View>

        {/* Footer */}
        <View className="mt-auto py-10 flex-row justify-center gap-1">
          <Text className="text-gray-600 dark:text-gray-400 text-sm">
            Não tem uma conta?
          </Text>
          <Link href="/(auth)/cadastro" asChild>
            <TouchableOpacity>
              <Text className="font-bold text-[#111813] dark:text-white text-sm">
                Cadastre-se
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}
