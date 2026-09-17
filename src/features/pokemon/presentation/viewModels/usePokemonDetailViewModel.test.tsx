import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { AppError } from '@core/errors/AppError';
import type { PokemonDetail } from '@features/pokemon/domain/entities/PokemonDetail';
import type { GetPokemonDetail } from '@features/pokemon/domain/useCases/GetPokemonDetail';
import { usePokemonDetailViewModel } from './usePokemonDetailViewModel';

const bulbasaur: PokemonDetail = {
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

function Probe({ getPokemonDetail }: { getPokemonDetail: GetPokemonDetail }) {
  const { state } = usePokemonDetailViewModel(1, getPokemonDetail);
  return <Text testID="status">{state.status}</Text>;
}

describe('usePokemonDetailViewModel', () => {
  it('loads detail and marks success', async () => {
    const getPokemonDetail = {
      execute: jest.fn().mockResolvedValue({
        data: bulbasaur,
        source: 'cache',
      }),
    } as unknown as GetPokemonDetail;

    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <Probe getPokemonDetail={getPokemonDetail} />,
      );
    });

    expect(getPokemonDetail.execute).toHaveBeenCalledWith(1);
    expect(
      renderer?.root.findByProps({ testID: 'status' }).props.children,
    ).toBe('success');
  });

  it('maps failures to an error state', async () => {
    const getPokemonDetail = {
      execute: jest
        .fn()
        .mockRejectedValue(new AppError('Network', 'Could not reach PokéAPI.')),
    } as unknown as GetPokemonDetail;

    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <Probe getPokemonDetail={getPokemonDetail} />,
      );
    });

    expect(
      renderer?.root.findByProps({ testID: 'status' }).props.children,
    ).toBe('error');
  });
});
