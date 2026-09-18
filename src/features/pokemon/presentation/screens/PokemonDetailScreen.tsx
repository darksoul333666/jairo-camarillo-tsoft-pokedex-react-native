import type { ReactNode } from 'react';
import { useEffect } from 'react';
import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { GetPokemonDetail } from '@features/pokemon/domain/useCases/GetPokemonDetail';
import { FeedbackState } from '@features/pokemon/presentation/components/FeedbackState';
import { LoadingState } from '@features/pokemon/presentation/components/LoadingState';
import {
  formatMeasurement,
  formatPokemonName,
  formatStatName,
} from '@features/pokemon/presentation/formatPokemon';
import {
  useAppColors,
  type AppColors,
} from '@features/pokemon/presentation/theme';
import { usePokemonDetailViewModel } from '@features/pokemon/presentation/viewModels/usePokemonDetailViewModel';

type Props = {
  pokemonId: number;
  getPokemonDetail: GetPokemonDetail;
  onTitleChange?: (title: string) => void;
};

export function PokemonDetailScreen({
  pokemonId,
  getPokemonDetail,
  onTitleChange,
}: Props) {
  const colors = useAppColors();
  const { state, retry, refresh } = usePokemonDetailViewModel(
    pokemonId,
    getPokemonDetail,
  );

  useEffect(() => {
    if (state.status === 'success' || state.status === 'refreshing') {
      onTitleChange?.(formatPokemonName(state.data.name));
    }
  }, [onTitleChange, state]);

  if (state.status === 'idle' || state.status === 'loading') {
    return <LoadingState message="Loading Pokémon" />;
  }

  if (state.status === 'error') {
    return (
      <FeedbackState
        title="Could not load Pokémon"
        message={state.message}
        onRetry={retry}
      />
    );
  }

  if (state.status === 'empty') {
    return (
      <FeedbackState
        title="Pokémon not found"
        message="This Pokémon is not available right now."
        onRetry={retry}
      />
    );
  }

  const pokemon = state.data;
  const name = formatPokemonName(pokemon.name);

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      accessibilityLabel={`${name} details`}
      refreshControl={
        <RefreshControl
          refreshing={state.status === 'refreshing'}
          onRefresh={refresh}
          tintColor={colors.accent}
          accessibilityLabel="Reload Pokémon"
        />
      }
    >
      {state.source === 'cache' ? (
        <Text
          style={[
            styles.cacheNotice,
            { color: colors.cacheText, backgroundColor: colors.cacheBg },
          ]}
          accessibilityLiveRegion="polite"
        >
          Offline — showing saved data
        </Text>
      ) : null}
      <View style={[styles.hero, { backgroundColor: colors.surface }]}>
        <Image
          source={{ uri: pokemon.imageUrl }}
          style={styles.image}
          accessibilityLabel={`${name} artwork`}
          accessibilityIgnoresInvertColors
        />
        <Text style={[styles.id, { color: colors.muted }]}>#{pokemon.id}</Text>
        <Text
          style={[styles.name, { color: colors.text }]}
          accessibilityRole="header"
        >
          {name}
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <InfoRow
          label="Height"
          value={`${formatMeasurement(pokemon.height)} m`}
          colors={colors}
        />
        <InfoRow
          label="Weight"
          value={`${formatMeasurement(pokemon.weight)} kg`}
          colors={colors}
        />
        <InfoRow
          label="Base XP"
          value={String(pokemon.baseExperience)}
          colors={colors}
        />
      </View>

      <Section title="Types" colors={colors}>
        {pokemon.types.map(type => (
          <Text key={type.name} style={[styles.chip, { color: colors.text }]}>
            {formatPokemonName(type.name)}
          </Text>
        ))}
      </Section>

      <Section title="Abilities" colors={colors}>
        {pokemon.abilities.map(ability => (
          <Text
            key={ability.name}
            style={[styles.body, { color: colors.text }]}
          >
            {formatPokemonName(ability.name)}
            {ability.isHidden ? ' (hidden)' : ''}
          </Text>
        ))}
      </Section>

      <Section title="Stats" colors={colors}>
        {pokemon.stats.map(stat => (
          <InfoRow
            key={stat.name}
            label={formatStatName(stat.name)}
            value={String(stat.value)}
            colors={colors}
          />
        ))}
      </Section>
    </ScrollView>
  );
}

function Section({
  title,
  children,
  colors,
}: {
  title: string;
  children: ReactNode;
  colors: AppColors;
}) {
  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <Text
        style={[styles.sectionTitle, { color: colors.text }]}
        accessibilityRole="header"
      >
        {title}
      </Text>
      {children}
    </View>
  );
}

function InfoRow({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: AppColors;
}) {
  return (
    <View
      style={styles.row}
      accessible
      accessibilityLabel={`${label}, ${value}`}
    >
      <Text style={[styles.label, { color: colors.muted }]} accessible={false}>
        {label}
      </Text>
      <Text style={[styles.value, { color: colors.text }]} accessible={false}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
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
    borderRadius: 8,
  },
  hero: {
    alignItems: 'center',
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
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
  },
  card: {
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  chip: {
    fontSize: 16,
  },
  body: {
    fontSize: 16,
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
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
  },
});
