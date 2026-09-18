import { useEffect, useRef, useState } from 'react';
import { Animated, Image, StyleSheet, View } from 'react-native';
import { useAppColors } from '@features/pokemon/presentation/theme';

type Props = {
  uri: string;
  size: number;
  accessibilityLabel?: string;
};

type ArtworkStatus = 'loading' | 'loaded' | 'error';

export function PokemonArtwork({ uri, size, accessibilityLabel }: Props) {
  const colors = useAppColors();
  const [status, setStatus] = useState<ArtworkStatus>('loading');

  useEffect(() => {
    setStatus('loading');
  }, [uri]);

  return (
    <View
      style={{ width: size, height: size }}
      accessible={accessibilityLabel != null}
      accessibilityLabel={accessibilityLabel}
    >
      {status !== 'loaded' ? (
        <ArtworkPlaceholder
          size={size}
          color={colors.skeleton}
          markColor={colors.muted}
          pulse={status === 'loading'}
        />
      ) : null}
      {status !== 'error' ? (
        <Image
          testID="artwork-image"
          source={{ uri }}
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
          resizeMode="contain"
          style={[
            styles.image,
            { width: size, height: size },
            status !== 'loaded' && styles.hidden,
          ]}
          accessible={false}
          accessibilityIgnoresInvertColors
        />
      ) : null}
    </View>
  );
}

function ArtworkPlaceholder({
  size,
  color,
  markColor,
  pulse,
}: {
  size: number;
  color: string;
  markColor: string;
  pulse: boolean;
}) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!pulse) {
      opacity.setValue(1);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.45,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 650,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => {
      animation.stop();
    };
  }, [opacity, pulse]);

  const radius = Math.max(8, Math.round(size * 0.12));
  const mark = Math.round(size * 0.34);

  return (
    <Animated.View
      testID="artwork-placeholder"
      style={[
        styles.placeholder,
        {
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor: color,
          opacity,
        },
      ]}
      accessibilityElementsHidden
      importantForAccessibility="no"
    >
      {pulse ? null : (
        <View
          style={[
            styles.emptyMark,
            {
              width: mark,
              height: mark,
              borderRadius: mark / 2,
              borderColor: markColor,
            },
          ]}
        />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  hidden: {
    opacity: 0,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyMark: {
    borderWidth: 2,
    backgroundColor: 'transparent',
    opacity: 0.55,
  },
});
