import { Pressable, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppColors } from '@features/pokemon/presentation/theme';

type Props = {
  visible: boolean;
  onPress: () => void;
};

export function ScrollToTopFab({ visible, onPress }: Props) {
  const colors = useAppColors();
  const insets = useSafeAreaInsets();

  if (!visible) {
    return null;
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.fab,
        {
          backgroundColor: colors.accent,
          bottom: Math.max(insets.bottom, 16) + 8,
        },
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel="Scroll to top"
    >
      <Text
        style={[styles.icon, { color: colors.onAccent }]}
        accessible={false}
      >
        ↑
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 16,
    minWidth: 48,
    minHeight: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  pressed: {
    opacity: 0.85,
  },
  icon: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 26,
  },
});
