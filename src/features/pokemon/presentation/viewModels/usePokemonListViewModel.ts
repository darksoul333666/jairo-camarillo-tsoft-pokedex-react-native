import { useCallback, useEffect, useRef, useState } from 'react';
import { POKEMON_PAGE_SIZE } from '@core/constants/app';
import type { ViewState } from '@core/types/ViewState';
import type { Pokemon } from '@features/pokemon/domain/entities/Pokemon';
import type { GetPokemonList } from '@features/pokemon/domain/useCases/GetPokemonList';
import { toUserMessage } from '@features/pokemon/presentation/toUserMessage';

export function usePokemonListViewModel(getPokemonList: GetPokemonList) {
  const [state, setState] = useState<ViewState<Pokemon[]>>({
    status: 'loading',
  });
  const requestIdRef = useRef(0);

  const load = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setState({ status: 'loading' });

    try {
      const result = await getPokemonList.execute(0, POKEMON_PAGE_SIZE);
      if (requestId !== requestIdRef.current) {
        return;
      }

      if (result.data.length === 0) {
        setState({ status: 'empty' });
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
    }
  }, [getPokemonList]);

  useEffect(() => {
    load();
  }, [load]);

  return { state, retry: load };
}
