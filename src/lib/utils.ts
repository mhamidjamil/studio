
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { PREDEFINED_COLORS, type PredefinedColor } from '@/lib/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const isValidHex = (color: string): boolean => /^#([0-9a-f]{3}){1,2}$/i.test(color);

export function resolveColorToHexOrOff(colorString: string | undefined): string {
  if (colorString === undefined || colorString === null || colorString.trim() === '') {
    const whiteDefault = PREDEFINED_COLORS.find(c => c.value.toLowerCase() === 'white');
    return whiteDefault ? whiteDefault.hex : '#ffffff';
  }

  const lowerColorString = colorString.toLowerCase();

  if (lowerColorString === 'off') {
    return 'off';
  }

  if (isValidHex(lowerColorString)) {
    return lowerColorString;
  }

  const predefinedColor = PREDEFINED_COLORS.find(
    pc => pc.name.toLowerCase() === lowerColorString || pc.value.toLowerCase() === lowerColorString
  );

  if (predefinedColor) {
    return predefinedColor.hex; 
  }
  
  // Attempt to convert known CSS color names to hex if not in predefined list
  // This part is client-side only and best-effort.
  // Prefer AI to return hex directly.
  if (typeof document !== 'undefined') {
    const tempDiv = document.createElement('div');
    tempDiv.style.color = lowerColorString; // Assign the color name
    // Get the computed style, which might be rgb() or rgba()
    const computedColor = window.getComputedStyle(tempDiv).color;
    
    if (computedColor.startsWith('rgb')) {
      const rgbMatch = computedColor.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
      if (rgbMatch) {
        try {
          const r = parseInt(rgbMatch[1]).toString(16).padStart(2, '0');
          const g = parseInt(rgbMatch[2]).toString(16).padStart(2, '0');
          const b = parseInt(rgbMatch[3]).toString(16).padStart(2, '0');
          return `#${r}${g}${b}`.toLowerCase();
        } catch (e) {
          // Parsing failed, fall through
        }
      }
    }
  }

  // Fallback for completely unknown names if conversion fails or not possible server-side
  const whiteFallback = PREDEFINED_COLORS.find(c => c.value.toLowerCase() === 'white');
  return whiteFallback ? whiteFallback.hex : '#ffffff';
}
