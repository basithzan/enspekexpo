# ✅ Montserrat Set as Default Font

## 🎉 What's Been Done

Montserrat is now the **default font** for your entire React Native app! Every `Text` and `TextInput` component will automatically use Montserrat Regular unless you specify otherwise.

## 🔧 Implementation

### 1. Global Default Configuration (`app/_layout.tsx`)

The app now sets Montserrat as the default for all native components:

```typescript
// When fonts finish loading, set default font for all Text and TextInput
useEffect(() => {
  if (fontsLoaded || fontError) {
    Text.defaultProps.style = { fontFamily: FONTS.regular };
    TextInput.defaultProps.style = { fontFamily: FONTS.regular };
    SplashScreen.hideAsync();
  }
}, [fontsLoaded, fontError]);
```

### 2. Custom Components Created

**Optional** custom components for better type safety:

- **`src/components/DefaultText.tsx`** - Text component with Montserrat
- **`src/components/TextInput.tsx`** - TextInput component with Montserrat
- **`src/components/index.ts`** - Centralized exports

## 🎨 How It Works Now

### Before (Manual Font Specification):
```typescript
<Text style={{ fontFamily: FONTS.regular, fontSize: 16 }}>
  Hello World
</Text>
```

### After (Automatic Default):
```typescript
<Text style={{ fontSize: 16 }}>
  Hello World  {/* ✅ Automatically uses Montserrat Regular */}
</Text>
```

## 📝 Usage Examples

### Example 1: Simple Text (Uses Default Font)
```typescript
<Text>This automatically uses Montserrat Regular</Text>
```

### Example 2: Override with Bold
```typescript
<Text style={{ fontFamily: FONTS.bold, fontSize: 24 }}>
  Bold Heading
</Text>
```

### Example 3: Input Fields (Automatic)
```typescript
<TextInput 
  placeholder="Enter text..."
  // Automatically uses Montserrat Regular
/>
```

### Example 4: Styled Text with Default Font
```typescript
<Text style={{ fontSize: 16, color: '#333' }}>
  No need to specify fontFamily anymore!
</Text>
```

### Example 5: Different Font Weights
```typescript
// Regular (default - no need to specify)
<Text style={{ fontSize: 16 }}>Regular text</Text>

// Medium
<Text style={{ fontFamily: FONTS.medium, fontSize: 16 }}>
  Medium weight
</Text>

// SemiBold
<Text style={{ fontFamily: FONTS.semiBold, fontSize: 16 }}>
  SemiBold text
</Text>

// Bold
<Text style={{ fontFamily: FONTS.bold, fontSize: 24 }}>
  Bold heading
</Text>
```

## 🎯 Best Practices

### ✅ DO:
- **Use default for body text**: Just use `<Text>` without fontFamily
- **Specify weight when needed**: Add `fontFamily: FONTS.bold` for headings
- **Keep styles clean**: No need to repeat fontFamily everywhere
- **Use consistent weights**: Stick to the 4 available weights

### ❌ DON'T:
- Don't specify `fontFamily: FONTS.regular` for every text (it's now default)
- Don't use `fontWeight` anymore (use `fontFamily` with different weights)
- Don't mix system fonts with Montserrat

## 📊 Component-by-Component Guide

### Text Components

```typescript
// Body text - no fontFamily needed
<Text style={styles.body}>Content here</Text>

const styles = StyleSheet.create({
  body: {
    fontSize: 16,
    color: '#374151',
    // fontFamily is automatically Montserrat Regular
  },
});
```

### Headings

```typescript
// Headings - specify bold
<Text style={styles.heading}>Title</Text>

const styles = StyleSheet.create({
  heading: {
    fontFamily: FONTS.bold,  // Override default
    fontSize: 24,
    color: '#1F2937',
  },
});
```

### Buttons

```typescript
// Button text - specify semiBold or bold
<Text style={styles.buttonText}>Click Me</Text>

const styles = StyleSheet.create({
  buttonText: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: '#FFFFFF',
  },
});
```

### Labels

```typescript
// Labels - specify medium or semiBold
<Text style={styles.label}>Name:</Text>

const styles = StyleSheet.create({
  label: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: '#6B7280',
  },
});
```

### Input Fields

```typescript
// TextInput - automatically uses Montserrat
<TextInput
  style={styles.input}
  placeholder="Enter your name"
/>

const styles = StyleSheet.create({
  input: {
    fontSize: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    // fontFamily is automatically Montserrat Regular
  },
});
```

## 🔄 Migrating Existing Code

### Old Code (Specifying fontFamily everywhere):
```typescript
const styles = StyleSheet.create({
  text1: {
    fontFamily: FONTS.regular,  // ❌ No longer needed
    fontSize: 16,
  },
  text2: {
    fontFamily: FONTS.regular,  // ❌ No longer needed
    fontSize: 14,
  },
  heading: {
    fontFamily: FONTS.bold,     // ✅ Keep this
    fontSize: 24,
  },
});
```

### New Code (Cleaner):
```typescript
const styles = StyleSheet.create({
  text1: {
    // fontFamily removed - uses default
    fontSize: 16,
  },
  text2: {
    // fontFamily removed - uses default
    fontSize: 14,
  },
  heading: {
    fontFamily: FONTS.bold,     // ✅ Only specify when different
    fontSize: 24,
  },
});
```

## 🎁 Benefits

### Before:
```typescript
// Had to specify fontFamily in every style
<Text style={{ fontFamily: FONTS.regular, fontSize: 16, color: '#333' }}>
  Hello
</Text>
<Text style={{ fontFamily: FONTS.regular, fontSize: 14, color: '#666' }}>
  World
</Text>
```

### After:
```typescript
// Clean and simple - fontFamily is automatic
<Text style={{ fontSize: 16, color: '#333' }}>Hello</Text>
<Text style={{ fontSize: 14, color: '#666' }}>World</Text>
```

**Benefits:**
- ✅ **Less code** - No need to repeat `fontFamily: FONTS.regular`
- ✅ **Consistent** - All text uses Montserrat by default
- ✅ **Cleaner** - Styles are more readable
- ✅ **Automatic** - New components get Montserrat without extra work
- ✅ **Flexible** - Easy to override when needed

## 🚀 What This Means for You

### For New Components:
```typescript
// Just write text - Montserrat is automatic
export function MyComponent() {
  return (
    <View>
      <Text>This is Montserrat Regular</Text>
      <Text style={{ fontSize: 20 }}>Still Montserrat Regular</Text>
      <Text style={{ fontFamily: FONTS.bold, fontSize: 24 }}>
        Montserrat Bold
      </Text>
    </View>
  );
}
```

### For Existing Components:
You can now **remove** `fontFamily: FONTS.regular` from all your styles - it's now the default!

## ⚙️ Technical Details

### How It Works:
1. **Font Loading**: Montserrat fonts are loaded in `_layout.tsx` using `useFonts`
2. **Default Setting**: After fonts load, `Text.defaultProps.style` and `TextInput.defaultProps.style` are set to use Montserrat Regular
3. **Global Application**: All Text and TextInput components automatically inherit this default
4. **Override Capability**: You can still override by specifying a different `fontFamily` in styles

### Platform Support:
- ✅ **iOS** - Montserrat applied globally
- ✅ **Android** - Montserrat applied globally
- ✅ **Web** - Montserrat applied globally (via Expo Web)

## 🎯 Quick Reference

| Component | Default Font | When to Override |
|-----------|--------------|------------------|
| `<Text>` | Montserrat Regular | Use FONTS.bold for headings, FONTS.semiBold for emphasis |
| `<TextInput>` | Montserrat Regular | Rarely needed - inputs usually use regular weight |
| Headings | Auto Regular | Always override with FONTS.bold |
| Buttons | Auto Regular | Override with FONTS.semiBold or FONTS.bold |
| Labels | Auto Regular | Override with FONTS.medium or FONTS.semiBold |
| Body Text | Auto Regular | No override needed |

## 📖 Font Weight Quick Guide

```typescript
import { FONTS } from '../src/config/fonts';

// Regular - DEFAULT (no need to specify)
<Text>Regular text</Text>

// Medium - For labels
<Text style={{ fontFamily: FONTS.medium }}>Label</Text>

// SemiBold - For buttons, emphasis
<Text style={{ fontFamily: FONTS.semiBold }}>Button</Text>

// Bold - For headings, titles
<Text style={{ fontFamily: FONTS.bold }}>Heading</Text>
```

---

## 🎊 You're All Set!

**Montserrat is now the default font** for your entire app. All existing and new Text/TextInput components will automatically use it. You only need to specify `fontFamily` when you want a different weight (medium, semibold, or bold).

**Test it now:**
```bash
npx expo start
```

Every text in your app will now display in beautiful Montserrat! ✨

---

*Generated: 2025-11-04*  
*Default Font Configuration for Enspek Expo App*
