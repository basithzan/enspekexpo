import * as Haptics from 'expo-haptics';

/**
 * Haptic feedback utility functions
 * Provides different types of haptic feedback for various user interactions
 */

export enum HapticType {
  Light = 'light',
  Medium = 'medium',
  Heavy = 'heavy',
  Success = 'success',
  Warning = 'warning',
  Error = 'error',
  Selection = 'selection',
}

/**
 * Trigger light haptic feedback
 * Use for subtle interactions like tapping buttons, selecting items
 */
export const hapticLight = () => {
  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch (error) {
    // Haptics not available on this device
    console.debug('Haptics not available');
  }
};

/**
 * Trigger medium haptic feedback
 * Use for standard button presses, form submissions
 */
export const hapticMedium = () => {
  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    console.log('Haptic medium triggered');
  } catch (error) {
    console.debug('Haptics not available:', error);
  }
};

/**
 * Trigger heavy haptic feedback
 * Use for important actions, confirmations
 */
export const hapticHeavy = () => {
  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  } catch (error) {
    console.debug('Haptics not available');
  }
};

/**
 * Trigger success haptic feedback
 * Use for successful actions, confirmations
 */
export const hapticSuccess = () => {
  try {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch (error) {
    console.debug('Haptics not available');
  }
};

/**
 * Trigger warning haptic feedback
 * Use for warnings, attention-required actions
 */
export const hapticWarning = () => {
  try {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  } catch (error) {
    console.debug('Haptics not available');
  }
};

/**
 * Trigger error haptic feedback
 * Use for errors, failed actions
 */
export const hapticError = () => {
  try {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch (error) {
    console.debug('Haptics not available');
  }
};

/**
 * Trigger selection haptic feedback
 * Use for selection changes, picker interactions
 */
export const hapticSelection = () => {
  try {
    Haptics.selectionAsync();
  } catch (error) {
    // Haptics not available on this device
    console.debug('Haptics not available:', error);
  }
};

/**
 * Main haptic feedback function
 * @param type - Type of haptic feedback to trigger
 */
export const triggerHaptic = (type: HapticType = HapticType.Medium) => {
  switch (type) {
    case HapticType.Light:
      hapticLight();
      break;
    case HapticType.Medium:
      hapticMedium();
      break;
    case HapticType.Heavy:
      hapticHeavy();
      break;
    case HapticType.Success:
      hapticSuccess();
      break;
    case HapticType.Warning:
      hapticWarning();
      break;
    case HapticType.Error:
      hapticError();
      break;
    case HapticType.Selection:
      hapticSelection();
      break;
    default:
      hapticMedium();
  }
};

/**
 * React hook for haptic feedback
 * Usage: const haptic = useHaptics(); haptic.light();
 */
export const useHaptics = () => {
  return {
    light: hapticLight,
    medium: hapticMedium,
    heavy: hapticHeavy,
    success: hapticSuccess,
    warning: hapticWarning,
    error: hapticError,
    selection: hapticSelection,
    trigger: triggerHaptic,
  };
};

