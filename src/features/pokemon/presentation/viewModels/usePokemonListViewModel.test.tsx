import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { AppError } from '@core/errors/AppError';
import type { Pokemon } from '@features/pokemon/domain/entities/Pokemon';
import type { GetPokemonList } from '@features/pokemon/domain/useCases/GetPokemonList';
import { usePokemonListViewModel } from './usePokemonListViewModel';

const bulbasaur: Pokemon = {
  id: 1,
  name: 'bulbasaur',
  imageUrl: 'https://example.com/1.png',
};

function Probe({ getPokemonList }: { getPokemonList: GetPokemonList }) {
  const { state } = usePokemonListViewModel(getPokemonList);
  return <Text testID="status">{state.status}</Text>;
}

describe('usePokemonListViewModel', () => {
  it('loads the first page and marks success', async () => {
    const getPokemonList = {
      execute: jest.fn().mockResolvedValue({
        data: [bulbasaur],
        source: 'network',
      }),
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
  });

  it('marks empty when the list has no pokemon', async () => {
    const getPokemonList = {
      execute: jest.fn().mockResolvedValue({ data: [], source: 'network' }),
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
});
