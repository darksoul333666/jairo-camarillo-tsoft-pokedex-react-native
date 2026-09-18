import { useCallback, useEffect, useRef, useState } from 'react';
import { POKEMON_PAGE_SIZE } from '@core/constants/app';
import type { DataSourceOrigin } from '@core/types/DataResult';
import type { Pokemon } from '@features/pokemon/domain/entities/Pokemon';
import type { GetPokemonList } from '@features/pokemon/domain/useCases/GetPokemonList';
import { toUserMessage } from '@features/pokemon/presentation/toUserMessage';

export type PokemonListViewState =
  | { status: 'loading' }
  | { status: 'empty' }
  | { status: 'error'; message: string }
  | {
      status: 'success' | 'loadingMore';
      data: Pokemon[];
      source: DataSourceOrigin;
      hasMore: boolean;
    }
  | {
      status: 'loadMoreError';
      data: Pokemon[];
      source: DataSourceOrigin;
      hasMore: true;
      message: string;
    };

type LoadedListState = Extract<
  PokemonListViewState,
  { status: 'success' | 'loadingMore' | 'loadMoreError' }
>;

export function usePokemonListViewModel(getPokemonList: GetPokemonList) {
  const [state, setState] = useState<PokemonListViewState>({
    status: 'loading',
  });
  const stateRef = useRef(state);
  const requestIdRef = useRef(0);
  const offsetRef = useRef(0);
  const inFlightRef = useRef(false);

  stateRef.current = state;

  const load = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    offsetRef.current = 0;
    inFlightRef.current = true;
    setState({ status: 'loading' });

    try {
      const result = await getPokemonList.execute(0, POKEMON_PAGE_SIZE);
      if (requestId !== requestIdRef.current) {
        return;
      }

      if (result.data.items.length === 0) {
        setState({ status: 'empty' });
        return;
      }

      offsetRef.current = POKEMON_PAGE_SIZE;
      setState({
        status: 'success',
        data: result.data.items,
        source: result.source,
        hasMore: result.data.hasMore,
      });
    } catch (error) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      setState({ status: 'error', message: toUserMessage(error) });
    } finally {
      if (requestId === requestIdRef.current) {
        inFlightRef.current = false;
      }
    }
  }, [getPokemonList]);

  const loadMore = useCallback(async () => {
    const current = stateRef.current;
    if (!canLoadMore(current) || inFlightRef.current) {
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    inFlightRef.current = true;
    setState({
      status: 'loadingMore',
      data: current.data,
      source: current.source,
      hasMore: true,
    });

    try {
      const result = await getPokemonList.execute(
        offsetRef.current,
        POKEMON_PAGE_SIZE,
      );
      if (requestId !== requestIdRef.current) {
        return;
      }

      offsetRef.current += POKEMON_PAGE_SIZE;
      setState({
        status: 'success',
        data: mergeUniquePokemon(current.data, result.data.items),
        source: mergeSource(current.source, result.source),
        hasMore: result.data.hasMore,
      });
    } catch (error) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      setState({
        status: 'loadMoreError',
        data: current.data,
        source: current.source,
        hasMore: true,
        message: toUserMessage(error),
      });
    } finally {
      if (requestId === requestIdRef.current) {
        inFlightRef.current = false;
      }
    }
  }, [getPokemonList]);

  useEffect(() => {
    load();
  }, [load]);

  return { state, retry: load, loadMore };
}

function canLoadMore(state: PokemonListViewState): state is LoadedListState {
  return (
    (state.status === 'success' && state.hasMore) ||
    state.status === 'loadMoreError'
  );
}

function mergeUniquePokemon(
  current: Pokemon[],
  incoming: Pokemon[],
): Pokemon[] {
  const seen = new Set(current.map(item => item.id));
  const merged = [...current];

  incoming.forEach(item => {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      merged.push(item);
    }
  });

  return merged;
}

function mergeSource(
  current: DataSourceOrigin,
  incoming: DataSourceOrigin,
): DataSourceOrigin {
  return current === 'cache' || incoming === 'cache' ? 'cache' : 'network';
}
