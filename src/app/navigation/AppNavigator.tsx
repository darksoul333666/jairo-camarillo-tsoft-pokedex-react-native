import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { AppDependencies } from '@app/dependencies';
import type { RootStackParamList } from '@app/navigation/routes';
import { PokemonDetailScreen } from '@features/pokemon/presentation/screens/PokemonDetailScreen';
import { PokemonListScreen } from '@features/pokemon/presentation/screens/PokemonListScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

type Props = {
  dependencies: AppDependencies;
};

export function AppNavigator({ dependencies }: Props) {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="PokemonList" options={{ title: 'Pokédex' }}>
          {props => (
            <PokemonListScreen
              getPokemonList={dependencies.getPokemonList}
              onSelectPokemon={pokemonId =>
                props.navigation.navigate('PokemonDetail', { pokemonId })
              }
            />
          )}
        </Stack.Screen>
        <Stack.Screen
          name="PokemonDetail"
          options={({ route }) => ({ title: `#${route.params.pokemonId}` })}
        >
          {props => (
            <PokemonDetailScreen
              pokemonId={props.route.params.pokemonId}
              getPokemonDetail={dependencies.getPokemonDetail}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
