import React from 'react';
import { Pressable, Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { AppError } from '@core/errors/AppError';
import type { Pokemon } from '@features/pokemon/domain/entities/Pokemon';
import type { PokemonListPage } from '@features/pokemon/domain/entities/PokemonListPage';
import type { GetPokemonList } from '@features/pokemon/domain/useCases/GetPokemonList';
import { usePokemonListViewModel } from './usePokemonListViewModel';

const bulbasaur: Pokemon = {
  id: 1,
  name: 'bulbasaur',
  imageUrl: 'https://example.com/1.png',
};

const ivysaur: Pokemon = {
  id: 2,
  name: 'ivysaur',
  imageUrl: 'https://example.com/2.png',
};

function page(
  items: Pokemon[],
  hasMore: boolean,
  source: 'network' | 'cache' = 'network',
): { data: PokemonListPage; source: 'network' | 'cache' } {
  return { data: { items, hasMore }, source };
}

function Probe({ getPokemonList }: { getPokemonList: GetPokemonList }) {
  const { state, loadMore } = usePokemonListViewModel(getPokemonList);
  const count =
    state.status === 'success' ||
    state.status === 'loadingMore' ||
    state.status === 'loadMoreError'
      ? state.data.length
      : 0;

  return (
    <>
      <Text testID="status">{state.status}</Text>
      <Text testID="count">{String(count)}</Text>
      <Pressable testID="loadMore" onPress={loadMore}>
        <Text>more</Text>
      </Pressable>
    </>
  );
}

describe('usePokemonListViewModel', () => {
  it('loads the first page and marks success', async () => {
    const getPokemonList = {
      execute: jest.fn().mockResolvedValue(page([bulbasaur], true)),
    } as unknown as GetPokemonList;

    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <Probe getPokemonList={getPokemonList} />,
      );
    });

    expect(getPokemonList.execute).toHaveBeenCalledWith(0, 20);
    expect(
      renderer?.root.findByProps({ testID: 'status' }).props.children,
    ).toBe('success');
    expect(renderer?.root.findByProps({ testID: 'count' }).props.children).toBe(
      '1',
    );
  });

  it('marks empty when the list has no pokemon', async () => {
    const getPokemonList = {
      execute: jest.fn().mockResolvedValue(page([], false)),
    } as unknown as GetPokemonList;

    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <Probe getPokemonList={getPokemonList} />,
      );
    });

    expect(
      renderer?.root.findByProps({ testID: 'status' }).props.children,
    ).toBe('empty');
  });

  it('maps failures to an error state', async () => {
    const getPokemonList = {
      execute: jest
        .fn()
        .mockRejectedValue(new AppError('Network', 'Could not reach PokéAPI.')),
    } as unknown as GetPokemonList;

    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <Probe getPokemonList={getPokemonList} />,
      );
    });

    expect(
      renderer?.root.findByProps({ testID: 'status' }).props.children,
    ).toBe('error');
  });

  it('appends the next page and skips duplicate ids', async () => {
    const getPokemonList = {
      execute: jest
        .fn()
        .mockResolvedValueOnce(page([bulbasaur], true))
        .mockResolvedValueOnce(page([bulbasaur, ivysaur], false)),
    } as unknown as GetPokemonList;

    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <Probe getPokemonList={getPokemonList} />,
      );
    });

    await ReactTestRenderer.act(async () => {
      renderer?.root.findByProps({ testID: 'loadMore' }).props.onPress();
    });

    expect(getPokemonList.execute).toHaveBeenNthCalledWith(2, 20, 20);
    expect(renderer?.root.findByProps({ testID: 'count' }).props.children).toBe(
      '2',
    );
    expect(
      renderer?.root.findByProps({ testID: 'status' }).props.children,
    ).toBe('success');
  });

  it('does not start a second page request while one is in flight', async () => {
    let resolveSecond: ((value: unknown) => void) | undefined;
    const getPokemonList = {
      execute: jest
        .fn()
        .mockResolvedValueOnce(page([bulbasaur], true))
        .mockImplementationOnce(
          () =>
            new Promise(resolve => {
              resolveSecond = resolve;
            }),
        ),
    } as unknown as GetPokemonList;

    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <Probe getPokemonList={getPokemonList} />,
      );
    });

    await ReactTestRenderer.act(async () => {
      renderer?.root.findByProps({ testID: 'loadMore' }).props.onPress();
      renderer?.root.findByProps({ testID: 'loadMore' }).props.onPress();
    });

    expect(getPokemonList.execute).toHaveBeenCalledTimes(2);

    await ReactTestRenderer.act(async () => {
      resolveSecond?.(page([ivysaur], false));
    });
  });

  it('keeps loaded items when the next page fails', async () => {
    const getPokemonList = {
      execute: jest
        .fn()
        .mockResolvedValueOnce(page([bulbasaur], true))
        .mockRejectedValueOnce(
          new AppError('Network', 'Could not reach PokéAPI.'),
        ),
    } as unknown as GetPokemonList;

    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <Probe getPokemonList={getPokemonList} />,
      );
    });

    await ReactTestRenderer.act(async () => {
      renderer?.root.findByProps({ testID: 'loadMore' }).props.onPress();
    });

    expect(
      renderer?.root.findByProps({ testID: 'status' }).props.children,
    ).toBe('loadMoreError');
    expect(renderer?.root.findByProps({ testID: 'count' }).props.children).toBe(
      '1',
    );
  });
});
