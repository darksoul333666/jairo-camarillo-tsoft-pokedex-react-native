export interface PokemonType {
  name: string;
}

export interface PokemonAbility {
  name: string;
  isHidden: boolean;
}

export interface PokemonStat {
  name: string;
  value: number;
}

export interface PokemonDetail {
  id: number;
  name: string;
  imageUrl: string;
  height: number;
  weight: number;
  baseExperience: number;
  types: PokemonType[];
  abilities: PokemonAbility[];
  stats: PokemonStat[];
}
