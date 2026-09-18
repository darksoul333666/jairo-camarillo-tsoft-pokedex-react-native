import { AppError } from '@core/errors/AppError';

export function toUserMessage(error: unknown): string {
  if (error instanceof AppError) {
    switch (error.code) {
      case 'Network':
        return 'Could not connect. Check your internet and try again.';
      case 'Server':
        return 'The Pokédex service is unavailable. Try again later.';
      case 'InvalidData':
        return 'Received unexpected Pokémon data.';
      case 'Storage':
        return 'Could not read saved Pokémon.';
      case 'Unknown':
        return 'Something went wrong. Try again.';
    }
  }

  return 'Something went wrong. Try again.';
}
