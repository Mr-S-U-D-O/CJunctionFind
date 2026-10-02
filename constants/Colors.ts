// Design tokens for CJunctionFinder (2025/2026 Premium Vibe)
const PRIMARY = '#111111';       // Black for primary actions
const ACCENT = '#FFC107';        // Gold accent for press states/highlights
const BACKGROUND = '#F9FAFB';    // Soft off-white for the screen background
const CARD = '#FFFFFF';          // Pure white for the centered cards
const SURFACE = '#F3F4F6';       // Grey for input backgrounds
const BORDER = '#E5E7EB';        // Light border
const TEXT = '#111827';          // Very dark grey/black
const TEXT_MUTED = '#6B7280';    // Neutral grey
const ERROR = '#EF4444';         // Modern red for validation

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
    tabIconDefault: TEXT_MUTED,
    tabIconSelected: PRIMARY,
    success: '#10B981',
    overlay: 'rgba(17, 24, 39, 0.4)',
  },
};

export type ColorScheme = typeof Colors.light;
