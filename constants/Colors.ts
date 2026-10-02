// Design tokens for CJunctionFinder (2026 Premium Vibe)
const PRIMARY = '#171717';       // Near black for premium contrast
const ACCENT = '#D4AF37';        // Gold accent for press states/highlights
const BACKGROUND = '#F9FAFB';    // Soft off-white for the screen background
const CARD = '#FFFFFF';          // Pure white for cards and surfaces
const SURFACE = '#FFFFFF';       // Pure white 
const BORDER = '#E5E5E5';        // Light, subtle border
const TEXT = '#171717';          // Very dark grey/black
const TEXT_MUTED = '#737373';    // Neutral, elegant grey
const ERROR = '#DC2626';         // Modern red for validation and markdown
const SUCCESS = '#16A34A';       // Modern green

export const Colors = {
  light: {
    primary: PRIMARY,
    accent: ACCENT,
    background: BACKGROUND,
    card: CARD,
    surface: SURFACE,
    border: BORDER,
    text: TEXT,
    textMuted: TEXT_MUTED,
    error: ERROR,
    success: SUCCESS,
    tabIconDefault: TEXT_MUTED,
    tabIconSelected: PRIMARY,
    overlay: 'rgba(23, 23, 23, 0.4)',
  },
};

export type ColorScheme = typeof Colors.light;
