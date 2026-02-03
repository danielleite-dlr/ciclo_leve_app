import { View, Text, TextInput, TextInputProps } from 'react-native';
import { Colors } from '@/constants/Colors';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
}

export function Input({ label, error, ...props }: InputProps) {
  return (
    <View className="mb-4">
      <Text className="text-gray-700 font-semibold mb-2">{label}</Text>
      <TextInput
        placeholderTextColor="#9CA3AF"
        className={`w-full bg-gray-50 border px-4 py-3 rounded-xl text-gray-900 ${
          error ? 'border-red-500' : 'border-gray-200 focus:border-primary'
        }`}
        {...props}
      />
      {error && (
        <Text className="text-red-500 text-sm mt-1">{error}</Text>
      )}
    </View>
  );
}
