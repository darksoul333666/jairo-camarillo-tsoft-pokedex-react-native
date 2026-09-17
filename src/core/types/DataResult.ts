export type DataSourceOrigin = 'network' | 'cache';

export type DataResult<T> = {
  data: T;
  source: DataSourceOrigin;
};
