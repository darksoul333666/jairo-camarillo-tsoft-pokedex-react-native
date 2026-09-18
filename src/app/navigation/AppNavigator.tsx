import { useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  type NativeStackScreenProps,
} from '@react-navigation/native-stack';
import type { AppDependencies } from '@app/dependencies';
import type { RootStackParamList } from '@app/navigation/routes';
import type { GetPokemonDetail } from '@features/pokemon/domain/useCases/GetPokemonDetail';
import type { GetPokemonList } from '@features/pokemon/domain/useCases/GetPokemonList';
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
            <PokemonListRoute
              {...props}
              getPokemonList={dependencies.getPokemonList}
            />
          )}
        </Stack.Screen>
        <Stack.Screen
          name="PokemonDetail"
          options={({ route }) => ({ title: `#${route.params.pokemonId}` })}
        >
          {props => (
            <PokemonDetailRoute
              {...props}
              getPokemonDetail={dependencies.getPokemonDetail}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

type ListRouteProps = NativeStackScreenProps<
  RootStackParamList,
  'PokemonList'
> & {
  getPokemonList: GetPokemonList;
};

function PokemonListRoute({ navigation, getPokemonList }: ListRouteProps) {
  const onSelectPokemon = useCallback(
    (pokemonId: number) => {
      navigation.navigate('PokemonDetail', { pokemonId });
    },
    [navigation],
  );

  return (
    <PokemonListScreen
      getPokemonList={getPokemonList}
      onSelectPokemon={onSelectPokemon}
    />
  );
}

type DetailRouteProps = NativeStackScreenProps<
  RootStackParamList,
  'PokemonDetail'
> & {
  getPokemonDetail: GetPokemonDetail;
};

function PokemonDetailRoute({ route, getPokemonDetail }: DetailRouteProps) {
  return (
    <PokemonDetailScreen
      pokemonId={route.params.pokemonId}
      getPokemonDetail={getPokemonDetail}
    />
  );
}
