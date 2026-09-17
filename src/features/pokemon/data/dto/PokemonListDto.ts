import { AppError } from '@core/errors/AppError';

export type PokemonListItemDto = {
  name: string;
  url: string;
};

export type PokemonListDto = {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonListItemDto[];
};

export function parsePokemonListDto(value: unknown): PokemonListDto {
  if (!isRecord(value) || !Array.isArray(value.results)) {
    throw new AppError('InvalidData', 'Pokemon list payload is invalid.');
  }

  return {
    count: typeof value.count === 'number' ? value.count : 0,
    next: typeof value.next === 'string' ? value.next : null,
    previous: typeof value.previous === 'string' ? value.previous : null,
    results: value.results.map(parsePokemonListItemDto),
  };
}

function parsePokemonListItemDto(value: unknown): PokemonListItemDto {
  if (!isRecord(value)) {
    throw new AppError('InvalidData', 'Pokemon list item is invalid.');
  }

  if (typeof value.name !== 'string' || value.name.trim() === '') {
    throw new AppError('InvalidData', 'Pokemon list item is missing a name.');
  }

  if (typeof value.url !== 'string' || value.url.trim() === '') {
    throw new AppError('InvalidData', 'Pokemon list item is missing a url.');
  }

  return {
    name: value.name,
    url: value.url,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
