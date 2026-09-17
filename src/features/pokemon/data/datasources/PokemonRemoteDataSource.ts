import { AppError } from '@core/errors/AppError';
import {
  parsePokemonDetailDto,
  type PokemonDetailDto,
} from '../dto/PokemonDetailDto';
import {
  parsePokemonListDto,
  type PokemonListDto,
} from '../dto/PokemonListDto';

const POKE_API_BASE_URL = 'https://pokeapi.co/api/v2';

export class PokemonRemoteDataSource {
  getPokemonList(offset: number, limit: number): Promise<PokemonListDto> {
    const params = new URLSearchParams({
      offset: String(offset),
      limit: String(limit),
    });

    return this.getJson(
      `${POKE_API_BASE_URL}/pokemon?${params.toString()}`,
    ).then(parsePokemonListDto);
  }

  getPokemonDetail(id: number): Promise<PokemonDetailDto> {
    return this.getJson(`${POKE_API_BASE_URL}/pokemon/${id}`).then(
      parsePokemonDetailDto,
    );
  }

  private async getJson(url: string): Promise<unknown> {
    let response: Response;

    try {
      response = await fetch(url);
    } catch {
      throw new AppError('Network', 'Could not reach PokéAPI.');
    }

    if (!response.ok) {
      throw new AppError(
        'Server',
        `PokéAPI responded with ${response.status}.`,
      );
    }

    try {
      return await response.json();
    } catch {
      throw new AppError('InvalidData', 'PokéAPI returned invalid JSON.');
    }
  }
}
