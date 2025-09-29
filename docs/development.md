# Game Development Guide

## Architecture Overview

The Wordtris game follows a modular architecture with clear separation of concerns:

### Core Components

1. **GameEngine** (`src/game/gameEngine.js`)
   - Main game loop and coordination
   - Input handling and event management
   - Rendering coordination

2. **GameState** (`src/game/gameState.js`)
   - Score, level, and statistics tracking
   - Game flow management (start, pause, end)
   - Event notifications

3. **GameBoard** (`src/game/gameBoard.js`)
   - Grid management and collision detection
   - Word detection and clearing logic
   - Gravity simulation

4. **WordPiece** (`src/game/wordPiece.js`)
   - Individual falling piece logic
   - Rotation and movement mechanics
   - Rendering and positioning

5. **Utilities** (`src/utils/helpers.js`)
   - Common utility functions
   - Word validation logic
   - Mathematical helpers

## Adding New Features

### Adding New Word Lists
```javascript
// In src/game/wordPiece.js
const themeWords = {
    animals: ['CAT', 'DOG', 'BIRD', 'FISH'],
    colors: ['RED', 'BLUE', 'GREEN', 'YELLOW'],
    food: ['CAKE', 'PIZZA', 'APPLE', 'BREAD']
};
```

### Custom Scoring Systems
```javascript
// In src/game/gameState.js
recordWord(word, letters) {
    // Custom scoring logic here
    const points = this.calculateCustomScore(word);
    this.addScore(points);
}
```

### New Game Modes
```javascript
// Add to GameEngine
setGameMode(mode) {
    switch(mode) {
        case 'timed':
            this.setupTimedMode();
            break;
        case 'endless':
            this.setupEndlessMode();
            break;
    }
}
```

## Performance Considerations

- Canvas rendering is optimized for 60 FPS
- Game state updates are batched
- Memory usage is managed through object pooling for pieces
- DOM updates are minimized and debounced

## Browser Compatibility

- Requires ES6+ support
- HTML5 Canvas required
- Local storage for high scores (optional)
- Web Audio API for sound effects (optional)

## Testing

Test the game in different scenarios:
- Different screen sizes and aspect ratios
- Various word combinations and edge cases
- Performance under continuous gameplay
- Memory usage over extended sessions