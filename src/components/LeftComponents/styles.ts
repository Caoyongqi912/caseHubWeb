export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const borderRadius = {
  xs: 2,
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
  xxl: 16,
  round: 9999,
};

export const shadows = {
  none: 'none',
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px 0 rgba(0, 0, 0, 0.04)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.02)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.04)',
  card: '0 2px 8px rgba(0, 0, 0, 0.06)',
  cardHover: '0 4px 12px rgba(0, 0, 0, 0.10)',
  dropdown:
    '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
  glow: '0 0 20px rgba(0, 0, 0, 0.1)',
};

export const typography = {
  fontSize: {
    xs: 11,
    sm: 12,
    base: 13,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    xxxl: 24,
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const transitions = {
  duration: {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  timing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    linear: 'linear',
    cubic: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  default: 'all 200ms ease-in-out',
  fast: 'all 150ms ease-in-out',
  slow: 'all 300ms ease-in-out',
  cubic: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
};

export const styleHelpers = {
  transition: (
    properties: string[] = ['all'],
    duration: string = '200ms',
    timing: string = 'ease-in-out',
  ) => {
    return {
      transition: properties
        .map((prop) => `${prop} ${duration} ${timing}`)
        .join(', '),
    };
  },
  truncate: (lines: number = 1) => {
    return {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      display: '-webkit-box',
      WebkitLineClamp: lines,
      WebkitBoxOrient: 'vertical' as const,
    };
  },
  flexCenter: () => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),
  cardStyle: (token: any) => ({
    borderRadius: borderRadius.xl,
    border: `1px solid ${token.colorBorder}`,
    boxShadow: shadows.card,
    ...styleHelpers.transition(
      ['box-shadow', 'transform'],
      '200ms',
      'cubic-bezier(0.4, 0, 0.2, 1)',
    ),
    ':hover': {
      boxShadow: shadows.cardHover,
      transform: 'translateY(-2px)',
    },
  }),
  buttonPrimary: (token: any) => ({
    borderRadius: borderRadius.md,
    fontWeight: typography.fontWeight.medium,
    boxShadow: shadows.sm,
    ...styleHelpers.transition(
      ['box-shadow', 'transform', 'background-color'],
      '200ms',
      'cubic-bezier(0.4, 0, 0.2, 1)',
    ),
    ':hover': {
      boxShadow: shadows.md,
      transform: 'translateY(-1px)',
    },
    ':active': {
      transform: 'translateY(0)',
    },
  }),
  iconButton: (token: any, color: string = token.colorTextSecondary) => ({
    borderRadius: borderRadius.round,
    width: 28,
    height: 28,
    minWidth: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color,
    ...styleHelpers.transition(
      ['background-color', 'color'],
      '150ms',
      'ease-in-out',
    ),
    ':hover': {
      backgroundColor: token.colorBgContainer,
      color: token.colorText,
    },
  }),
  gradientBorder: (token: any, color: string = token.colorPrimary) => ({
    position: 'relative' as const,
    background: token.colorBgContainer,
    borderRadius: borderRadius.xl,
    '::before': {
      content: '""',
      position: 'absolute' as const,
      inset: 0,
      borderRadius: borderRadius.xl,
      padding: '1px',
      background: `linear-gradient(135deg, ${color} 0%, ${token.colorPrimaryBg} 100%)`,
      WebkitMask:
        'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
      WebkitMaskComposite: 'xor' as const,
      maskComposite: 'exclude' as const,
      pointerEvents: 'none' as const,
    },
  }),
  glassEffect: (token: any) => ({
    background: `rgba(255, 255, 255, 0.8)`,
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: `1px solid ${token.colorBorderSecondary}`,
  }),
  shimmer: () => ({
    position: 'relative' as const,
    overflow: 'hidden' as const,
    '::after': {
      content: '""',
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background:
        'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
      transform: 'translateX(-100%)',
      animation: 'shimmer 2s infinite',
    },
    '@keyframes shimmer': {
      '0%': { transform: 'translateX(-100%)' },
      '100%': { transform: 'translateX(100%)' },
    },
  }),
};

export const responsive = {
  mobile: '@media (max-width: 768px)',
  tablet: '@media (min-width: 769px) and (max-width: 1024px)',
  desktop: '@media (min-width: 1025px)',
};

export const animations = {
  fadeIn: {
    animation: 'fadeIn 0.3s ease-in-out',
    '@keyframes fadeIn': {
      '0%': { opacity: 0 },
      '100%': { opacity: 1 },
    },
  },
  slideIn: {
    animation: 'slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '@keyframes slideIn': {
      '0%': { transform: 'translateX(-20px)', opacity: 0 },
      '100%': { transform: 'translateX(0)', opacity: 1 },
    },
  },
  scaleIn: {
    animation: 'scaleIn 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    '@keyframes scaleIn': {
      '0%': { transform: 'scale(0.95)', opacity: 0 },
      '100%': { transform: 'scale(1)', opacity: 1 },
    },
  },
  bounce: {
    animation: 'bounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    '@keyframes bounce': {
      '0%, 100%': { transform: 'translateY(0)' },
      '50%': { transform: 'translateY(-5px)' },
    },
  },
};
