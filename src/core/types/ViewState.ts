import type { DataSourceOrigin } from './DataResult';

export type ViewState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T; source: DataSourceOrigin }
  | { status: 'refreshing'; data: T; source: DataSourceOrigin }
  | { status: 'empty' }
  | { status: 'error'; message: string };
