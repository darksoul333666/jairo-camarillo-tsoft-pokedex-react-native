export function formatPokemonName(name: string): string {
  if (name.length === 0) {
    return name;
  }

  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function formatMeasurement(value: number): string {
  return `${(value / 10).toFixed(1)}`;
}

const STAT_LABELS: Record<string, string> = {
  hp: 'HP',
  attack: 'Attack',
  defense: 'Defense',
  'special-attack': 'Sp. Atk',
  'special-defense': 'Sp. Def',
  speed: 'Speed',
};

export function formatStatName(name: string): string {
  return (
    STAT_LABELS[name] ??
    name
      .split('-')
      .map(part => formatPokemonName(part))
      .join(' ')
  );
}
