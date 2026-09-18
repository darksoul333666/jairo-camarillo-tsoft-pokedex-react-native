import { useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
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
import {
  usePokemonListViewModel,
  type PokemonListViewState,
} from '@features/pokemon/presentation/viewModels/usePokemonListViewModel';

type Props = {
  getPokemonList: GetPokemonList;
  onSelectPokemon: (pokemonId: number) => void;
};

export function PokemonListScreen({ getPokemonList, onSelectPokemon }: Props) {
  const { state, retry, loadMore } = usePokemonListViewModel(getPokemonList);

  const renderItem = useCallback<ListRenderItem<Pokemon>>(
    ({ item }) => <PokemonCard pokemon={item} onPress={onSelectPokemon} />,
    [onSelectPokemon],
  );

  const handleEndReached = useCallback(() => {
    loadMore();
  }, [loadMore]);

  if (state.status === 'loading') {
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
        extraData={state.status}
        keyExtractor={item => String(item.id)}
        renderItem={renderItem}
        ItemSeparatorComponent={ListSeparator}
        ListFooterComponent={<ListFooter state={state} onRetry={loadMore} />}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.4}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

function ListFooter({
  state,
  onRetry,
}: {
  state: PokemonListViewState;
  onRetry: () => void;
}) {
  if (state.status === 'loadingMore') {
    return (
      <View
        style={styles.footer}
        accessibilityRole="progressbar"
        accessibilityLabel="Loading more Pokémon"
      >
        <ActivityIndicator color="#2563EB" />
      </View>
    );
  }

  if (state.status === 'loadMoreError') {
    return (
      <View style={styles.footer}>
        <Text style={styles.footerMessage}>{state.message}</Text>
        <Pressable
          onPress={onRetry}
          style={({ pressed }) => [
            styles.footerButton,
            pressed && styles.pressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Retry"
        >
          <Text style={styles.footerButtonLabel}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return <View style={styles.footerSpacer} />;
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
  footer: {
    paddingVertical: 16,
    alignItems: 'center',
    gap: 8,
  },
  footerSpacer: {
    height: 8,
  },
  footerMessage: {
    fontSize: 14,
    color: '#475467',
    textAlign: 'center',
  },
  footerButton: {
    minHeight: 44,
    minWidth: 120,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
  footerButtonLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
