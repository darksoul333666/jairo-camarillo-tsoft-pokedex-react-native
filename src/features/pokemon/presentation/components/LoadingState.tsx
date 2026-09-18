import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useAppColors } from '@features/pokemon/presentation/theme';

type Props = {
  message: string;
};

export function LoadingState({ message }: Props) {
  const colors = useAppColors();

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background }]}
      accessibilityRole="progressbar"
      accessibilityLabel={message}
    >
      <ActivityIndicator size="large" color={colors.accent} />
      <Text style={[styles.message, { color: colors.muted }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
  },
});
