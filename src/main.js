import { Board } from './game/board.js'
import { TileGenerator } from './game/tileGenerator.js'
import { UI } from './game/ui.js'
import { Animations } from './game/animation.js'
import { WordValidator } from './game/wordValidator.js'
import { InputController } from './game/inputController.js'
import { Scoring } from './game/scoring.js'

// Initialize DOM elements
const gameBoard = document.getElementById('game-board');
const spawnRow = document.getElementById('spawn-row');
const previewContainer = document.getElementById('preview-container');
const madeWordsList = document.getElementById('made-words-list');

// Initialize game components
// Simple game state object to replace Game class
const game = {
  rows: 8,
  cols: 7,
  board: Array(8).fill(null).map(() => Array(7).fill(null)),
  
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
    this.board = Array(8).fill(null).map(() => Array(7).fill(null));
  }
};

const board = new Board(game, gameBoard, spawnRow);
const tileGenerator = new TileGenerator(100);
const ui = new UI(previewContainer);
const wordValidator = new WordValidator();
const inputController = new InputController();
const scoring = new Scoring();
const animations = new Animations();

// Initialize UI
ui.updatePreview(tileGenerator.tiles.slice(0, 3)); // Show First 3 in preview
// Animate preview tiles on initial load
Array.from(previewContainer.children).forEach(tile => {
  tile.classList.add('preview-animate-up');
  tile.addEventListener('animationend', () => {
    tile.classList.remove('preview-animate-up');
  }, { once: true });
});
document.body.classList.add('theme-red');

// Make spawn row tiles invisible on load
Array.from(spawnRow.children).forEach(tile => {
  tile.classList.add('spawn-invisible');
  tile.classList.remove('spawn-active');
});

let mouseEnteredGameBoard = false;

// Event handlers
gameBoard.addEventListener('click', e => {
  if (!inputController.isEnabled()) return;

  const col = e.target.dataset.col;
  if (col) {
    // Main game functions
    function dropTile(col) { // 258
      if (!inputController.isEnabled()) return;

      if (game.isColumnFull(col)) {
        alert('Game Over! The column is full.');
        resetGame();
        return;
      }

      // Always use the next tile from tileGenerator for both board and spawn row
      const letter = tileGenerator.getNextTile();

      // Do NOT update preview here
      const row = game.dropTile(col, letter);

      if (row !== -1) {
        // Disable input during animation
        inputController.disable();

        Animations.animateTileDrop(board, row, col, letter, () => {
          wordValidator.checkWords(game, board, row, col, handleWordFound);

          // Re-enable input if no words were formed
          if (!wordValidator.wordFound) {
            // Only update spawn row if no word was found
            ui.updateSpawnRow(col, tileGenerator.tiles[tileGenerator.currentIndex]);
            glowSpawnTile(col);
          }

          // Update preview queue ONLY after letter is dropped and no word is found
          ui.updatePreview(tileGenerator.tiles.slice(tileGenerator.currentIndex + 1, tileGenerator.currentIndex + 4));
          Array.from(previewContainer.children).forEach(tile => {
            tile.classList.add('preview-animate-up');
            tile.addEventListener('animationend', () => {
              tile.classList.remove('preview-animate-up');
            }, { once: true });
          });

          updateLettersRemainingCounter();
          inputController.enable();
        });
      }

      // Remove preview update from here
    }

    dropTile(col);
  }
});

// Helper to clear made words list
function clearMadeWordsList() { // 234
  madeWordsList.innerHTML = '';
}

// Update letters remaining counter
function updateLettersRemainingCounter() { // 238
  const counter = document.getElementById('letters-remaining-counter');
  const remaining = tileGenerator.tiles.length - tileGenerator.currentIndex;
  if (counter) {
    counter.textContent = remaining;
  }
}

// Helper to apply glow effect to the active spawn tile
function glowSpawnTile(col) { // 248
  const tile = spawnRow.children[col];
  if (tile) {
    tile.classList.add('spawn-glow');
    setTimeout(() => {
      tile.classList.remove('spawn-glow');
    }, 1000);
  }
}

// Main word found handler
function handleWordFound(tiles, word) { // 302
  console.log('Highlighting tiles for word');
  inputController.disable();

  // Clear the spawn row before making the word
  ui.clearSpawnRow();
  Array.from(spawnRow.children).forEach(tile => {
    tile.classList.add('spawn-invisible');
    tile.classList.remove('spawn-active');
  });

  // Extract the word from tiles to calculate score
  word = '';
  tiles.forEach(tile => {
    word += tile.textContent;
  });

  // Score calculation happens ONLY here
  const pointsEarned = scoring.addPoints(word);
  console.log(`Scored ${pointsEarned} points for word: ${word}`);

  Animations.highlightAndClearTiles(tiles, clearedTiles => { // 323
    // Animate word flying to made words list after highlight/shake animation
    animateWordFlyToList(tiles, word, () => { // 391
      // Add word to made words list after animation
      addMadeWord(word);

      // Now update the spawn row after word is added to the list
      const lastCol = parseInt(tiles[tiles.length - 1].dataset.col);
      ui.updateSpawnRow(lastCol, tileGenerator.tiles[tileGenerator.currentIndex]);
      glowSpawnTile(lastCol);

      clearedTiles.forEach(tile => {
        const r = parseInt(tile.dataset.row);
        const c = parseInt(tile.dataset.col);
        game.clearTile(r, c);
        board.clearTileElement(tile);
      });

      // Update preview queue ONLY after clear/word animation
      ui.updatePreview(tileGenerator.tiles.slice(tileGenerator.currentIndex + 1, tileGenerator.currentIndex + 4));
      Array.from(previewContainer.children).forEach(tile => {
        tile.classList.add('preview-animate-up');
        tile.addEventListener('animationend', () => {
          tile.classList.remove('preview-animate-up');
        }, { once: true });
      });

      updateLettersRemainingCounter();

      Animations.animateTilesFalling(game, board, clearedTiles, () => { // 352
        checkForNewWords();
        inputController.enable();
      });
    });
  });
}

// Animate the cleared word flying to the made words list
function animateWordFlyToList(tiles, word, callback) { // 360
  // Get bounding rect of first and last tile
  const firstTileRect = tiles[0].getBoundingClientRect();
  const lastTileRect = tiles[tiles.length - 1].getBoundingClientRect();

  // Calculate center position between first and last tile
  const startX = (firstTileRect.left + lastTileRect.right) / 2;
  const startY = (firstTileRect.top + lastTileRect.bottom) / 2;

  // Get target position (top of made words list)
  const madeWordsList = document.getElementById('made-words-list');
  const targetRect = madeWordsList.getBoundingClientRect();
  const targetX = targetRect.left + 16;
  const targetY = targetRect.top + 16; // small offset for aesthetics

  // Create floating word element
  const floatingWord = document.createElement('div');
  floatingWord.textContent = word;
  floatingWord.style.position = 'fixed';
  floatingWord.style.left = `${startX}px`;
  floatingWord.style.top = `${startY}px`;
  floatingWord.style.fontSize = '1.2em';
  floatingWord.style.fontWeight = 'bold';
  floatingWord.style.background = '#ffbbe7';
  floatingWord.style.border = '1px solid #e0c97f';
  floatingWord.style.borderRadius = '8px';
  floatingWord.style.padding = '8px 12px';
  floatingWord.style.boxShadow = '0 4px 16px rgba(0,0,0,0.18)';
  floatingWord.style.zIndex = '1000';
  floatingWord.style.transition = 'left 0.6s cubic-bezier(.5,.1,.5,.5,1), top 0.6s cubic-bezier(.5,.1,.5,.5,1), opacity 0.6s ease-out'; // Added opacity to transition

  document.body.appendChild(floatingWord);

  // Force reflow for transition
  void floatingWord.offsetWidth;

  // Animate to target
  setTimeout(() => { // 397
    floatingWord.style.left = `${targetX}px`;
    floatingWord.style.top = `${targetY}px`;
    floatingWord.style.opacity = '0.7';
  }, 10);

  // After animation, remove floating word and call callback
  setTimeout(() => { // 404
    floatingWord.remove();
    callback();
  }, 650);
}

function checkForNewWords() { // 411
  let wordsFound = false;

  // Check if any new words were formed after tiles fell
  for (let r = 0; r < game.rows; r++) {
    for (let c = 0; c < game.cols; c++) {
      if (game.getTile(r, c)) {
        if (wordValidator.checkWords(game, board, r, c, handleWordFound)) {
          wordsFound = true;
          break; // Exit the loop as handleWordFound will trigger checkForNewWords again after animation
        }
      }
    }
    if (wordsFound) break;
  }

  return wordsFound;
}

function resetGame() { // 429
  game.resetBoard();
  board.resetBoard();
  scoring.resetScore();
  inputController.enable();
  clearMadeWordsList();

  // Set initial remaining counter value on load
  updateLettersRemainingCounter();
  // Set initial counter value on load
  updateLettersRemainingCounter();
}


// Helper to add word to made words list
function addMadeWord(word) { // 142
  const madeWordsList = document.getElementById('made-words-list');
  const btn = document.createElement('button');
  btn.textContent = word;
  btn.classList.add('made-word-btn');
  btn.style.position = 'relative';
  btn.style.marginBottom = '12px';
  btn.style.display = 'block';
  btn.style.fontSize = '0.8em';
  btn.style.padding = '6px 13px 6px 13px';
  btn.style.cursor = 'pointer';
  btn.style.border = '1px solid #ccc';
  btn.style.borderRadius = '18px';
  btn.style.background = '#f7f7f7';
  btn.style.transition = 'background 0.2s';
  btn.style.lineHeight = '1em'; // Ensure single line of text

  // Add animation class to indicate new word
  btn.classList.add('new-word-animate');

  // Remove animation class after animation ends
  btn.addEventListener('animationend', () => {
    btn.classList.remove('new-word-animate');
  }, { once: true });

  // Tooltip element (now appended to document body)
  const tooltip = document.createElement('div');
  tooltip.classList.add('word-tooltip');
  tooltip.textContent = 'Click to remove';
  tooltip.style.visibility = 'hidden';
  tooltip.style.opacity = '0';
  tooltip.style.position = 'absolute';
  tooltip.style.zIndex = '1001';
  tooltip.style.padding = '5px';
  tooltip.style.background = 'black';
  tooltip.style.color = 'white';
  tooltip.style.borderRadius = '4px';
  tooltip.style.bottom = '100%'; // Position above button
  tooltip.style.left = '50%';
  tooltip.style.transform = 'translateX(-50%)';
  tooltip.style.transition = 'opacity 0.2s, visibility 0.2s';
  tooltip.style.whiteSpace = 'nowrap';
  document.body.appendChild(tooltip); // Append to body so it floats above all

  // Calculate tooltip position relative to the button
  function positionTooltip() {
    const rect = btn.getBoundingClientRect();
    tooltip.style.left = `${rect.left + rect.width / 2}px`;
    tooltip.style.top = `${rect.top - tooltip.offsetHeight - 5}px`;
    tooltip.style.transform = 'translateX(-50%)';
  }

  // Show tooltip on mouseover
  btn.addEventListener('mouseover', () => { // 190
    positionTooltip(); // Recalculate position just before showing
    tooltip.style.visibility = 'visible';
    tooltip.style.opacity = '0.9';
    btn.style.background = '#e7e7e7';
  });

  // Hide tooltip on mouseleave
  btn.addEventListener('mouseleave', () => { // 209
    tooltip.style.visibility = 'hidden';
    tooltip.style.opacity = '0';
    btn.style.background = '#f7f7f7';
  });

  // Remove tooltip from DOM when button is removed
  btn.addEventListener('remove', () => { // 215
    if (tooltip.parentNode) tooltip.parentNode.removeChild(tooltip);
  });

  // Insert at the beginning
  madeWordsList.insertBefore(btn, madeWordsList.firstChild);

  // Cap the list to 10 items
  while (madeWordsList.childNodes.length > 10) { // 223
    // Remove tooltip for the button being removed
    const removedBtn = madeWordsList.lastChild;
    removedBtn.dispatchEvent(new Event('remove'));
    madeWordsList.removeChild(removedBtn);
  }
}

// Add mousemove to game board to show preview in spawn row
gameBoard.addEventListener('mousemove', e => { // 65
  if (!inputController.isEnabled()) return;

  const col = e.target.dataset.col;

  if (col !== undefined) {
    // On first mousemove, update preview and spawn row
    if (!mouseEnteredGameBoard) {
      mouseEnteredGameBoard = true;
      // Show next 3 in preview - NOT HERE ANYMORE
    }

    // Show the next tile in the hovered column of the spawn row
    ui.updateSpawnRow(col, tileGenerator.tiles[tileGenerator.currentIndex]);
    Array.from(spawnRow.children).forEach((tile, idx) => { // 78
      if (idx !== parseInt(col)) {
        tile.classList.add('spawn-invisible');
        tile.classList.remove('spawn-active');
      } else {
        tile.classList.remove('spawn-invisible');
        tile.classList.add('spawn-active');
      }
    });
  }
});

// Add mouseleave to game board to clear preview
gameBoard.addEventListener('mouseleave', e => { // 90
  // Determine which edge the mouse left from
  const boardRect = gameBoard.getBoundingClientRect();
  let clampCol = Math.floor((e.clientX - boardRect.left) + boardRect.width / 2);
  if (e.clientX > boardRect.left + boardRect.width / 2) {
    clampCol = game.cols - 1; // right edge (use game.cols)
  } else {
    clampCol = 0; // left edge
  }

  // Show the next tile in the clamped column of the spawn row
  ui.updateSpawnRow(clampCol, tileGenerator.tiles[tileGenerator.currentIndex]);
  Array.from(spawnRow.children).forEach((tile, idx) => { // 103
    if (idx !== clampCol) {
      tile.classList.add('spawn-invisible');
      tile.classList.remove('spawn-active');
    } else {
      tile.classList.remove('spawn-invisible');
      tile.classList.add('spawn-active');
    }
  });
});

spawnRow.addEventListener('mousemove', e => { // 114
  if (!inputController.isEnabled()) return;

  const col = e.target.dataset.col;
  if (col !== undefined) {
    ui.updateSpawnRow(parseInt(col), tileGenerator.tiles[tileGenerator.currentIndex]);
    // Make all spawn tiles invisible except the active one
    Array.from(spawnRow.children).forEach((tile, idx) => { // 120
      if (idx !== parseInt(col)) {
        tile.classList.add('spawn-invisible');
        tile.classList.remove('spawn-active');
      } else {
        tile.classList.remove('spawn-invisible');
        tile.classList.add('spawn-active');
      }
    });
  }
});

spawnRow.addEventListener('mouseleave', () => { // 131
  ui.clearSpawnRow();
  // Make all spawn tiles invisible
  Array.from(spawnRow.children).forEach(tile => { // 134
    tile.classList.add('spawn-invisible');
    tile.classList.remove('spawn-active');
  });
});