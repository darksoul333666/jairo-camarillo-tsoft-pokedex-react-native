import { AppError } from '@core/errors/AppError';
import {
  extractPokemonId,
  officialArtworkUrl,
  PokemonMapper,
} from './PokemonMapper';
import type { PokemonDetailDto } from '../dto/PokemonDetailDto';

describe('extractPokemonId', () => {
  it('reads the numeric id from a pokeapi resource url', () => {
    expect(extractPokemonId('https://pokeapi.co/api/v2/pokemon/25/')).toBe(25);
  });

  it('accepts urls without a trailing slash', () => {
    expect(extractPokemonId('https://pokeapi.co/api/v2/pokemon/1')).toBe(1);
  });

  it('fails when the url uses a name instead of an id', () => {
    expect(() =>
      extractPokemonId('https://pokeapi.co/api/v2/pokemon/pikachu/'),
    ).toThrow(AppError);

    try {
      extractPokemonId('https://pokeapi.co/api/v2/pokemon/pikachu/');
    } catch (error) {
      expect((error as AppError).code).toBe('InvalidData');
    }
  });

  it('fails when the url is empty or malformed', () => {
    expect(() => extractPokemonId('')).toThrow(AppError);
    expect(() => extractPokemonId('not-a-url')).toThrow(AppError);
  });
});

describe('officialArtworkUrl', () => {
  it('builds the official artwork url from the id', () => {
    expect(officialArtworkUrl(25)).toBe(
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
    );
  });
});

describe('PokemonMapper', () => {
  it('maps a list item without calling the detail endpoint', () => {
    const pokemon = PokemonMapper.toListItem({
      name: 'bulbasaur',
      url: 'https://pokeapi.co/api/v2/pokemon/1/',
    });

    expect(pokemon).toEqual({
      id: 1,
      name: 'bulbasaur',
      imageUrl:
        'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png',
    });
  });

  it('maps detail fields into the domain model', () => {
    const dto: PokemonDetailDto = {
      id: 1,
      name: 'bulbasaur',
      height: 7,
      weight: 69,
      base_experience: 64,
      types: [
        {
          slot: 1,
          type: { name: 'grass', url: 'https://pokeapi.co/api/v2/type/12/' },
        },
      ],
      abilities: [
        {
          is_hidden: false,
          slot: 1,
          ability: {
            name: 'overgrow',
            url: 'https://pokeapi.co/api/v2/ability/65/',
          },
        },
        {
          is_hidden: true,
          slot: 3,
          ability: {
            name: 'chlorophyll',
            url: 'https://pokeapi.co/api/v2/ability/34/',
          },
        },
      ],
      stats: [
        {
          base_stat: 45,
          effort: 0,
          stat: { name: 'hp', url: 'https://pokeapi.co/api/v2/stat/1/' },
        },
      ],
    };

    expect(PokemonMapper.toDetail(dto)).toEqual({
      id: 1,
      name: 'bulbasaur',
      imageUrl:
        'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png',
      height: 7,
      weight: 69,
      baseExperience: 64,
      types: [{ name: 'grass' }],
      abilities: [
        { name: 'overgrow', isHidden: false },
        { name: 'chlorophyll', isHidden: true },
      ],
      stats: [{ name: 'hp', value: 45 }],
    });
  });

  it('uses 0 when base_experience is null', () => {
    const dto: PokemonDetailDto = {
      id: 1,
      name: 'bulbasaur',
      height: 7,
      weight: 69,
      base_experience: null,
      types: [],
      abilities: [],
      stats: [],
    };

    expect(PokemonMapper.toDetail(dto).baseExperience).toBe(0);
  });
});
