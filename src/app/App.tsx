import { useMemo } from 'react';
import { StatusBar, StyleSheet, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createDependencies, type AppDependencies } from '@app/dependencies';
import { AppNavigator } from '@app/navigation/AppNavigator';

type Props = {
  dependencies?: AppDependencies;
};

function App({ dependencies }: Props) {
  const isDarkMode = useColorScheme() === 'dark';
  const deps = useMemo(
    () => dependencies ?? createDependencies(),
    [dependencies],
  );

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <AppNavigator dependencies={deps} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default App;
