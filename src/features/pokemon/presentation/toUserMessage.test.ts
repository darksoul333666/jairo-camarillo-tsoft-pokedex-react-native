import { AppError } from '@core/errors/AppError';
import { toUserMessage } from './toUserMessage';

describe('toUserMessage', () => {
  it('maps known AppError codes to user copy', () => {
    expect(toUserMessage(new AppError('Network', 'raw'))).toBe(
      'Could not connect. Check your internet and try again.',
    );
    expect(toUserMessage(new AppError('Server', 'raw'))).toBe(
      'The Pokédex service is unavailable. Try again later.',
    );
    expect(toUserMessage(new AppError('InvalidData', 'raw'))).toBe(
      'Received unexpected Pokémon data.',
    );
    expect(toUserMessage(new AppError('Storage', 'raw'))).toBe(
      'Could not read saved Pokémon.',
    );
  });

  it('falls back for unknown errors', () => {
    expect(toUserMessage(new Error('boom'))).toBe(
      'Something went wrong. Try again.',
    );
  });
});
