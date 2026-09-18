import { useCallback } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  type ListRenderItem,
} from 'react-native';
import type { Pokemon } from '@features/pokemon/domain/entities/Pokemon';
import type { GetPokemonList } from '@features/pokemon/domain/useCases/GetPokemonList';
import { FeedbackState } from '@features/pokemon/presentation/components/FeedbackState';
import { LoadingState } from '@features/pokemon/presentation/components/LoadingState';
import { PokemonCard } from '@features/pokemon/presentation/components/PokemonCard';
import { usePokemonListViewModel } from '@features/pokemon/presentation/viewModels/usePokemonListViewModel';

type Props = {
  getPokemonList: GetPokemonList;
  onSelectPokemon: (pokemonId: number) => void;
};

export function PokemonListScreen({ getPokemonList, onSelectPokemon }: Props) {
  const { state, retry } = usePokemonListViewModel(getPokemonList);

  const renderItem = useCallback<ListRenderItem<Pokemon>>(
    ({ item }) => <PokemonCard pokemon={item} onPress={onSelectPokemon} />,
    [onSelectPokemon],
  );

  if (state.status === 'idle' || state.status === 'loading') {
    return <LoadingState message="Loading Pokémon" />;
  }

  if (state.status === 'error') {
    return (
      <FeedbackState
        title="Could not load Pokémon"
        message={state.message}
        onRetry={retry}
      />
    );
  }

  if (state.status === 'empty') {
    return (
      <FeedbackState
        title="Nothing here yet"
        message="No Pokémon found."
        onRetry={retry}
      />
    );
  }

  return (
    <View style={styles.screen}>
      {state.source === 'cache' ? (
        <Text style={styles.cacheNotice} accessibilityRole="text">
          Showing saved data
        </Text>
      ) : null}
      <FlatList
        data={state.data}
        keyExtractor={item => String(item.id)}
        renderItem={renderItem}
        ItemSeparatorComponent={ListSeparator}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

function ListSeparator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F2F4F7',
  },
  cacheNotice: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 13,
    color: '#B54708',
    backgroundColor: '#FEF0C7',
  },
  list: {
    padding: 16,
  },
  separator: {
    height: 8,
  },
});
