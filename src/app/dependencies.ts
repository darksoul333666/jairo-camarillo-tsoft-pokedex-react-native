import { PokemonLocalDataSource } from '@features/pokemon/data/datasources/PokemonLocalDataSource';
import { PokemonRemoteDataSource } from '@features/pokemon/data/datasources/PokemonRemoteDataSource';
import { PokemonRepositoryImpl } from '@features/pokemon/data/repositories/PokemonRepositoryImpl';
import { GetPokemonDetail } from '@features/pokemon/domain/useCases/GetPokemonDetail';
import { GetPokemonList } from '@features/pokemon/domain/useCases/GetPokemonList';

export function createDependencies() {
  const remoteDataSource = new PokemonRemoteDataSource();
  const localDataSource = new PokemonLocalDataSource();
  const pokemonRepository = new PokemonRepositoryImpl(
    remoteDataSource,
    localDataSource,
  );

  return {
    getPokemonList: new GetPokemonList(pokemonRepository),
    getPokemonDetail: new GetPokemonDetail(pokemonRepository),
  };
}

export type AppDependencies = ReturnType<typeof createDependencies>;
