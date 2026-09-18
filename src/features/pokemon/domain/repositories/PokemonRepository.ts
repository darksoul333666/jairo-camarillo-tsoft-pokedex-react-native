import type { DataResult } from '@core/types/DataResult';
import type { PokemonDetail } from '../entities/PokemonDetail';
import type { PokemonListPage } from '../entities/PokemonListPage';

export interface PokemonRepository {
  getPokemonList(
    offset: number,
    limit: number,
  ): Promise<DataResult<PokemonListPage>>;
  getPokemonDetail(id: number): Promise<DataResult<PokemonDetail>>;
}
