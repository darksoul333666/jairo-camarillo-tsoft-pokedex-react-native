import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { memo } from 'react';
import type { Pokemon } from '@features/pokemon/domain/entities/Pokemon';
import { formatPokemonName } from '@features/pokemon/presentation/formatPokemon';

type Props = {
  pokemon: Pokemon;
  onPress: (pokemonId: number) => void;
};

function PokemonListCard({ pokemon, onPress }: Props) {
  const name = formatPokemonName(pokemon.name);

  return (
    <Pressable
      onPress={() => onPress(pokemon.id)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`${name}, Pokémon number ${pokemon.id}`}
    >
      <Image
        source={{ uri: pokemon.imageUrl }}
        style={styles.image}
        accessibilityIgnoresInvertColors
      />
      <View style={styles.copy}>
        <Text style={styles.id}>#{pokemon.id}</Text>
        <Text style={styles.name}>{name}</Text>
      </View>
    </Pressable>
  );
}

export const PokemonCard = memo(PokemonListCard);

const styles = StyleSheet.create({
  card: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  pressed: {
    opacity: 0.8,
  },
  image: {
    width: 56,
    height: 56,
  },
  copy: {
    flex: 1,
  },
  id: {
    fontSize: 13,
    color: '#667085',
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#101828',
  },
});
