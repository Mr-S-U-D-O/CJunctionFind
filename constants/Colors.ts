// Design tokens for CJunctionFind
// Brand: Clothing Junction — deep chocolate brown + warm gold
// Aesthetic: premium utilitarian, editorial minimalism

const PRIMARY = '#4A2C0A';       // Chocolate brown
const ACCENT = '#C9A227';        // Warm gold
const CANVAS = '#F9F7F3';        // Off-white canvas
const SURFACE = '#FFFFFF';       // Pure white for inputs/cards
const BORDER = '#E8DDD3';        // Warm light border
const TEXT = '#1C1008';          // Near-black, warm undertone
const TEXT_MUTED = '#8A7060';    // Muted brown-grey
const ERROR = '#B33A26';         // Deep red, brand-warm

export const Colors = {
  light: {
    primary: PRIMARY,
    accent: ACCENT,
    background: CANVAS,
    surface: SURFACE,
    border: BORDER,
    text: TEXT,
    textMuted: TEXT_MUTED,
    error: ERROR,
    tabIconDefault: TEXT_MUTED,
    tabIconSelected: PRIMARY,
    // Semantic
    success: '#2E6B3E',
    // Scrim
    overlay: 'rgba(28, 16, 8, 0.5)',
  },
};

export type ColorScheme = typeof Colors.light;
