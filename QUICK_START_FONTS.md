# 🚀 Quick Start - Montserrat Font Setup

## ✅ Configuration Complete!

Your [`app.json`](file:///Users/uvaise/Herd/enspekexpo/app.json) has been configured with the expo-font plugin format for native Montserrat font integration.

---

## 📝 What You Need to Do Now

### Step 1: Regenerate Native Projects
```bash
npx expo prebuild --clean
```

### Step 2: Run the App
```bash
# For iOS
npx expo run:ios

# For Android  
npx expo run:android
```

---

## 🎨 How to Use Fonts

### Default (Automatic)
```typescript
<Text>Montserrat Regular by default</Text>
```

### With Different Weights
```typescript
import { FONTS } from '../src/config/fonts';

<Text style={{ fontFamily: FONTS.bold }}>Bold Heading</Text>
<Text style={{ fontFamily: FONTS.semiBold }}>SemiBold Button</Text>
<Text style={{ fontFamily: FONTS.medium }}>Medium Label</Text>
```

---

## ✨ What This Gives You

- ✅ Native font embedding on iOS and Android
- ✅ Better performance (fonts in app bundle)
- ✅ Android can use `fontWeight` with Montserrat
- ✅ Proper font discovery on both platforms
- ✅ Works in standalone/production builds

---

## 📚 Full Documentation

- [`EXPO_FONT_PLUGIN_CONFIG.md`](file:///Users/uvaise/Herd/enspekexpo/EXPO_FONT_PLUGIN_CONFIG.md) - Complete guide
- [`DEFAULT_FONT_SETUP.md`](file:///Users/uvaise/Herd/enspekexpo/DEFAULT_FONT_SETUP.md) - Default font configuration
- [`MONTSERRAT_VISUAL_GUIDE.md`](file:///Users/uvaise/Herd/enspekexpo/MONTSERRAT_VISUAL_GUIDE.md) - Typography reference

---

**That's it! Run prebuild and enjoy your custom fonts!** 🎉
