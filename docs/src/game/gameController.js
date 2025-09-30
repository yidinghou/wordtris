import { Board } from './board.js';
import { TileGenerator } from './tileGenerator.js';
import { UI } from './ui.js';
import { WordValidator } from './wordValidator.js';
import { InputController } from './inputController.js';
import { Scoring } from './scoring.js';
import { Animations } from './animation.js';
import { GameConfig } from './gameConfig.js';
import { createEmptyBoard, findDropRow } from '../utils/gameUtils.js';

/**
 * Main game controller that orchestrates all game components and handles user interactions
 */
export class GameController {
  constructor() {
    this.initializeDOMElements();
    this.initializeGameComponents();
    this.initializeEventHandlers();
    this.initializeUI();
  }

  initializeDOMElements() {
    this.gameBoard = document.getElementById('game-board');
    this.spawnRow = document.getElementById('spawn-row');
    this.previewContainer = document.getElementById('preview-container');
    this.madeWordsList = document.getElementById('made-words-list');
  }

  initializeGameComponents() {
    // Game state object using configuration
    this.game = {
      rows: GameConfig.ROWS,
      cols: GameConfig.COLS,
      board: createEmptyBoard(),
      
      getTile(row, col) {
        return this.board[row] && this.board[row][col] ? this.board[row][col] : null;
      },
      
      setTile(row, col, letter) {
        if (this.board[row]) {
          this.board[row][col] = letter;
        }
      },
      
      clearTile(row, col) {
        if (this.board[row]) {
          this.board[row][col] = null;
        }
      },
      
      isColumnFull(col) {
        return this.board[0][col] !== null;
      },
      
      dropTile(col, letter) {
        for (let row = this.rows - 1; row >= 0; row--) {
          if (!this.board[row][col]) {
            this.board[row][col] = letter;
            return row;
          }
        }
        return -1;
      },
      
      resetBoard() {
        this.board = createEmptyBoard();
      }
    };

    // Initialize components with configuration
    this.board = new Board(this.game, this.gameBoard, this.spawnRow);
    this.tileGenerator = new TileGenerator(GameConfig.TILE_COUNT);
    this.ui = new UI(this.previewContainer);
    this.wordValidator = new WordValidator(GameConfig.MIN_WORD_LENGTH);
    this.inputController = new InputController();
    this.scoring = new Scoring();
    // Note: Animations uses static methods, no need to instantiate
    
    this.mouseEnteredGameBoard = false;
  }

  initializeEventHandlers() {
    this.gameBoard.addEventListener('click', this.handleGameBoardClick.bind(this));
    this.gameBoard.addEventListener('mousemove', this.handleGameBoardMouseMove.bind(this));
    this.gameBoard.addEventListener('mouseleave', this.handleGameBoardMouseLeave.bind(this));
    this.spawnRow.addEventListener('mousemove', this.handleSpawnRowMouseMove.bind(this));
    this.spawnRow.addEventListener('mouseleave', this.handleSpawnRowMouseLeave.bind(this));
  }

  initializeUI() {
    this.ui.updatePreview(this.tileGenerator.tiles.slice(0, GameConfig.PREVIEW_COUNT));
    this.animatePreviewTiles();
    document.body.classList.add(GameConfig.DEFAULT_THEME);
    this.hideSpawnRowTiles();
    this.updateLettersRemainingCounter();
  }

  // Event handler methods
  handleGameBoardClick(e) {
    if (!this.inputController.isEnabled()) return;
    
    const col = e.target.dataset.col;
    if (col) {
      this.dropTile(col);
    }
  }

  handleGameBoardMouseMove(e) {
    if (!this.inputController.isEnabled()) return;

    const col = e.target.dataset.col;
    if (col !== undefined) {
      if (!this.mouseEnteredGameBoard) {
        this.mouseEnteredGameBoard = true;
      }

      this.ui.updateSpawnRow(col, this.tileGenerator.tiles[this.tileGenerator.currentIndex]);
      this.updateSpawnRowVisibility(parseInt(col));
    }
  }

  handleGameBoardMouseLeave(e) {
    const boardRect = this.gameBoard.getBoundingClientRect();
    let clampCol = e.clientX > boardRect.left + boardRect.width / 2 ? 
                   this.game.cols - 1 : 0;

    this.ui.updateSpawnRow(clampCol, this.tileGenerator.tiles[this.tileGenerator.currentIndex]);
    this.updateSpawnRowVisibility(clampCol);
  }

  handleSpawnRowMouseMove(e) {
    if (!this.inputController.isEnabled()) return;

    const col = e.target.dataset.col;
    if (col !== undefined) {
      this.ui.updateSpawnRow(parseInt(col), this.tileGenerator.tiles[this.tileGenerator.currentIndex]);
      this.updateSpawnRowVisibility(parseInt(col));
    }
  }

  handleSpawnRowMouseLeave() {
    this.ui.clearSpawnRow();
    this.hideSpawnRowTiles();
  }

  // Game logic methods
  dropTile(col) {
    if (!this.inputController.isEnabled()) return;

    if (this.game.isColumnFull(col)) {
      alert('Game Over! The column is full.');
      this.resetGame();
      return;
    }

    const letter = this.tileGenerator.getNextTile();
    const targetRow = findDropRow(this.game.board, col);

    if (targetRow !== -1) {
      this.inputController.disable();

      // Play the tile drop sound
      const dropSound = new Audio('./src/tile-drop.mp3');
      dropSound.play();
 
      // Clear the spawn tile immediately when dropping starts
      this.ui.clearSpawnRow();

      // Start animation first, then update game state when animation completes
      Animations.animateTileDrop(this.board, targetRow, col, letter, () => {
        // Now update the game state after animation
        this.game.setTile(targetRow, col, letter);
        
        this.wordValidator.checkWords(this.game, this.board, targetRow, col, this.handleWordFound.bind(this));

        if (!this.wordValidator.wordFound) {
          this.ui.updateSpawnRowWithDrop(col, this.tileGenerator.tiles[this.tileGenerator.currentIndex]);
          
          // Delay the glow effect to happen after the drop-in animation
          setTimeout(() => {
            this.glowSpawnTile(col);
          }, 400);
        }

        this.updatePreviewAndCounter();
        this.inputController.enable();
      });
    }
  }

  resetGame() {
    this.game.resetBoard();
    this.board.resetBoard();
    this.scoring.resetScore();
    this.inputController.enable();
    this.clearMadeWordsList();
    this.updateLettersRemainingCounter();
  }

  // Helper methods
  updatePreviewAndCounter() {
    this.ui.updatePreview(this.tileGenerator.tiles.slice(
      this.tileGenerator.currentIndex + 1, 
      this.tileGenerator.currentIndex + 1 + GameConfig.PREVIEW_COUNT
    ));
    this.animatePreviewTiles();
    this.updateLettersRemainingCounter();
  }

  animatePreviewTiles() {
    Array.from(this.previewContainer.children).forEach(tile => {
      tile.classList.add('preview-animate-up');
      tile.addEventListener('animationend', () => {
        tile.classList.remove('preview-animate-up');
      }, { once: true });
    });
  }

  hideSpawnRowTiles() {
    Array.from(this.spawnRow.children).forEach(tile => {
      tile.classList.add('spawn-invisible');
      tile.classList.remove('spawn-active');
    });
  }

  updateSpawnRowVisibility(activeCol) {
    Array.from(this.spawnRow.children).forEach((tile, idx) => {
      if (idx !== activeCol) {
        tile.classList.add('spawn-invisible');
        tile.classList.remove('spawn-active');
      } else {
        tile.classList.remove('spawn-invisible');
        tile.classList.add('spawn-active');
      }
    });
  }

  updateLettersRemainingCounter() {
    const counter = document.getElementById('letters-remaining-counter');
    const remaining = this.tileGenerator.tiles.length - this.tileGenerator.currentIndex;
    if (counter) {
      counter.textContent = remaining;
    }
  }

  glowSpawnTile(col) {
    const tile = this.spawnRow.children[col];
    if (tile) {
      tile.classList.add('spawn-glow');
      setTimeout(() => {
        tile.classList.remove('spawn-glow');
      }, GameConfig.GLOW_DURATION);
    }
  }

  clearMadeWordsList() {
    this.madeWordsList.innerHTML = '';
  }

  // This will be bound to WordHandler instance
  handleWordFound(tiles, word) {
    // This method will be overridden by WordHandler
    console.log('WordHandler not yet bound');
  }
}