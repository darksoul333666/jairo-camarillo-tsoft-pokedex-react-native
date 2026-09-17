import type { DataResult } from '@core/types/DataResult';
import type { Pokemon } from '../entities/Pokemon';
import type { PokemonRepository } from '../repositories/PokemonRepository';

export class GetPokemonList {
  constructor(private readonly pokemonRepository: PokemonRepository) {}

  execute(offset: number, limit: number): Promise<DataResult<Pokemon[]>> {
    return this.pokemonRepository.getPokemonList(offset, limit);
  }
}
