import { AppError } from '@core/errors/AppError';
import { PokemonRepositoryImpl } from './PokemonRepositoryImpl';
import type { PokemonLocalDataSource } from '@features/pokemon/data/datasources/PokemonLocalDataSource';
import type { PokemonRemoteDataSource } from '@features/pokemon/data/datasources/PokemonRemoteDataSource';
import type { Pokemon } from '@features/pokemon/domain/entities/Pokemon';
import type { PokemonDetail } from '@features/pokemon/domain/entities/PokemonDetail';

const listDto = {
  count: 1,
  next: null,
  previous: null,
  results: [{ name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' }],
};

const mappedList: Pokemon[] = [
  {
    id: 1,
    name: 'bulbasaur',
    imageUrl:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png',
  },
];

const detailDto = {
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
  ],
  stats: [
    {
      base_stat: 45,
      effort: 0,
      stat: { name: 'hp', url: 'https://pokeapi.co/api/v2/stat/1/' },
    },
  ],
};

const mappedDetail: PokemonDetail = {
  id: 1,
  name: 'bulbasaur',
  imageUrl:
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png',
  height: 7,
  weight: 69,
  baseExperience: 64,
  types: [{ name: 'grass' }],
  abilities: [{ name: 'overgrow', isHidden: false }],
  stats: [{ name: 'hp', value: 45 }],
};

function createRepository() {
  const remote = {
    getPokemonList: jest.fn(),
    getPokemonDetail: jest.fn(),
  };
  const local = {
    getPokemonList: jest.fn(),
    savePokemonList: jest.fn().mockResolvedValue(undefined),
    getPokemonDetail: jest.fn(),
    savePokemonDetail: jest.fn().mockResolvedValue(undefined),
  };

  const repository = new PokemonRepositoryImpl(
    remote as unknown as PokemonRemoteDataSource,
    local as unknown as PokemonLocalDataSource,
  );

  return { repository, remote, local };
}

describe('PokemonRepositoryImpl', () => {
  it('maps network success, updates cache and marks source as network', async () => {
    const { repository, remote, local } = createRepository();
    remote.getPokemonList.mockResolvedValue(listDto);

    await expect(repository.getPokemonList(0, 20)).resolves.toEqual({
      data: mappedList,
      source: 'network',
    });
    expect(local.savePokemonList).toHaveBeenCalledWith(0, 20, mappedList);
  });

  it('still returns network data if cache write fails', async () => {
    const { repository, remote, local } = createRepository();
    remote.getPokemonList.mockResolvedValue(listDto);
    local.savePokemonList.mockRejectedValue(new Error('disk full'));

    await expect(repository.getPokemonList(0, 20)).resolves.toEqual({
      data: mappedList,
      source: 'network',
    });
  });

  it('returns cache when the network fails and cache exists', async () => {
    const { repository, remote, local } = createRepository();
    remote.getPokemonList.mockRejectedValue(
      new AppError('Network', 'Could not reach PokéAPI.'),
    );
    local.getPokemonList.mockResolvedValue(mappedList);

    await expect(repository.getPokemonList(0, 20)).resolves.toEqual({
      data: mappedList,
      source: 'cache',
    });
  });

  it('throws when the network fails and there is no cache', async () => {
    const { repository, remote, local } = createRepository();
    const networkError = new AppError('Network', 'Could not reach PokéAPI.');
    remote.getPokemonList.mockRejectedValue(networkError);
    local.getPokemonList.mockResolvedValue(null);

    await expect(repository.getPokemonList(0, 20)).rejects.toBe(networkError);
  });

  it('returns cached detail when the network fails', async () => {
    const { repository, remote, local } = createRepository();
    remote.getPokemonDetail.mockRejectedValue(
      new AppError('Network', 'Could not reach PokéAPI.'),
    );
    local.getPokemonDetail.mockResolvedValue(mappedDetail);

    await expect(repository.getPokemonDetail(1)).resolves.toEqual({
      data: mappedDetail,
      source: 'cache',
    });
  });

  it('maps a network detail and updates cache', async () => {
    const { repository, remote, local } = createRepository();
    remote.getPokemonDetail.mockResolvedValue(detailDto);

    await expect(repository.getPokemonDetail(1)).resolves.toEqual({
      data: mappedDetail,
      source: 'network',
    });
    expect(local.savePokemonDetail).toHaveBeenCalledWith(mappedDetail);
  });
});
