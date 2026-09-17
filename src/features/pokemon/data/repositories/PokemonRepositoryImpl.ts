import { AppError } from '@core/errors/AppError';
import type { DataResult } from '@core/types/DataResult';
import type { Pokemon } from '@features/pokemon/domain/entities/Pokemon';
import type { PokemonDetail } from '@features/pokemon/domain/entities/PokemonDetail';
import type { PokemonRepository } from '@features/pokemon/domain/repositories/PokemonRepository';
import { PokemonMapper } from '@features/pokemon/data/mappers/PokemonMapper';
import type { PokemonLocalDataSource } from '@features/pokemon/data/datasources/PokemonLocalDataSource';
import type { PokemonRemoteDataSource } from '@features/pokemon/data/datasources/PokemonRemoteDataSource';

export class PokemonRepositoryImpl implements PokemonRepository {
  constructor(
    private readonly remoteDataSource: PokemonRemoteDataSource,
    private readonly localDataSource: PokemonLocalDataSource,
  ) {}

  async getPokemonList(
    offset: number,
    limit: number,
  ): Promise<DataResult<Pokemon[]>> {
    try {
      const dto = await this.remoteDataSource.getPokemonList(offset, limit);
      const data = PokemonMapper.toList(dto.results);
      await this.localDataSource
        .savePokemonList(offset, limit, data)
        .catch(() => undefined);
      return { data, source: 'network' };
    } catch (error) {
      const cached = await this.readListCache(offset, limit);
      if (cached !== null) {
        return { data: cached, source: 'cache' };
      }
      throw toAppError(error, 'Could not load Pokemon list.');
    }
  }

  async getPokemonDetail(id: number): Promise<DataResult<PokemonDetail>> {
    try {
      const dto = await this.remoteDataSource.getPokemonDetail(id);
      const data = PokemonMapper.toDetail(dto);
      await this.localDataSource.savePokemonDetail(data).catch(() => undefined);
      return { data, source: 'network' };
    } catch (error) {
      const cached = await this.readDetailCache(id);
      if (cached !== null) {
        return { data: cached, source: 'cache' };
      }
      throw toAppError(error, 'Could not load Pokemon detail.');
    }
  }

  private async readListCache(
    offset: number,
    limit: number,
  ): Promise<Pokemon[] | null> {
    try {
      return await this.localDataSource.getPokemonList(offset, limit);
    } catch {
      return null;
    }
  }

  private async readDetailCache(id: number): Promise<PokemonDetail | null> {
    try {
      return await this.localDataSource.getPokemonDetail(id);
    } catch {
      return null;
    }
  }
}

function toAppError(error: unknown, message: string): AppError {
  if (error instanceof AppError) {
    return error;
  }

  return new AppError('Unknown', message);
}
