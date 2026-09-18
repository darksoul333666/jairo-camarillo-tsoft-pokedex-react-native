import type { DataResult } from '@core/types/DataResult';
import type { PokemonListPage } from '../entities/PokemonListPage';
import type { PokemonRepository } from '../repositories/PokemonRepository';

export class GetPokemonList {
  constructor(private readonly pokemonRepository: PokemonRepository) {}

  execute(offset: number, limit: number): Promise<DataResult<PokemonListPage>> {
    return this.pokemonRepository.getPokemonList(offset, limit);
  }
}
