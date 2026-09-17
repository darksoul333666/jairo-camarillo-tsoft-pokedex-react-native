import type { ReactNode } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { GetPokemonDetail } from '@features/pokemon/domain/useCases/GetPokemonDetail';
import { ErrorState } from '@features/pokemon/presentation/components/ErrorState';
import { LoadingState } from '@features/pokemon/presentation/components/LoadingState';
import {
  formatMeasurement,
  formatPokemonName,
  formatStatName,
} from '@features/pokemon/presentation/formatPokemon';
import { usePokemonDetailViewModel } from '@features/pokemon/presentation/viewModels/usePokemonDetailViewModel';

type Props = {
  pokemonId: number;
  getPokemonDetail: GetPokemonDetail;
};

export function PokemonDetailScreen({ pokemonId, getPokemonDetail }: Props) {
  const { state, retry } = usePokemonDetailViewModel(
    pokemonId,
    getPokemonDetail,
  );

  if (state.status === 'idle' || state.status === 'loading') {
    return <LoadingState message="Loading Pokémon" />;
  }

  if (state.status === 'error') {
    return <ErrorState message={state.message} onRetry={retry} />;
  }

  if (state.status === 'empty') {
    return <ErrorState message="Pokémon not found." onRetry={retry} />;
  }

  const pokemon = state.data;
  const name = formatPokemonName(pokemon.name);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      accessibilityLabel={`${name} details`}
    >
      {state.source === 'cache' ? (
        <Text style={styles.cacheNotice}>Showing saved data</Text>
      ) : null}
      <View style={styles.hero}>
        <Image
          source={{ uri: pokemon.imageUrl }}
          style={styles.image}
          accessibilityLabel={`${name} artwork`}
        />
        <Text style={styles.id}>#{pokemon.id}</Text>
        <Text style={styles.name} accessibilityRole="header">
          {name}
        </Text>
      </View>

      <View style={styles.card}>
        <InfoRow
          label="Height"
          value={`${formatMeasurement(pokemon.height)} m`}
        />
        <InfoRow
          label="Weight"
          value={`${formatMeasurement(pokemon.weight)} kg`}
        />
        <InfoRow label="Base XP" value={String(pokemon.baseExperience)} />
      </View>

      <Section title="Types">
        {pokemon.types.map(type => (
          <Text key={type.name} style={styles.chip}>
            {formatPokemonName(type.name)}
          </Text>
        ))}
      </Section>

      <Section title="Abilities">
        {pokemon.abilities.map(ability => (
          <Text key={ability.name} style={styles.body}>
            {formatPokemonName(ability.name)}
            {ability.isHidden ? ' (hidden)' : ''}
          </Text>
        ))}
      </Section>

      <Section title="Stats">
        {pokemon.stats.map(stat => (
          <InfoRow
            key={stat.name}
            label={formatStatName(stat.name)}
            value={String(stat.value)}
          />
        ))}
      </Section>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle} accessibilityRole="header">
        {title}
      </Text>
      {children}
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F2F4F7',
  },
  content: {
    padding: 16,
    gap: 12,
    paddingBottom: 32,
  },
  cacheNotice: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#B54708',
    backgroundColor: '#FEF0C7',
    borderRadius: 8,
  },
  hero: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  image: {
    width: 180,
    height: 180,
  },
  id: {
    marginTop: 8,
    fontSize: 14,
    color: '#667085',
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: '#101828',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#101828',
    marginBottom: 4,
  },
  chip: {
    fontSize: 16,
    color: '#101828',
  },
  body: {
    fontSize: 16,
    color: '#101828',
  },
  row: {
    minHeight: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  label: {
    fontSize: 16,
    color: '#667085',
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#101828',
  },
});
