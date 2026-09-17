import type { DataResult } from '@core/types/DataResult';
import type { PokemonDetail } from '../entities/PokemonDetail';
import type { PokemonRepository } from '../repositories/PokemonRepository';

export class GetPokemonDetail {
  constructor(private readonly pokemonRepository: PokemonRepository) {}

  execute(id: number): Promise<DataResult<PokemonDetail>> {
    return this.pokemonRepository.getPokemonDetail(id);
  }
}
