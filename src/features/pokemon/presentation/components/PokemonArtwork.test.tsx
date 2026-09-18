import React from 'react';
import { Image } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { PokemonArtwork } from './PokemonArtwork';

describe('PokemonArtwork', () => {
  it('shows a skeleton until the image loads', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <PokemonArtwork uri="https://example.com/1.png" size={56} />,
      );
    });

    expect(
      renderer?.root.findByProps({ testID: 'artwork-placeholder' }),
    ).toBeTruthy();

    await ReactTestRenderer.act(async () => {
      renderer?.root.findByType(Image).props.onLoad();
    });

    expect(
      renderer?.root.findAllByProps({ testID: 'artwork-placeholder' }),
    ).toHaveLength(0);
  });

  it('shows an empty placeholder when the image fails', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <PokemonArtwork uri="https://example.com/1.png" size={56} />,
      );
    });

    await ReactTestRenderer.act(async () => {
      renderer?.root.findByType(Image).props.onError();
    });

    expect(
      renderer?.root.findByProps({ testID: 'artwork-placeholder' }),
    ).toBeTruthy();
    expect(renderer?.root.findAllByType(Image)).toHaveLength(0);
  });

  it('treats a load that never succeeds as a missing image', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <PokemonArtwork uri="https://example.com/1.png" size={56} />,
      );
    });

    await ReactTestRenderer.act(async () => {
      renderer?.root.findByType(Image).props.onLoadEnd();
    });

    expect(renderer?.root.findAllByType(Image)).toHaveLength(0);
    expect(
      renderer?.root.findByProps({ testID: 'artwork-placeholder' }),
    ).toBeTruthy();
  });
});
