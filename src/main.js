import { GameController } from './game/gameController.js';
import { WordHandler } from './game/wordHandler.js';

/**
 * Initialize the Wordtris game when DOM is loaded
 * This is the main entry point that sets up all game components
 */
document.addEventListener('DOMContentLoaded', () => {
  // Initialize the game controller which handles all game logic
  const gameController = new GameController();
  
  // Initialize the word handler which manages word detection and processing
  const wordHandler = new WordHandler(gameController);
  
  // Bind word handler to game controller so they can communicate
  gameController.handleWordFound = wordHandler.handleWordFound.bind(wordHandler);
  
  console.log('🎮 Wordtris game initialized successfully!');
});