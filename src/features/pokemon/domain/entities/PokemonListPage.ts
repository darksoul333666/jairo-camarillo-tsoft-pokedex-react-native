import type { Pokemon } from './Pokemon';

export type PokemonListPage = {
  items: Pokemon[];
  hasMore: boolean;
};
