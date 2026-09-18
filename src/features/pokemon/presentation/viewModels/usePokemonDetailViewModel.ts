import { useCallback, useEffect, useRef, useState } from 'react';
import type { ViewState } from '@core/types/ViewState';
import type { PokemonDetail } from '@features/pokemon/domain/entities/PokemonDetail';
import type { GetPokemonDetail } from '@features/pokemon/domain/useCases/GetPokemonDetail';
import { toUserMessage } from '@features/pokemon/presentation/toUserMessage';

export function usePokemonDetailViewModel(
  pokemonId: number,
  getPokemonDetail: GetPokemonDetail,
) {
  const [state, setState] = useState<ViewState<PokemonDetail>>({
    status: 'loading',
  });
  const requestIdRef = useRef(0);

  const load = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
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
    }
  }, [getPokemonDetail, pokemonId]);

  useEffect(() => {
    load();
  }, [load]);

  return { state, retry: load };
}
