import React from 'react';
import { Pressable, PressableProps } from 'react-native';
import { triggerHaptic, HapticType } from '../utils/haptics';

interface HapticPressableProps extends PressableProps {
  hapticType?: HapticType;
  hapticOnPressIn?: boolean; // Trigger haptic on press in instead of press
}

/**
 * Pressable component with built-in haptic feedback
 * Usage: <HapticPressable onPress={handlePress} hapticType={HapticType.Medium}>
 */
export const HapticPressable: React.FC<HapticPressableProps> = ({
  onPress,
  onPressIn,
  hapticType = HapticType.Light,
  hapticOnPressIn = false,
  children,
  ...props
}) => {
  const handlePress = (event: any) => {
    if (!hapticOnPressIn) {
      triggerHaptic(hapticType);
    }
    onPress?.(event);
  };

  const handlePressIn = (event: any) => {
    if (hapticOnPressIn) {
      triggerHaptic(hapticType);
    }
    onPressIn?.(event);
  };

  return (
    <Pressable onPress={handlePress} onPressIn={handlePressIn} {...props}>
      {children}
    </Pressable>
  );
};

