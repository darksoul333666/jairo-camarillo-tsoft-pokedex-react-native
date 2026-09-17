import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

type Props = {
  message: string;
};

export function LoadingState({ message }: Props) {
  return (
    <View
      style={styles.container}
      accessibilityRole="progressbar"
      accessibilityLabel={message}
    >
      <ActivityIndicator size="large" color="#2563EB" />
      <Text style={styles.message}>{message}</Text>
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
    color: '#475467',
    textAlign: 'center',
  },
});
