import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppColors } from '@features/pokemon/presentation/theme';

type Props = {
  title: string;
  message: string;
  onRetry: () => void;
};

export function FeedbackState({ title, message, onRetry }: Props) {
  const colors = useAppColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text
        style={[styles.title, { color: colors.text }]}
        accessibilityRole="header"
      >
        {title}
      </Text>
      <Text style={[styles.message, { color: colors.muted }]}>{message}</Text>
      <Pressable
        onPress={onRetry}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: colors.accent },
          pressed && styles.pressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Retry"
        accessibilityHint="Loads Pokémon again"
      >
        <Text
          style={[styles.buttonLabel, { color: colors.onAccent }]}
          accessible={false}
        >
          Retry
        </Text>
      </Pressable>
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
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
  },
  button: {
    minHeight: 44,
    minWidth: 120,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});
