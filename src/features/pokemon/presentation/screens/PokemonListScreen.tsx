import { useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
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
  useAppColors,
  type AppColors,
} from '@features/pokemon/presentation/theme';
import {
  usePokemonListViewModel,
  type PokemonListViewState,
} from '@features/pokemon/presentation/viewModels/usePokemonListViewModel';

type Props = {
  getPokemonList: GetPokemonList;
  onSelectPokemon: (pokemonId: number) => void;
};

export function PokemonListScreen({ getPokemonList, onSelectPokemon }: Props) {
  const colors = useAppColors();
  const { state, retry, refresh, loadMore } =
    usePokemonListViewModel(getPokemonList);

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
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {state.source === 'cache' ? (
        <Text
          style={[
            styles.cacheNotice,
            { color: colors.cacheText, backgroundColor: colors.cacheBg },
          ]}
          accessibilityRole="text"
        >
          Showing saved data
        </Text>
      ) : null}
      <FlatList
        data={state.data}
        extraData={state.status}
        keyExtractor={item => String(item.id)}
        renderItem={renderItem}
        ItemSeparatorComponent={ListSeparator}
        ListFooterComponent={
          <ListFooter state={state} onRetry={loadMore} colors={colors} />
        }
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={state.status === 'refreshing'}
            onRefresh={refresh}
            tintColor={colors.accent}
          />
        }
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

function ListFooter({
  state,
  onRetry,
  colors,
}: {
  state: PokemonListViewState;
  onRetry: () => void;
  colors: AppColors;
}) {
  if (state.status === 'loadingMore') {
    return (
      <View
        style={styles.footer}
        accessibilityRole="progressbar"
        accessibilityLabel="Loading more Pokémon"
      >
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (state.status === 'loadMoreError') {
    return (
      <View style={styles.footer}>
        <Text style={[styles.footerMessage, { color: colors.muted }]}>
          {state.message}
        </Text>
        <Pressable
          onPress={onRetry}
          style={({ pressed }) => [
            styles.footerButton,
            { backgroundColor: colors.accent },
            pressed && styles.pressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Retry"
        >
          <Text style={[styles.footerButtonLabel, { color: colors.onAccent }]}>
            Retry
          </Text>
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
  },
  cacheNotice: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 13,
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
    textAlign: 'center',
  },
  footerButton: {
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
  footerButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});
