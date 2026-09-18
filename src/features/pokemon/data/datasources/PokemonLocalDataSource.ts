import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppError } from '@core/errors/AppError';
import type { Pokemon } from '@features/pokemon/domain/entities/Pokemon';
import type { PokemonDetail } from '@features/pokemon/domain/entities/PokemonDetail';
import type { PokemonListPage } from '@features/pokemon/domain/entities/PokemonListPage';

export function pokemonListCacheKey(offset: number, limit: number): string {
  return `pokemon:list:${offset}:${limit}`;
}

export function pokemonDetailCacheKey(id: number): string {
  return `pokemon:detail:${id}`;
}

export class PokemonLocalDataSource {
  async getPokemonList(
    offset: number,
    limit: number,
  ): Promise<PokemonListPage | null> {
    const raw = await this.read(pokemonListCacheKey(offset, limit));
    if (raw === null) {
      return null;
    }

    try {
      const parsed: unknown = JSON.parse(raw);
      return parsePokemonListPage(parsed, limit);
    } catch {
      return null;
    }
  }

  async savePokemonList(
    offset: number,
    limit: number,
    page: PokemonListPage,
  ): Promise<void> {
    await this.write(pokemonListCacheKey(offset, limit), JSON.stringify(page));
  }

  async getPokemonDetail(id: number): Promise<PokemonDetail | null> {
    const raw = await this.read(pokemonDetailCacheKey(id));
    if (raw === null) {
      return null;
    }

    try {
      const parsed: unknown = JSON.parse(raw);
      return parsePokemonDetail(parsed);
    } catch {
      return null;
    }
  }

  async savePokemonDetail(detail: PokemonDetail): Promise<void> {
    await this.write(pokemonDetailCacheKey(detail.id), JSON.stringify(detail));
  }

  private async read(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      throw new AppError('Storage', 'Could not read Pokemon cache.');
    }
  }

  private async write(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch {
      throw new AppError('Storage', 'Could not write Pokemon cache.');
    }
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function parsePokemonListPage(value: unknown, limit: number): PokemonListPage {
  if (Array.isArray(value)) {
    const items = parsePokemonItems(value);
    return { items, hasMore: items.length >= limit };
  }

  if (
    !isRecord(value) ||
    typeof value.hasMore !== 'boolean' ||
    !Array.isArray(value.items)
  ) {
    throw new Error('invalid list page');
  }

  return {
    items: parsePokemonItems(value.items),
    hasMore: value.hasMore,
  };
}

function parsePokemonItems(value: unknown[]): Pokemon[] {
  return value.map(item => {
    if (
      !isRecord(item) ||
      typeof item.id !== 'number' ||
      typeof item.name !== 'string' ||
      typeof item.imageUrl !== 'string'
    ) {
      throw new Error('invalid item');
    }

    return {
      id: item.id,
      name: item.name,
      imageUrl: item.imageUrl,
    };
  });
}

function parsePokemonDetail(value: unknown): PokemonDetail {
  if (
    !isRecord(value) ||
    typeof value.id !== 'number' ||
    typeof value.name !== 'string' ||
    typeof value.imageUrl !== 'string' ||
    typeof value.height !== 'number' ||
    typeof value.weight !== 'number' ||
    typeof value.baseExperience !== 'number' ||
    !Array.isArray(value.types) ||
    !Array.isArray(value.abilities) ||
    !Array.isArray(value.stats)
  ) {
    throw new Error('invalid detail');
  }

  return {
    id: value.id,
    name: value.name,
    imageUrl: value.imageUrl,
    height: value.height,
    weight: value.weight,
    baseExperience: value.baseExperience,
    types: value.types.map(entry => {
      if (!isRecord(entry) || typeof entry.name !== 'string') {
        throw new Error('invalid type');
      }
      return { name: entry.name };
    }),
    abilities: value.abilities.map(entry => {
      if (
        !isRecord(entry) ||
        typeof entry.name !== 'string' ||
        typeof entry.isHidden !== 'boolean'
      ) {
        throw new Error('invalid ability');
      }
      return { name: entry.name, isHidden: entry.isHidden };
    }),
    stats: value.stats.map(entry => {
      if (
        !isRecord(entry) ||
        typeof entry.name !== 'string' ||
        typeof entry.value !== 'number'
      ) {
        throw new Error('invalid stat');
      }
      return { name: entry.name, value: entry.value };
    }),
  };
}
