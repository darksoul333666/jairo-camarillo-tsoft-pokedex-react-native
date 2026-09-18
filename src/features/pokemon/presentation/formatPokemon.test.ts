import { formatStatName } from './formatPokemon';

describe('formatStatName', () => {
  it('keeps HP in all caps', () => {
    expect(formatStatName('hp')).toBe('HP');
  });

  it('shortens special stats', () => {
    expect(formatStatName('special-attack')).toBe('Sp. Atk');
    expect(formatStatName('special-defense')).toBe('Sp. Def');
  });
});
