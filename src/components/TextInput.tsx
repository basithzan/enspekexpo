import React from 'react';
import { TextInput as RNTextInput, TextInputProps, StyleSheet } from 'react-native';
import { FONTS } from '../config/fonts';

/**
 * Default TextInput component with Montserrat font
 * Use this instead of the default TextInput component to ensure consistent typography
 */
export function TextInput(props: TextInputProps) {
  const { style, ...otherProps } = props;
  
  return (
    <RNTextInput
      {...otherProps}
      style={[styles.defaultInput, style]}
    />
  );
}

const styles = StyleSheet.create({
  defaultInput: {
    fontFamily: FONTS.regular,
  },
});
