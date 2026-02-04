import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import * as Updates from 'expo-updates';

type Props = {
  children: React.ReactNode;
};

type State = {
  error: Error | null;
};

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Ensure the error is visible in Metro / device logs when available.
    console.error('💥 Unhandled error (ErrorBoundary):', error);
    console.error('💥 Component stack:', info?.componentStack);
  }

  private handleReload = async () => {
    try {
      await Updates.reloadAsync();
    } catch (e) {
      console.error('Failed to reload via expo-updates:', e);
      // fallback: clear boundary state so user can try again
      this.setState({ error: null });
    }
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 20 }}>
        <Text className="text-2xl font-bold text-red-600">O app encontrou um erro</Text>
        <Text className="mt-2 text-sm text-gray-700">
          Se você estiver no Expo Go e a tela ficou branca, aqui está o erro capturado pelo ErrorBoundary.
        </Text>

        <View className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
          <Text className="font-semibold text-red-700">{String(this.state.error.message || this.state.error)}</Text>
        </View>

        {this.state.error.stack ? (
          <View className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <Text className="text-xs text-gray-700">{this.state.error.stack}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          onPress={this.handleReload}
          className="mt-6 rounded-xl bg-black px-4 py-3"
        >
          <Text className="text-center text-white font-semibold">Recarregar</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }
}
