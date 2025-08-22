// Professional Design System - Corporate & Serious Style

// DESIGN_SYSTEM export with professional styling
export const DESIGN_SYSTEM = {
  colors: {
    // Core brand colors only - no gradients
    primary: '#4f46e5',
    primaryHover: '#4338ca',
    
    secondary: '#475569',
    secondaryHover: '#334155',
    
    success: '#16a34a',
    successHover: '#15803d',
    
    danger: '#dc2626',
    dangerHover: '#b91c1c',
    
    background: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      tertiary: '#f1f5f9'
    },
    
    text: {
      primary: '#0f172a',
      secondary: '#475569',
      tertiary: '#64748b',
      inverse: '#ffffff',
      disabled: '#94a3b8'
    },
    
    border: {
      primary: '#e2e8f0',
      secondary: '#cbd5e1',
      focus: '#4f46e5'
    }
  },
  
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
    
    h1: {
      fontSize: '2.5rem',
      fontWeight: '800', // Extra bold
      lineHeight: '1.2'
    },
    
    h2: {
      fontSize: '2rem',
      fontWeight: '700', // Bold
      lineHeight: '1.3'
    },
    
    h3: {
      fontSize: '1.5rem',
      fontWeight: '700', // Bold
      lineHeight: '1.4'
    },
    
    body: {
      fontSize: '1rem',
      fontWeight: '500', // Medium weight
      lineHeight: '1.6'
    },
    
    caption: {
      fontSize: '0.875rem',
      fontWeight: '500', // Medium weight
      lineHeight: '1.5'
    }
  },
  
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
    '4xl': '6rem',   // 96px
  },
  
  borderRadius: {
    none: '0',
    sm: '0.25rem',   // 4px
    md: '0.375rem',  // 6px
    lg: '0.5rem',    // 8px
    xl: '0.75rem',   // 12px
    '2xl': '1rem',   // 16px
    '3xl': '1.5rem', // 24px
    full: '9999px',
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  },
  
  modal: {
    overlay: {
      backgroundColor: 'rgba(15, 23, 42, 0.75)'
    },
    content: {
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '1rem',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
    }
  }
};

// Compatibility exports for legacy components (temporary)
export const colors = {
  primary: { 
    50: '#f0f4ff',
    100: '#f0f4ff',
    200: '#e0e9ff', 
    300: '#c7d7fe',
    400: '#a4bcfd',
    500: '#6366f1',
    600: '#4f46e5',
    700: '#4338ca'
  },
  secondary: { 
    50: '#f8fafc',
    500: '#475569',
    700: '#334155'
  },
  success: {
    50: '#f0fdf4',
    500: '#16a34a',
    700: '#15803d'
  },
  gray: { 
    50: '#f9fafb', 
    100: '#f3f4f6', 
    200: '#e5e7eb', 
    300: '#d1d5db',
    400: '#9ca3af', 
    500: '#6b7280', 
    600: '#4b5563', 
    700: '#374151', 
    800: '#1f2937', 
    900: '#111827' 
  },
  error: { 
    50: '#fef2f2',
    200: '#fecaca',
    500: '#dc2626',
    700: '#991b1b'
  },
  gradients: { 
    primary: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)', 
    secondary: 'linear-gradient(135deg, #475569 0%, #64748b 100%)',
    blue: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    success: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
    danger: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)'
  }
};

export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem',
  '4xl': '6rem'
};

export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px rgba(0, 0, 0, 0.15)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
};

export const borderRadius = DESIGN_SYSTEM.borderRadius;

export const fontSize = {
  xs: '0.75rem', sm: '0.875rem', base: '1rem', lg: '1.125rem', xl: '1.25rem',
  '2xl': '1.5rem', '3xl': '1.875rem', '4xl': '2.25rem', '5xl': '3rem', '6xl': '3.75rem'
};

export const fontWeight = {
  normal: 400, medium: 500, semibold: 600, bold: 700
};

export const buttonStyles = {
  base: { padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: 500, border: 'none', cursor: 'pointer' },
  sizes: { 
    sm: { padding: '0.5rem 1rem', fontSize: '0.875rem' }, 
    md: { padding: '0.75rem 1.5rem', fontSize: '1rem' }, 
    lg: { padding: '1rem 2rem', fontSize: '1.125rem' } 
  },
  variants: { 
    primary: { backgroundColor: '#4f46e5', color: '#ffffff' }, 
    secondary: { backgroundColor: '#475569', color: '#ffffff' },
    success: { backgroundColor: '#16a34a', color: '#ffffff' },
    danger: { backgroundColor: '#dc2626', color: '#ffffff' },
    ghost: { backgroundColor: 'transparent', color: '#4f46e5', border: '1px solid #4f46e5' },
    outline: { backgroundColor: 'transparent', color: '#475569', border: '1px solid #475569' }
  }
};

export const inputStyles = {
  base: { padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb', fontSize: '1rem' },
  focus: { borderColor: '#4f46e5', outline: 'none', boxShadow: '0 0 0 3px rgba(79, 70, 229, 0.1)' }
};

export const cardStyles = {
  base: { borderRadius: '0.5rem', padding: '1.5rem', backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  hover: { transform: 'translateY(-2px)', boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }
};
