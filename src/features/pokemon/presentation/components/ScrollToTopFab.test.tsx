import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { ScrollToTopFab } from './ScrollToTopFab';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 34, left: 0 }),
}));

describe('ScrollToTopFab', () => {
  it('renders nothing when hidden', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <ScrollToTopFab visible={false} onPress={jest.fn()} />,
      );
    });

    expect(renderer?.toJSON()).toBeNull();
  });

  it('calls onPress from the scroll-to-top control', async () => {
    const onPress = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <ScrollToTopFab visible={true} onPress={onPress} />,
      );
    });

    await ReactTestRenderer.act(async () => {
      renderer?.root
        .findByProps({ accessibilityLabel: 'Scroll to top' })
        .props.onPress();
    });

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
