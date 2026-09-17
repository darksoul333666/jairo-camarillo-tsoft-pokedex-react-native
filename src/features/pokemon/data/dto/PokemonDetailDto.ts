import { AppError } from '@core/errors/AppError';

export type NamedApiResourceDto = {
  name: string;
  url: string;
};

export type PokemonDetailDto = {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number | null;
  types: Array<{
    slot: number;
    type: NamedApiResourceDto;
  }>;
  abilities: Array<{
    is_hidden: boolean;
    slot: number;
    ability: NamedApiResourceDto;
  }>;
  stats: Array<{
    base_stat: number;
    effort: number;
    stat: NamedApiResourceDto;
  }>;
};

export function parsePokemonDetailDto(value: unknown): PokemonDetailDto {
  if (!isRecord(value)) {
    throw new AppError('InvalidData', 'Pokemon detail payload is invalid.');
  }

  if (
    typeof value.id !== 'number' ||
    !Number.isInteger(value.id) ||
    value.id <= 0
  ) {
    throw new AppError('InvalidData', 'Pokemon detail is missing a valid id.');
  }

  if (typeof value.name !== 'string' || value.name.trim() === '') {
    throw new AppError('InvalidData', 'Pokemon detail is missing a name.');
  }

  if (typeof value.height !== 'number' || typeof value.weight !== 'number') {
    throw new AppError('InvalidData', 'Pokemon detail is missing size data.');
  }

  if (
    value.base_experience !== null &&
    typeof value.base_experience !== 'number'
  ) {
    throw new AppError(
      'InvalidData',
      'Pokemon detail has an invalid base experience.',
    );
  }

  if (
    !Array.isArray(value.types) ||
    !Array.isArray(value.abilities) ||
    !Array.isArray(value.stats)
  ) {
    throw new AppError(
      'InvalidData',
      'Pokemon detail is missing types, abilities or stats.',
    );
  }

  return {
    id: value.id,
    name: value.name,
    height: value.height,
    weight: value.weight,
    base_experience: value.base_experience,
    types: value.types.map(parseTypeEntry),
    abilities: value.abilities.map(parseAbilityEntry),
    stats: value.stats.map(parseStatEntry),
  };
}

function parseNamedResource(
  value: unknown,
  field: string,
): NamedApiResourceDto {
  if (!isRecord(value) || typeof value.name !== 'string' || value.name === '') {
    throw new AppError('InvalidData', `Pokemon detail is missing ${field}.`);
  }

  return {
    name: value.name,
    url: typeof value.url === 'string' ? value.url : '',
  };
}

function parseTypeEntry(value: unknown) {
  if (!isRecord(value)) {
    throw new AppError('InvalidData', 'Pokemon type entry is invalid.');
  }

  return {
    slot: typeof value.slot === 'number' ? value.slot : 0,
    type: parseNamedResource(value.type, 'type'),
  };
}

function parseAbilityEntry(value: unknown) {
  if (!isRecord(value) || typeof value.is_hidden !== 'boolean') {
    throw new AppError('InvalidData', 'Pokemon ability entry is invalid.');
  }

  return {
    is_hidden: value.is_hidden,
    slot: typeof value.slot === 'number' ? value.slot : 0,
    ability: parseNamedResource(value.ability, 'ability'),
  };
}

function parseStatEntry(value: unknown) {
  if (!isRecord(value) || typeof value.base_stat !== 'number') {
    throw new AppError('InvalidData', 'Pokemon stat entry is invalid.');
  }

  return {
    base_stat: value.base_stat,
    effort: typeof value.effort === 'number' ? value.effort : 0,
    stat: parseNamedResource(value.stat, 'stat'),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
