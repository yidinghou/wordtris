/**
 * Game configuration constants
 * Centralized place to modify game settings like board size, tile counts, etc.
 */
export const GameConfig = {
  // Board dimensions
  ROWS: 6,
  COLS: 7, 
  
  // Tile settings
  TILE_COUNT: 100,
  MIN_WORD_LENGTH: 3,
  MAX_WORD_LENGTH: 7,
  
  // Animation timing (milliseconds)
  TILE_DROP_SPEED: 50,
  TILE_FALL_SPEED: 100,
  HIGHLIGHT_DURATION: 300,
  SHAKE_DURATION: 800,
  GLOW_DURATION: 1000,
  
  // UI settings
  PREVIEW_COUNT: 3,
  MAX_MADE_WORDS: 10,
  
  // Themes
  DEFAULT_THEME: 'theme-red',
  
  // Tile size for responsive design
  TILE_SIZE: 60,
  TILE_SIZE_MOBILE: 45
};