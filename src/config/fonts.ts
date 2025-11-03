// Font family configuration for the app
export const FONTS = {
  regular: 'Montserrat-Regular',
  medium: 'Montserrat-Medium',
  semiBold: 'Montserrat-SemiBold',
  bold: 'Montserrat-Bold',
};

// Helper function to get font family based on weight
export const getFontFamily = (weight?: string | number): string => {
  if (!weight) return FONTS.regular;
  
  const weightNum = typeof weight === 'string' ? parseInt(weight) : weight;
  
  if (weightNum >= 700 || weight === 'bold') return FONTS.bold;
  if (weightNum >= 600) return FONTS.semiBold;
  if (weightNum >= 500) return FONTS.medium;
  
  return FONTS.regular;
};
