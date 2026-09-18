/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '@app/App';
import type { AppDependencies } from '@app/dependencies';

const pendingDependencies = {
  getPokemonList: {
    execute: () => new Promise(() => undefined),
  },
  getPokemonDetail: {
    execute: () => new Promise(() => undefined),
  },
} as unknown as AppDependencies;

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App dependencies={pendingDependencies} />);
  });
});
