#!/bin/bash

# Script to find all components that need Montserrat font updates
# Run this to see which files still use fontWeight and need updating

echo "🔍 Finding files with fontWeight that need Montserrat font updates..."
echo ""
echo "=================================================="
echo "Files with fontWeight in StyleSheets:"
echo "=================================================="

# Search for files with fontWeight in app directory
grep -r "fontWeight:" app/ --include="*.tsx" --include="*.ts" -l | while read file; do
  count=$(grep -c "fontWeight:" "$file")
  echo "📄 $file ($count occurrences)"
done

echo ""
echo "=================================================="
echo "Files with fontWeight in src directory:"
echo "=================================================="

# Search for files with fontWeight in src directory
grep -r "fontWeight:" src/ --include="*.tsx" --include="*.ts" -l 2>/dev/null | while read file; do
  count=$(grep -c "fontWeight:" "$file")
  echo "📄 $file ($count occurrences)"
done

echo ""
echo "=================================================="
echo "Quick Replacement Guide:"
echo "=================================================="
echo ""
echo "1. Add import at top of file:"
echo "   import { FONTS } from '../path/to/src/config/fonts';"
echo ""
echo "2. Replace fontWeight with fontFamily:"
echo "   fontWeight: '400' or default  →  fontFamily: FONTS.regular"
echo "   fontWeight: '500'              →  fontFamily: FONTS.medium"
echo "   fontWeight: '600'              →  fontFamily: FONTS.semiBold"
echo "   fontWeight: '700' or 'bold'    →  fontFamily: FONTS.bold"
echo ""
echo "3. Remove the fontWeight line entirely after adding fontFamily"
echo ""
echo "=================================================="
echo "✅ Job details screen ([id].tsx) has been updated!"
echo "=================================================="
