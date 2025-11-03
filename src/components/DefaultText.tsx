import React from 'react';
import { Text as RNText, TextProps, StyleSheet } from 'react-native';
import { FONTS } from '../config/fonts';

/**
 * Default Text component with Montserrat font
 * Use this instead of the default Text component to ensure consistent typography
 */
export function Text(props: TextProps) {
  const { style, ...otherProps } = props;
  
  return (
    <RNText
      {...otherProps}
      style={[styles.defaultText, style]}
    />
  );
}

const styles = StyleSheet.create({
  defaultText: {
    fontFamily: FONTS.regular,
  },
});
