# Montserrat Font Implementation Guide

## ✅ Installation Complete

The Montserrat font family has been successfully installed and configured in your Expo app.

## 📁 Font Files Added

The following font files are now in `/assets/fonts/`:

- `Montserrat-Regular.ttf` - For normal text (fontWeight: 400)
- `Montserrat-Medium.ttf` - For medium weight text (fontWeight: 500)
- `Montserrat-SemiBold.ttf` - For semi-bold text (fontWeight: 600)
- `Montserrat-Bold.ttf` - For bold text (fontWeight: 700+)

## 🔧 Configuration

### 1. Root Layout (`app/_layout.tsx`)
The fonts are loaded using `expo-font`'s `useFonts` hook in the root layout. The splash screen stays visible until fonts are loaded.

### 2. Font Config (`src/config/fonts.ts`)
A helper file provides:
- `FONTS` constant with all font family names
- `getFontFamily()` helper function to automatically select the right font based on weight

## 📝 How to Use Montserrat

### Method 1: Direct Font Family (Recommended)

```typescript
import { FONTS } from '../../src/config/fonts';

const styles = StyleSheet.create({
  title: {
    fontFamily: FONTS.bold,
    fontSize: 24,
  },
  subtitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 18,
  },
  body: {
    fontFamily: FONTS.regular,
    fontSize: 16,
  },
  label: {
    fontFamily: FONTS.medium,
    fontSize: 14,
  },
});
```

### Method 2: Using Helper Function

```typescript
import { getFontFamily } from '../../src/config/fonts';

const styles = StyleSheet.create({
  text: {
    fontFamily: getFontFamily('700'), // Returns Montserrat-Bold
    fontSize: 16,
  },
});
```

### Method 3: Inline Styles

```typescript
import { FONTS } from '../../src/config/fonts';

<Text style={{ fontFamily: FONTS.regular, fontSize: 16 }}>
  Hello World
</Text>
```

## 🎨 Font Weight Mapping

When using `fontWeight` in React Native, you now need to use `fontFamily` instead:

| Old Style | New Style |
|-----------|-----------|
| `fontWeight: '400'` or default | `fontFamily: FONTS.regular` |
| `fontWeight: '500'` | `fontFamily: FONTS.medium` |
| `fontWeight: '600'` | `fontFamily: FONTS.semiBold` |
| `fontWeight: '700'` or `'bold'` | `fontFamily: FONTS.bold` |

## 📋 Example: Updating an Existing Component

### Before:
```typescript
const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    color: '#6B7280',
  },
});
```

### After:
```typescript
import { FONTS } from '../../src/config/fonts';

const styles = StyleSheet.create({
  title: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    color: '#1F2937',
  },
  body: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: '#6B7280',
  },
});
```

## 🚀 Testing

Run your app to see Montserrat in action:

```bash
npx expo start
```

Then press:
- `i` for iOS simulator
- `a` for Android emulator

## 📱 Platform Support

Montserrat will work on:
- ✅ iOS
- ✅ Android
- ✅ Web (when using expo-web)

## ⚠️ Important Notes

1. **Always import FONTS**: Make sure to import from `'../../src/config/fonts'` (adjust path based on your file location)

2. **Remove fontWeight when using fontFamily**: React Native will use the font file itself for the weight, so you don't need `fontWeight` anymore

3. **Rebuild if necessary**: If fonts don't appear after installation, try:
   ```bash
   npx expo start --clear
   ```

4. **For production builds**: Fonts are automatically included in the build when using `expo build` or EAS Build

## 🎯 Next Steps

To update all your components to use Montserrat:

1. Import `FONTS` at the top of each component file
2. Add `fontFamily` to your StyleSheet definitions
3. Remove `fontWeight` properties (the font files handle the weight)
4. Test the component to ensure fonts display correctly

## 📚 Additional Resources

- [Expo Font Documentation](https://docs.expo.dev/versions/latest/sdk/font/)
- [Montserrat on Google Fonts](https://fonts.google.com/specimen/Montserrat)
- [React Native Text Style Props](https://reactnative.dev/docs/text-style-props)
