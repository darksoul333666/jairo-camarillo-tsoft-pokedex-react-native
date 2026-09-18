import { Pressable, StyleSheet, View } from 'react-native';
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
    <View
      pointerEvents="box-none"
      style={[styles.layer, { bottom: Math.max(insets.bottom, 12) + 8 }]}
    >
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
        <View
          accessible={false}
          style={[styles.chevron, { borderColor: colors.onAccent }]}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20,
    elevation: 20,
  },
  fab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000000',
    shadowOpacity: 0.22,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  pressed: {
    opacity: 0.85,
  },
  chevron: {
    width: 12,
    height: 12,
    marginTop: 3,
    borderTopWidth: 2.5,
    borderLeftWidth: 2.5,
    transform: [{ rotate: '45deg' }],
  },
});
