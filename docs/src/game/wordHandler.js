import { Animations } from './animation.js';

/**
 * Handles word-related logic including word detection, animations, and made words list management
 */
export class WordHandler {
  constructor(gameController) {
    this.gameController = gameController;
  }

  handleWordFound(tiles, word) {
    console.log('Highlighting tiles for word');
    this.gameController.inputController.disable();

    this.gameController.ui.clearSpawnRow();
    this.gameController.hideSpawnRowTiles();

    // Extract the word from tiles to calculate score
    word = '';
    tiles.forEach(tile => {
      word += tile.textContent;
    });

    // Score calculation happens ONLY here
    const pointsEarned = this.gameController.scoring.addPoints(word);
    console.log(`Scored ${pointsEarned} points for word: ${word}`);

    Animations.highlightAndClearTiles(tiles, clearedTiles => {
      // Animate word flying to made words list after highlight/shake animation
      this.animateWordFlyToList(tiles, word, () => {
        // Add word to made words list after animation
        this.addMadeWord(word);

        // Now update the spawn row after word is added to the list
        const lastCol = parseInt(tiles[tiles.length - 1].dataset.col);
        this.gameController.ui.updateSpawnRow(lastCol, this.gameController.tileGenerator.tiles[this.gameController.tileGenerator.currentIndex]);
        this.gameController.glowSpawnTile(lastCol);

        clearedTiles.forEach(tile => {
          const r = parseInt(tile.dataset.row);
          const c = parseInt(tile.dataset.col);
          this.gameController.game.clearTile(r, c);
          this.gameController.board.clearTileElement(tile);
        });

        // Update preview queue ONLY after clear/word animation
        this.gameController.updatePreviewAndCounter();

        Animations.animateTilesFalling(this.gameController.game, this.gameController.board, clearedTiles, () => {
          this.checkForNewWords();
          this.gameController.inputController.enable();
        });
      });
    });
  }

  // Animate the cleared word flying to the made words list
  animateWordFlyToList(tiles, word, callback) {
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
    setTimeout(() => {
      floatingWord.style.left = `${targetX}px`;
      floatingWord.style.top = `${targetY}px`;
      floatingWord.style.opacity = '0.7';
    }, 10);

    // After animation, remove floating word and call callback
    setTimeout(() => {
      floatingWord.remove();
      callback();
    }, 650);
  }

  checkForNewWords() {
    let wordsFound = false;

    // Check if any new words were formed after tiles fell
    for (let r = 0; r < this.gameController.game.rows; r++) {
      for (let c = 0; c < this.gameController.game.cols; c++) {
        if (this.gameController.game.getTile(r, c)) {
          if (this.gameController.wordValidator.checkWords(this.gameController.game, this.gameController.board, r, c, this.handleWordFound.bind(this))) {
            wordsFound = true;
            break; // Exit the loop as handleWordFound will trigger checkForNewWords again after animation
          }
        }
      }
      if (wordsFound) break;
    }

    return wordsFound;
  }

  // Helper to add word to made words list
  addMadeWord(word) {
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

    // Tooltip element (positioned to the right of the button)
    const tooltip = document.createElement('div');
    tooltip.classList.add('word-tooltip');
    
    // Get definition from dictionary
    const definition = this.gameController.wordValidator.getDefinition(word.toLowerCase());
    const tooltipText = `${definition}`;
    
    tooltip.textContent = tooltipText;
    tooltip.style.visibility = 'hidden';
    tooltip.style.opacity = '0';
    tooltip.style.position = 'absolute';
    tooltip.style.zIndex = '1001';
    tooltip.style.padding = '8px 12px';
    tooltip.style.background = 'rgba(0, 0, 0, 0.9)';
    tooltip.style.color = 'white';
    tooltip.style.borderRadius = '6px';
    tooltip.style.fontSize = '0.75em';
    tooltip.style.fontWeight = '500';
    tooltip.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
    tooltip.style.transition = 'opacity 0.2s, visibility 0.2s, transform 0.2s';
    tooltip.style.whiteSpace = 'normal';
    tooltip.style.maxWidth = '300px';
    tooltip.style.lineHeight = '1.3';
    tooltip.style.pointerEvents = 'none'; // Prevent tooltip from interfering with mouse events
    document.body.appendChild(tooltip);

    // Calculate tooltip position to the right of the button
    function positionTooltip() {
      const rect = btn.getBoundingClientRect();
      const tooltipWidth = tooltip.offsetWidth || 100; // Fallback width
      const rightSpace = window.innerWidth - rect.right;
      
      // Position to the right if there's enough space, otherwise to the left
      if (rightSpace > tooltipWidth + 10) {
        tooltip.style.left = `${rect.right + 10}px`;
        tooltip.style.transform = 'translateY(-50%) translateX(0)';
      } else {
        tooltip.style.left = `${rect.left - tooltipWidth - 10}px`;
        tooltip.style.transform = 'translateY(-50%) translateX(0)';
      }
      tooltip.style.top = `${rect.top + rect.height / 2}px`;
    }

    // Show tooltip on mouseover
    btn.addEventListener('mouseover', () => {
      positionTooltip(); // Recalculate position just before showing
      tooltip.style.visibility = 'visible';
      tooltip.style.opacity = '0.9';
      btn.style.background = '#e7e7e7';
    });

    // Hide tooltip on mouseleave
    btn.addEventListener('mouseleave', () => {
      tooltip.style.visibility = 'hidden';
      tooltip.style.opacity = '0';
      btn.style.background = '#f7f7f7';
    });

    // Remove tooltip from DOM when button is removed
    btn.addEventListener('remove', () => {
      if (tooltip.parentNode) tooltip.parentNode.removeChild(tooltip);
    });

    // Insert at the beginning
    madeWordsList.insertBefore(btn, madeWordsList.firstChild);

    // Cap the list to 10 items
    while (madeWordsList.childNodes.length > 10) {
      // Remove tooltip for the button being removed
      const removedBtn = madeWordsList.lastChild;
      removedBtn.dispatchEvent(new Event('remove'));
      madeWordsList.removeChild(removedBtn);
    }
  }
}