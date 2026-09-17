import type { DataResult } from '@core/types/DataResult';
import type { Pokemon } from '../entities/Pokemon';
import type { PokemonDetail } from '../entities/PokemonDetail';

export interface PokemonRepository {
  getPokemonList(offset: number, limit: number): Promise<DataResult<Pokemon[]>>;
  getPokemonDetail(id: number): Promise<DataResult<PokemonDetail>>;
}
