# Noodel 🍝

A word-formation puzzle game that combines elements of Tetris-style tile dropping with word creation mechanics. Players drop letter tiles onto a 7×6 grid to form words in multiple directions, earning points based on letter values and word length.

## 🎮 How to Play

### Objective
Form words by dropping letter tiles onto the game board. Valid words are automatically detected and cleared, making space for more tiles. The game ends when you run out of tiles or the board fills up.

### Gameplay Mechanics
- **Tile Dropping**: Letter tiles spawn in the center column and can be moved horizontally before dropping
- **Word Formation**: Create words of 3+ letters in any direction:
  - Horizontal (left to right)
  - Vertical (top to bottom) 
  - Diagonal (both directions)
- **Auto-Detection**: Valid words are automatically highlighted, scored, and cleared
- **Tile Physics**: When words are cleared, remaining tiles fall down to fill empty spaces
- **Scoring**: Earn points based on Scrabble-like letter values and word length

### Controls
- **Mouse Movement**: Move tiles horizontally across columns
- **Mouse Click**: Drop tile into selected column
- **Mobile**: Touch and drag supported with responsive design

## 🎯 Features

### Core Gameplay
- **7×6 Game Board**: Strategic grid size for optimal word formation
- **Multi-Directional Words**: Form words horizontally, vertically, and diagonally
- **Smart Word Validation**: Uses comprehensive dictionary for word verification
- **Dynamic Scoring**: Scrabble-based point system with letter rarity values
- **Tile Generation**: Intelligent letter distribution for balanced gameplay

### Visual & Audio
- **Smooth Animations**: 
  - Tile drop animations with bouncy physics
  - Word clearing effects with highlights and shakes
  - Falling tile cascades after word removal
  - Spawn row drop-in animations
- **Multiple Themes**: Default, Red, and Blue color schemes
- **Responsive Design**: Mobile-optimized with touch controls
- **Visual Feedback**: Tile highlighting, glow effects, and score animations

### Game Management
- **Preview System**: Shows next 3 letters in the queue
- **Score Tracking**: Real-time score updates and display
- **Letters Counter**: Track remaining tiles (100 total)
- **Word History**: Display recently formed words
- **Game Reset**: Start fresh games without page reload

## 🛠️ Technical Details

### Architecture
- **Vanilla JavaScript**: No frameworks, pure ES6+ modules
- **Component-Based**: Modular classes for game logic, UI, animations
- **Responsive CSS**: Mobile-first design with viewport-based scaling
- **Local Development**: Simple HTTP server for testing

### Key Components
```
src/game/
├── gameController.js    # Main game orchestration
├── gameConfig.js       # Configuration constants
├── board.js           # Game board management
├── tileGenerator.js   # Letter tile generation
├── wordValidator.js   # Word detection & validation
├── wordHandler.js     # Word clearing & animations
├── scoring.js         # Point calculation system
├── animation.js       # Visual effects & transitions
├── ui.js             # User interface management
└── inputController.js # Input handling & controls
```

### Dictionary & Validation
- **Comprehensive Word List**: Built-in dictionary for word validation
- **Multiple Directions**: Checks horizontal, vertical, and diagonal words
- **Minimum Length**: 3-letter minimum for valid words
- **Smart Detection**: Finds words automatically as tiles are placed

## 🚀 Getting Started

### Prerequisites
- Modern web browser with ES6+ support
- Local web server (for CORS compliance)

### Installation & Setup
1. **Clone the repository**
   ```bash
   git clone https://github.com/yidinghou/wordtris.git
   cd wordtris
   ```

2. **Start local server**
   ```bash
   # Using Python
   python -m http.server 8080
   
   # Using Node.js
   npx serve docs
   
   # Using PHP
   php -S localhost:8080 -t docs
   ```

3. **Open in browser**
   ```
   http://localhost:8080
   ```

### Project Structure
```
wordtris/
├── docs/                 # Game files (GitHub Pages ready)
│   ├── index.html       # Main game page
│   ├── src/game/        # JavaScript modules
│   ├── styles/          # CSS stylesheets
│   ├── assets/          # Game assets
│   └── dict.csv         # Word dictionary
├── .github/             # GitHub configuration
├── assets/              # Development assets
└── public/              # Additional resources
```

## 🎨 Customization

### Themes
The game includes multiple visual themes that can be switched:
- **Default**: Clean white tiles on gray board
- **Red Theme**: Warm red color scheme
- **Blue Theme**: Cool blue color palette

### Configuration
Key game parameters can be modified in `gameConfig.js`:
- **Board Size**: Rows/columns (currently 6×7)
- **Tile Count**: Total letters available (100)
- **Animation Speeds**: Drop, fall, and highlight timing
- **Word Limits**: Minimum/maximum word lengths
- **Preview Count**: Number of upcoming tiles shown

## 🔧 Development

### Code Organization
- **ES6 Modules**: Clean imports/exports for maintainability
- **Class-Based**: Object-oriented design with clear responsibilities
- **Event-Driven**: Reactive architecture for smooth gameplay
- **Mobile-First**: Responsive design principles throughout

### Adding Features
- **New Animations**: Extend the `Animations` class
- **Custom Themes**: Add CSS variables in `themes.css`
- **Game Modes**: Modify `gameController.js` for variants
- **Dictionary**: Update `dict.csv` for different word lists

### Performance Optimizations
- **Efficient Word Checking**: Optimized algorithms for real-time validation
- **Smart Animations**: RequestAnimationFrame for smooth visuals
- **Responsive Scaling**: Viewport-based sizing for all devices
- **Memory Management**: Proper cleanup of event listeners and intervals

## 📱 Browser Support
- **Modern Browsers**: Chrome, Firefox, Safari, Edge (ES6+ required)
- **Mobile**: iOS Safari, Android Chrome with touch support
- **Responsive**: Adapts to screen sizes from 320px to desktop
- **No Dependencies**: Works offline after initial load

## 🤝 Contributing
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License
This project is open source and available under the [MIT License](LICENSE).

## 🎯 Future Enhancements
- **Power-ups**: Special tiles with unique effects
- **Multiplayer**: Online competitive gameplay
- **Achievements**: Goal-based progression system
- **Sound Effects**: Audio feedback for actions
- **Leaderboards**: High score tracking and sharing
- **Custom Dictionaries**: Player-selectable word lists