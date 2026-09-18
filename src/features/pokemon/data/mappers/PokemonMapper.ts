import { AppError } from '@core/errors/AppError';
import type { Pokemon } from '@features/pokemon/domain/entities/Pokemon';
import type { PokemonDetail } from '@features/pokemon/domain/entities/PokemonDetail';
import type { PokemonDetailDto } from '@features/pokemon/data/dto/PokemonDetailDto';
import type { PokemonListItemDto } from '@features/pokemon/data/dto/PokemonListDto';

const OFFICIAL_ARTWORK_BASE_URL =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork';

export function extractPokemonId(resourceUrl: string): number {
  if (resourceUrl.trim() === '') {
    throw new AppError('InvalidData', 'Pokemon resource URL is missing.');
  }

  let pathname: string;
  try {
    pathname = new URL(resourceUrl).pathname;
  } catch {
    throw new AppError('InvalidData', 'Pokemon resource URL is invalid.');
  }

  const match = pathname.match(/\/pokemon\/(\d+)\/?$/);
  const rawId = match?.[1];

  if (rawId === undefined) {
    throw new AppError(
      'InvalidData',
      'Pokemon resource URL has no numeric id.',
    );
  }

  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(
      'InvalidData',
      'Pokemon resource URL has no numeric id.',
    );
  }

  return id;
}

export function officialArtworkUrl(id: number): string {
  return `${OFFICIAL_ARTWORK_BASE_URL}/${id}.png`;
}

export const PokemonMapper = {
  toListItem(dto: PokemonListItemDto): Pokemon {
    const id = extractPokemonId(dto.url);

    return {
      id,
      name: dto.name,
      imageUrl: officialArtworkUrl(id),
    };
  },

  toList(items: PokemonListItemDto[]): Pokemon[] {
    return items.map(item => PokemonMapper.toListItem(item));
  },

  toDetail(dto: PokemonDetailDto): PokemonDetail {
    return {
      id: dto.id,
      name: dto.name,
      imageUrl: officialArtworkUrl(dto.id),
      height: dto.height,
      weight: dto.weight,
      baseExperience: dto.base_experience ?? 0,
      types: dto.types.map(entry => ({ name: entry.type.name })),
      abilities: dto.abilities.map(entry => ({
        name: entry.ability.name,
        isHidden: entry.is_hidden,
      })),
      stats: dto.stats.map(entry => ({
        name: entry.stat.name,
        value: entry.base_stat,
      })),
    };
  },
};
