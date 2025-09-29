# Wordtris

A modern JavaScript word puzzle game that combines the mechanics of Tetris with word formation. Players must arrange falling letter pieces to form complete words and score points.

## 🎮 How to Play

- **Objective**: Form complete words by arranging falling letter pieces
- **Controls**:
  - `← →` Arrow keys to move pieces left/right
  - `↓` Arrow key to move pieces down faster
  - `↑` Arrow key or `Space` to rotate pieces
  - `C` key to instantly drop pieces
- **Scoring**: Form words of 3+ letters horizontally or vertically to score points
- **Goal**: Don't let the pieces reach the top!

## 🚀 Getting Started

1. Clone or download this repository
2. Open `index.html` in a modern web browser
3. Click "Start Game" to begin playing
4. Use the controls to arrange falling word pieces

## 📁 Project Structure

```
wordtris/
├── index.html              # Main HTML file
├── styles/                 # CSS stylesheets
│   ├── main.css           # Main application styles
│   └── game.css           # Game-specific styles
├── src/                   # JavaScript source code
│   ├── main.js            # Main application entry point
│   ├── utils/             # Utility functions
│   │   └── helpers.js     # Helper functions
│   └── game/              # Game logic modules
│       ├── gameState.js   # Game state management
│       ├── gameBoard.js   # Game board logic
│       ├── wordPiece.js   # Word piece management
│       └── gameEngine.js  # Main game engine
├── assets/                # Game assets
│   ├── images/            # Image files
│   ├── sounds/            # Sound files
│   └── fonts/             # Font files
├── public/                # Public assets
├── docs/                  # Documentation
└── .github/               # GitHub configuration
    └── copilot-instructions.md
```

## 🎯 Features

- **Modern JavaScript**: Built with ES6+ features and clean, modular code
- **Responsive Design**: Works on desktop and mobile devices
- **Word Validation**: Basic word dictionary for validating formed words
- **Progressive Difficulty**: Speed increases with level progression
- **Score System**: Points awarded based on word length and level
- **Visual Feedback**: Ghost pieces show where pieces will land
- **Game Statistics**: Track words formed, longest word, and more

## 🛠️ Technical Details

- **Pure JavaScript**: No external frameworks or dependencies
- **HTML5 Canvas**: Smooth rendering and animations
- **Modular Architecture**: Clean separation of concerns
- **Event-Driven**: Responsive to user input and game events
- **Mobile-Friendly**: Responsive design for various screen sizes

## 🎨 Customization

### Adding New Words
Edit the word arrays in `src/game/wordPiece.js` to add new words that can appear as falling pieces.

### Modifying Difficulty
Adjust the scoring and speed progression in `src/game/gameState.js`.

### Styling Changes
Modify the CSS files in the `styles/` directory to change the visual appearance.

### Game Rules
The main game logic is in `src/game/gameEngine.js` and can be modified to change gameplay mechanics.

## 🔧 Development

### Local Development
Simply open `index.html` in a web browser. No build process required.

### Adding Features
1. Create new modules in the appropriate directories
2. Import them in `index.html` or reference them in existing modules
3. Follow the existing code patterns and architecture

### Browser Compatibility
- Modern browsers with ES6+ support
- HTML5 Canvas support required
- Tested on Chrome, Firefox, Safari, and Edge

## 📚 Game Mechanics

### Word Formation
- Words must be 3+ letters long
- Can be formed horizontally or vertically
- Words are cleared immediately when formed
- Remaining letters fall due to gravity

### Scoring System
- Base points: 10 per word
- Length bonus: 5 points per letter
- Level multiplier applied to final score
- Bonus points for simultaneous word formations

### Level Progression
- Levels increase every 1000 points
- Fall speed increases with each level
- Maximum difficulty cap to maintain playability

## 🤝 Contributing

Feel free to submit issues, suggestions, or pull requests to improve the game!

## 📄 License

This project is open source and available under the MIT License.