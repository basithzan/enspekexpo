# 🎨 Montserrat Font Visual Reference

## Font Weights Available

### Montserrat Regular (400)
**Usage**: Body text, descriptions, general content  
**Import**: `FONTS.regular`  
**Example**:
```typescript
description: {
  fontFamily: FONTS.regular,
  fontSize: 16,
  color: '#374151',
}
```

---

### Montserrat Medium (500)
**Usage**: Labels, subtle emphasis, metadata  
**Import**: `FONTS.medium`  
**Example**:
```typescript
label: {
  fontFamily: FONTS.medium,
  fontSize: 14,
  color: '#6B7280',
}
```

---

### Montserrat SemiBold (600)
**Usage**: Buttons, badges, important labels  
**Import**: `FONTS.semiBold`  
**Example**:
```typescript
buttonText: {
  fontFamily: FONTS.semiBold,
  fontSize: 16,
  color: '#FFFFFF',
}
```

---

### Montserrat Bold (700)
**Usage**: Headings, titles, primary emphasis  
**Import**: `FONTS.bold`  
**Example**:
```typescript
heading: {
  fontFamily: FONTS.bold,
  fontSize: 24,
  color: '#1F2937',
}
```

---

## 📖 Common Patterns in Your App

### Page Headers
```typescript
headerTitle: {
  fontFamily: FONTS.bold,      // Strong emphasis
  fontSize: 18,
  color: '#1F2937',
}
```

### Section Titles
```typescript
sectionTitle: {
  fontFamily: FONTS.bold,      // Section divider
  fontSize: 18,
  color: '#1F2937',
  marginBottom: 16,
}
```

### Job Titles
```typescript
jobTitle: {
  fontFamily: FONTS.bold,      // Main content title
  fontSize: 24,
  color: '#1F2937',
}
```

### Field Labels
```typescript
fieldLabel: {
  fontFamily: FONTS.semiBold,  // Form fields
  fontSize: 16,
  color: '#1F2937',
}
```

### Info Labels (Keys)
```typescript
infoLabel: {
  fontFamily: FONTS.medium,    // Left side of key-value
  fontSize: 14,
  color: '#6B7280',
}
```

### Info Values
```typescript
infoValue: {
  fontFamily: FONTS.semiBold,  // Right side of key-value
  fontSize: 14,
  color: '#1F2937',
}
```

### Body Text
```typescript
bodyText: {
  fontFamily: FONTS.regular,   // Paragraphs, descriptions
  fontSize: 16,
  color: '#374151',
  lineHeight: 24,
}
```

### Button Text (Primary)
```typescript
primaryButtonText: {
  fontFamily: FONTS.bold,      // Main action buttons
  fontSize: 16,
  color: '#FFFFFF',
}
```

### Button Text (Secondary)
```typescript
secondaryButtonText: {
  fontFamily: FONTS.semiBold,  // Secondary actions
  fontSize: 14,
  color: '#3B82F6',
}
```

### Badge Text
```typescript
badgeText: {
  fontFamily: FONTS.semiBold,  // Status, count badges
  fontSize: 12,
  color: '#3B82F6',
}
```

### Metadata/Timestamps
```typescript
metaText: {
  fontFamily: FONTS.regular,   // Small auxiliary info
  fontSize: 12,
  color: '#6B7280',
}
```

### Input Text
```typescript
inputText: {
  fontFamily: FONTS.regular,   // User input fields
  fontSize: 16,
  color: '#1F2937',
}
```

---

## 🎯 Font Selection Decision Tree

```
Is this text...

┌─ A main heading/title?
│  └─> Use FONTS.bold (24px)
│
├─ A section heading?
│  └─> Use FONTS.bold (18px)
│
├─ A button?
│  ├─ Primary action? → FONTS.bold (16px)
│  └─ Secondary action? → FONTS.semiBold (14-16px)
│
├─ A form label?
│  └─> Use FONTS.semiBold (16px)
│
├─ An info label (key in key-value)?
│  └─> Use FONTS.medium (14px)
│
├─ An info value?
│  └─> Use FONTS.semiBold (14px)
│
├─ A badge or status?
│  └─> Use FONTS.semiBold (12px)
│
├─ Body text or description?
│  └─> Use FONTS.regular (16px)
│
├─ Metadata or timestamp?
│  └─> Use FONTS.regular (12px)
│
└─ Input field?
   └─> Use FONTS.regular (16px)
```

---

## 💡 Quick Tips

### Do's ✅
- Use `FONTS.bold` for main headings and titles
- Use `FONTS.semiBold` for buttons and important actions
- Use `FONTS.medium` for subtle emphasis
- Use `FONTS.regular` for body text
- Keep font sizes consistent (12, 14, 16, 18, 24)
- Always remove `fontWeight` when adding `fontFamily`

### Don'ts ❌
- Don't mix `fontWeight` with `fontFamily`
- Don't use random font sizes
- Don't use bold for everything
- Don't forget to import `FONTS` from the config file

---

## 🔄 Migration Cheat Sheet

| Old Code | New Code |
|----------|----------|
| `fontWeight: '400'` or none | `fontFamily: FONTS.regular` |
| `fontWeight: '500'` | `fontFamily: FONTS.medium` |
| `fontWeight: '600'` | `fontFamily: FONTS.semiBold` |
| `fontWeight: '700'` or `'bold'` | `fontFamily: FONTS.bold` |

---

## 📐 Typography Scale

Your app uses these font sizes consistently:

- **36px** - Very large display text (rare)
- **24px** - Main page titles
- **20px** - Large section headers
- **18px** - Section titles, modal headers
- **16px** - Body text, input fields, buttons
- **14px** - Labels, secondary text
- **12px** - Badges, metadata, timestamps

Always pair these sizes with appropriate font weights from Montserrat.

---

*Visual reference for Enspek Expo App typography using Montserrat font*
