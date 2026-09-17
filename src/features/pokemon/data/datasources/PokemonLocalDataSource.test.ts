import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  PokemonLocalDataSource,
  pokemonDetailCacheKey,
  pokemonListCacheKey,
} from './PokemonLocalDataSource';
import type { Pokemon } from '@features/pokemon/domain/entities/Pokemon';
import type { PokemonDetail } from '@features/pokemon/domain/entities/PokemonDetail';

jest.mock('@react-native-async-storage/async-storage', () => {
  const store = new Map<string, string>();

  return {
    __esModule: true,
    default: {
      getItem: jest.fn(async (key: string) => store.get(key) ?? null),
      setItem: jest.fn(async (key: string, value: string) => {
        store.set(key, value);
      }),
      clear: jest.fn(async () => {
        store.clear();
      }),
    },
  };
});

describe('PokemonLocalDataSource', () => {
  const dataSource = new PokemonLocalDataSource();

  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('uses the expected cache keys', () => {
    expect(pokemonListCacheKey(0, 20)).toBe('pokemon:list:0:20');
    expect(pokemonDetailCacheKey(25)).toBe('pokemon:detail:25');
  });

  it('returns null when the list is not cached', async () => {
    await expect(dataSource.getPokemonList(0, 20)).resolves.toBeNull();
  });

  it('roundtrips a pokemon list', async () => {
    const list: Pokemon[] = [
      {
        id: 1,
        name: 'bulbasaur',
        imageUrl: 'https://example.com/1.png',
      },
    ];

    await dataSource.savePokemonList(0, 20, list);

    await expect(dataSource.getPokemonList(0, 20)).resolves.toEqual(list);
  });

  it('roundtrips a pokemon detail', async () => {
    const detail: PokemonDetail = {
      id: 1,
      name: 'bulbasaur',
      imageUrl: 'https://example.com/1.png',
      height: 7,
      weight: 69,
      baseExperience: 64,
      types: [{ name: 'grass' }],
      abilities: [{ name: 'overgrow', isHidden: false }],
      stats: [{ name: 'hp', value: 45 }],
    };

    await dataSource.savePokemonDetail(detail);

    await expect(dataSource.getPokemonDetail(1)).resolves.toEqual(detail);
  });

  it('returns null when cached JSON is corrupt', async () => {
    await AsyncStorage.setItem(pokemonListCacheKey(0, 20), '{not-json');

    await expect(dataSource.getPokemonList(0, 20)).resolves.toBeNull();
  });
});
