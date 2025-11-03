# ✅ Montserrat Font - Native Plugin Configuration

## 🎉 Implementation Complete!

Your `app.json` has been updated with the **expo-font plugin configuration** for Montserrat. This provides better native integration and improved performance.

---

## 📋 What Changed

### Before:
```json
"plugins": [
  "expo-router",
  "expo-font"
]
```

### After:
```json
"plugins": [
  "expo-router",
  [
    "expo-font",
    {
      "fonts": [...],
      "android": {
        "fonts": [{
          "fontFamily": "Montserrat",
          "fontDefinitions": [...]
        }]
      },
      "ios": {
        "fonts": [...]
      }
    }
  ]
]
```

---

## 🎯 Benefits of This Configuration

### 1. **Better Android Support**
- Font family is properly registered with weight mappings (400, 500, 600, 700)
- Android can now use `fontWeight` property natively
- Better integration with Android's font system

### 2. **Improved iOS Integration**
- Fonts are explicitly listed in Info.plist
- Better font discovery and loading
- Consistent font rendering

### 3. **Native Embedding**
- Fonts are embedded in native builds (not just JS bundle)
- Faster font loading
- Works in standalone builds and EAS builds

### 4. **Cross-Platform Consistency**
- Uniform font behavior across iOS, Android, and Web
- Same font rendering on all platforms

---

## 🔄 How to Use Fonts Now

### Option 1: Using FONTS Helper (Current Approach - Still Works!)
```typescript
import { FONTS } from '../src/config/fonts';

<Text style={{ fontFamily: FONTS.regular }}>Regular Text</Text>
<Text style={{ fontFamily: FONTS.medium }}>Medium Text</Text>
<Text style={{ fontFamily: FONTS.semiBold }}>SemiBold Text</Text>
<Text style={{ fontFamily: FONTS.bold }}>Bold Text</Text>
```

### Option 2: NEW - Using fontWeight on Android
```typescript
// This now works on Android thanks to the plugin config!
<Text style={{ fontFamily: 'Montserrat', fontWeight: '400' }}>Regular</Text>
<Text style={{ fontFamily: 'Montserrat', fontWeight: '500' }}>Medium</Text>
<Text style={{ fontFamily: 'Montserrat', fontWeight: '600' }}>SemiBold</Text>
<Text style={{ fontFamily: 'Montserrat', fontWeight: '700' }}>Bold</Text>
```

### Option 3: Using Default Font (Automatic)
```typescript
// Thanks to the default config in _layout.tsx
<Text>This automatically uses Montserrat Regular</Text>
```

---

## 🚀 Next Steps - IMPORTANT!

You need to regenerate the native projects to apply these font configurations:

### Step 1: Clean and Prebuild
```bash
npx expo prebuild --clean
```

This will:
- Regenerate iOS and Android native projects
- Embed Montserrat fonts properly
- Apply the font configuration from app.json

### Step 2: Run on Devices

**For iOS:**
```bash
npx expo run:ios
```

**For Android:**
```bash
npx expo run:android
```

**For Development Server (Expo Go won't have custom fonts):**
```bash
npx expo start
```

---

## 📱 Platform-Specific Behavior

### iOS
- All 4 Montserrat font files are registered in Info.plist
- Fonts load from app bundle
- Use `fontFamily: 'Montserrat-Regular'`, `'Montserrat-Bold'`, etc.

### Android
- Single "Montserrat" family with weight definitions
- Can use `fontFamily: 'Montserrat'` with `fontWeight` property
- Fonts load from assets folder

### Web (Expo Web)
- Fonts load via CSS @font-face
- Works with both approaches

---

## 🎨 Complete Font Configuration

### Android Font Definitions:
| Weight | Path | Usage |
|--------|------|-------|
| 400 | Montserrat-Regular.ttf | Normal text |
| 500 | Montserrat-Medium.ttf | Labels, emphasis |
| 600 | Montserrat-SemiBold.ttf | Buttons, badges |
| 700 | Montserrat-Bold.ttf | Headings, titles |

### iOS Font Files:
- Montserrat-Regular.ttf
- Montserrat-Medium.ttf
- Montserrat-SemiBold.ttf
- Montserrat-Bold.ttf

---

## 💡 Best Practices

### Recommended Approach:
```typescript
import { FONTS } from '../src/config/fonts';

const styles = StyleSheet.create({
  // Use FONTS helper for cross-platform consistency
  heading: {
    fontFamily: FONTS.bold,
    fontSize: 24,
  },
  body: {
    // Default font is Montserrat Regular
    fontSize: 16,
  },
});
```

### Alternative (Android-specific optimization):
```typescript
const styles = StyleSheet.create({
  text: {
    fontFamily: Platform.select({
      android: 'Montserrat',
      ios: FONTS.regular,
    }),
    fontWeight: Platform.select({
      android: '700',
      ios: undefined,
    }),
  },
});
```

---

## 🔍 Verification

After running `npx expo prebuild --clean`, verify the configuration:

### iOS - Check Info.plist:
```bash
cat ios/Enspek/Info.plist | grep -A 10 UIAppFonts
```

Should show all 4 Montserrat fonts.

### Android - Check build.gradle:
```bash
cat android/app/build.gradle | grep -i font
```

Should reference the font configuration.

---

## 🐛 Troubleshooting

### Fonts Not Appearing?

1. **Did you run prebuild?**
   ```bash
   npx expo prebuild --clean
   ```

2. **Are font files present?**
   ```bash
   ls -lh assets/fonts/
   ```
   Should show all 4 Montserrat .ttf files.

3. **Try clearing cache:**
   ```bash
   npx expo start --clear
   ```

4. **Rebuild native apps:**
   ```bash
   npx expo run:ios
   # or
   npx expo run:android
   ```

---

## 📚 Configuration Reference

The full expo-font plugin configuration in app.json:

```json
{
  "expo": {
    "plugins": [
      "expo-router",
      [
        "expo-font",
        {
          "fonts": [
            "./assets/fonts/Montserrat-Regular.ttf",
            "./assets/fonts/Montserrat-Medium.ttf",
            "./assets/fonts/Montserrat-SemiBold.ttf",
            "./assets/fonts/Montserrat-Bold.ttf"
          ],
          "android": {
            "fonts": [
              {
                "fontFamily": "Montserrat",
                "fontDefinitions": [
                  { "path": "./assets/fonts/Montserrat-Regular.ttf", "weight": 400 },
                  { "path": "./assets/fonts/Montserrat-Medium.ttf", "weight": 500 },
                  { "path": "./assets/fonts/Montserrat-SemiBold.ttf", "weight": 600 },
                  { "path": "./assets/fonts/Montserrat-Bold.ttf", "weight": 700 }
                ]
              }
            ]
          },
          "ios": {
            "fonts": [
              "./assets/fonts/Montserrat-Regular.ttf",
              "./assets/fonts/Montserrat-Medium.ttf",
              "./assets/fonts/Montserrat-SemiBold.ttf",
              "./assets/fonts/Montserrat-Bold.ttf"
            ]
          }
        }
      ]
    ]
  }
}
```

---

## ✨ Summary

✅ **app.json updated** with expo-font plugin configuration  
✅ **Montserrat fonts** properly configured for iOS and Android  
✅ **Weight mappings** defined for Android (400, 500, 600, 700)  
✅ **Native embedding** enabled for better performance  
✅ **Cross-platform support** for iOS, Android, and Web  

### 🎯 Next Action Required:
```bash
npx expo prebuild --clean
npx expo run:ios
# or
npx expo run:android
```

After prebuild, your fonts will be natively embedded and work perfectly across all platforms! 🚀

---

*Configuration Date: 2025-11-04*  
*Enspek Expo App - Native Font Plugin Setup*
