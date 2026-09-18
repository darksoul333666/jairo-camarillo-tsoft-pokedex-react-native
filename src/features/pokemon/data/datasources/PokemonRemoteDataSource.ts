import { AppError } from '@core/errors/AppError';
import { POKE_API_TIMEOUT_MS } from '@core/constants/app';
import {
  parsePokemonDetailDto,
  type PokemonDetailDto,
} from '@features/pokemon/data/dto/PokemonDetailDto';
import {
  parsePokemonListDto,
  type PokemonListDto,
} from '@features/pokemon/data/dto/PokemonListDto';

const POKE_API_BASE_URL = 'https://pokeapi.co/api/v2/';

export class PokemonRemoteDataSource {
  constructor(private readonly timeoutMs: number = POKE_API_TIMEOUT_MS) {}

  getPokemonList(offset: number, limit: number): Promise<PokemonListDto> {
    const params = new URLSearchParams({
      offset: String(offset),
      limit: String(limit),
    });

    return this.getJson(
      `${POKE_API_BASE_URL}pokemon?${params.toString()}`,
    ).then(parsePokemonListDto);
  }

  getPokemonDetail(id: number): Promise<PokemonDetailDto> {
    return this.getJson(`${POKE_API_BASE_URL}pokemon/${id}`).then(
      parsePokemonDetailDto,
    );
  }

  private async getJson(url: string): Promise<unknown> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    let response: Response;

    try {
      response = await fetch(url, { signal: controller.signal });
    } catch {
      throw new AppError('Network', 'Could not reach PokéAPI.');
    } finally {
      clearTimeout(timeoutId);
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
