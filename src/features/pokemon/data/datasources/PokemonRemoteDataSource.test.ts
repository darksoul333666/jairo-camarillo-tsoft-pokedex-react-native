import { PokemonRemoteDataSource } from './PokemonRemoteDataSource';

describe('PokemonRemoteDataSource', () => {
  const dataSource = new PokemonRemoteDataSource();
  const fetchMock = jest.fn();

  beforeEach(() => {
    globalThis.fetch = fetchMock as typeof fetch;
  });

  afterEach(() => {
    fetchMock.mockReset();
  });

  it('returns list dtos from pokeapi', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        count: 1,
        next: null,
        previous: null,
        results: [
          { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
        ],
      }),
    });

    const result = await dataSource.getPokemonList(0, 20);

    expect(fetchMock).toHaveBeenCalledWith(
      'https://pokeapi.co/api/v2/pokemon?offset=0&limit=20',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(result.results).toHaveLength(1);
    expect(result.results[0]?.name).toBe('bulbasaur');
  });

  it('maps a failed request to a network error', async () => {
    fetchMock.mockRejectedValue(new Error('offline'));

    await expect(dataSource.getPokemonList(0, 20)).rejects.toMatchObject({
      name: 'AppError',
      code: 'Network',
    });
  });

  it('maps a non-ok response to a server error', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    });

    await expect(dataSource.getPokemonDetail(1)).rejects.toMatchObject({
      name: 'AppError',
      code: 'Server',
    });
  });

  it('maps a hung request to a network error', async () => {
    const timedDataSource = new PokemonRemoteDataSource(20);
    fetchMock.mockImplementation(
      (_url: string, init?: RequestInit) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            const error = new Error('Aborted');
            error.name = 'AbortError';
            reject(error);
          });
        }),
    );

    await expect(timedDataSource.getPokemonList(0, 20)).rejects.toMatchObject({
      name: 'AppError',
      code: 'Network',
    });
  });
});
