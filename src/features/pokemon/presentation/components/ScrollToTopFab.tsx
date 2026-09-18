import { Pressable, StyleSheet, Text } from 'react-native';
import { useAppColors } from '@features/pokemon/presentation/theme';

type Props = {
  visible: boolean;
  onPress: () => void;
};

export function ScrollToTopFab({ visible, onPress }: Props) {
  const colors = useAppColors();

  if (!visible) {
    return null;
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.fab,
        { backgroundColor: colors.accent },
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel="Scroll to top"
    >
      <Text
        style={[styles.icon, { color: colors.onAccent }]}
        accessible={false}
      >
        Top
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  pressed: {
    opacity: 0.85,
  },
  icon: {
    fontSize: 14,
    fontWeight: '700',
  },
});
