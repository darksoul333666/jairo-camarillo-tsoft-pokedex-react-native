import { useCallback, useEffect, useRef, useState } from 'react';
import type { ViewState } from '@core/types/ViewState';
import type { PokemonDetail } from '@features/pokemon/domain/entities/PokemonDetail';
import type { GetPokemonDetail } from '@features/pokemon/domain/useCases/GetPokemonDetail';
import { toUserMessage } from '@features/pokemon/presentation/toUserMessage';

type LoadedDetailState = Extract<
  ViewState<PokemonDetail>,
  { status: 'success' | 'refreshing' }
>;

export function usePokemonDetailViewModel(
  pokemonId: number,
  getPokemonDetail: GetPokemonDetail,
) {
  const [state, setState] = useState<ViewState<PokemonDetail>>({
    status: 'loading',
  });
  const stateRef = useRef(state);
  const requestIdRef = useRef(0);
  const inFlightRef = useRef(false);

  stateRef.current = state;

  const load = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    inFlightRef.current = true;
    setState({ status: 'loading' });

    try {
      const result = await getPokemonDetail.execute(pokemonId);
      if (requestId !== requestIdRef.current) {
        return;
      }

      setState({
        status: 'success',
        data: result.data,
        source: result.source,
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
  }, [getPokemonDetail, pokemonId]);

  const refresh = useCallback(async () => {
    const current = stateRef.current;
    if (!isLoadedDetail(current)) {
      await load();
      return;
    }

    if (inFlightRef.current) {
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    inFlightRef.current = true;
    setState({
      status: 'refreshing',
      data: current.data,
      source: current.source,
    });

    try {
      const result = await getPokemonDetail.execute(pokemonId);
      if (requestId !== requestIdRef.current) {
        return;
      }

      setState({
        status: 'success',
        data: result.data,
        source: result.source,
      });
    } catch {
      if (requestId !== requestIdRef.current) {
        return;
      }

      setState({
        status: 'success',
        data: current.data,
        source: current.source,
      });
    } finally {
      if (requestId === requestIdRef.current) {
        inFlightRef.current = false;
      }
    }
  }, [getPokemonDetail, load, pokemonId]);

  useEffect(() => {
    load();
  }, [load]);

  return { state, retry: load, refresh };
}

function isLoadedDetail(
  state: ViewState<PokemonDetail>,
): state is LoadedDetailState {
  return state.status === 'success' || state.status === 'refreshing';
}
