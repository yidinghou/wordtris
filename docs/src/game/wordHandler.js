import { Animations } from './animation.js';

/**
 * Handles word-related logic including word detection, animations, and made words list management
 */
export class WordHandler {
  constructor(gameController) {
    this.gameController = gameController;
  }

  playWordSound(wordLength) {
    const wordSounds = [
      './src/sounds/word-made-1.mp3',
      './src/sounds/word-made-2.mp3',
      './src/sounds/word-made-3.mp3'
    ];
    let randomSound;
    if (wordLength >= 4) {
      const specialSound = './src/sounds/word-made-special.mp3';
      const random = Math.random();
      if (random < 0.8) {
        randomSound = specialSound;
      } else {
        const regularIndex = Math.floor((random - 0.4) / 0.2);
        randomSound = wordSounds[Math.min(regularIndex, wordSounds.length - 1)];
      }
    } else {
      randomSound = wordSounds[Math.floor(Math.random() * wordSounds.length)];
    }
    const wordSound = new Audio(randomSound);
    wordSound.play();
  }

  /**
   * Main method to handle the event when a word is found
   * @param {Array} tiles - The array of tiles that form the found word
   * @param {string} word - The word that was found
   */
  handleWordFound(tiles, word) {
    console.log('Highlighting tiles for word');
    this.gameController.inputController.disable();

    // Extract word length
    const wordLength = word ? word.length : 
      tiles.reduce((length, tile) => length + (tile.textContent?.length || 0), 0);
    this.playWordSound(wordLength);

    // Immediately show the next tile in center column (column 3) when word is made with drop animation
    const centerCol = 3; // Center column for 7-column grid (0-indexed)
    this.gameController.ui.updateSpawnRowWithDrop(centerCol, this.gameController.tileGenerator.tiles[this.gameController.tileGenerator.currentIndex]);
    
    // Delay the glow effect to happen after the drop-in animation
    setTimeout(() => {
      this.gameController.glowSpawnTile(centerCol);
    }, 400);

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

    // Tooltip element with responsive positioning
    const tooltip = document.createElement('div');
    tooltip.classList.add('word-tooltip');
    
    // Get definition from dictionary
    const definition = this.gameController.wordValidator.getDefinition(word.toLowerCase());
    const tooltipText = `${definition}`;
    
    tooltip.textContent = tooltipText;
    document.body.appendChild(tooltip);

    // Calculate responsive tooltip position
    function positionTooltip() {
      const rect = btn.getBoundingClientRect();
      const tooltipWidth = tooltip.offsetWidth || 280;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const isMobile = viewportWidth <= 768;
      
      if (isMobile) {
        // On mobile, show tooltip at bottom of screen for better visibility
        tooltip.classList.remove('left');
        return; // CSS handles mobile positioning
      }
      
      // Desktop positioning logic
      const rightSpace = viewportWidth - rect.right;
      const leftSpace = rect.left;
      const gameContainer = document.querySelector('.main-container');
      const containerRect = gameContainer ? gameContainer.getBoundingClientRect() : { left: 0, right: viewportWidth };
      
      // Check if tooltip would go outside the game container
      const wouldExceedRight = rect.right + tooltipWidth + 10 > containerRect.right;
      const wouldExceedLeft = rect.left - tooltipWidth - 10 < containerRect.left;
      
      if (!wouldExceedRight && rightSpace > tooltipWidth + 20) {
        // Position to the right
        tooltip.style.left = `${rect.right + 10}px`;
        tooltip.style.transform = 'translateY(-50%)';
        tooltip.classList.remove('left');
      } else if (!wouldExceedLeft && leftSpace > tooltipWidth + 20) {
        // Position to the left
        tooltip.style.left = `${rect.left - tooltipWidth - 10}px`;
        tooltip.style.transform = 'translateY(-50%)';
        tooltip.classList.add('left');
      } else {
        // Center above if no space on sides
        tooltip.style.left = `${rect.left + rect.width / 2 - tooltipWidth / 2}px`;
        tooltip.style.top = `${rect.top - tooltip.offsetHeight - 12}px`;
        tooltip.style.transform = 'translateX(-50%)';
        tooltip.classList.remove('left');
        tooltip.classList.add('top');
        return;
      }
      
      tooltip.style.top = `${rect.top + rect.height / 2}px`;
    }

    let tooltipTimeout;
    let isTooltipVisible = false;
    let touchStarted = false;
    
    // Enhanced tooltip positioning with error handling
    const positionTooltipSafe = () => {
      try {
        positionTooltip();
      } catch (error) {
        console.warn('Tooltip positioning error:', error);
        // Fallback positioning
        if (window.innerWidth <= 768) {
          return; // Mobile CSS handles positioning
        }
        const rect = btn.getBoundingClientRect();
        tooltip.style.left = `${rect.right + 10}px`;
        tooltip.style.top = `${rect.top + rect.height / 2}px`;
        tooltip.style.transform = 'translateY(-50%)';
      }
    };
    
    // Show tooltip with loading state
    const showTooltip = () => {
      clearTimeout(tooltipTimeout);
      
      if (isTooltipVisible) return;
      
      isTooltipVisible = true;
      tooltip.classList.add('loading');
      
      // Brief delay to show loading state
      setTimeout(() => {
        tooltip.classList.remove('loading');
        positionTooltipSafe();
        tooltip.classList.add('visible');
        btn.style.background = '#e0e0e0';
        btn.style.transform = 'scale(1.02)';
        
        // Add focus for screen readers
        btn.setAttribute('aria-expanded', 'true');
      }, 50);
    };
    
    const hideTooltip = () => {
      isTooltipVisible = false;
      tooltip.classList.remove('visible', 'loading');
      btn.style.background = '#f7f7f7';
      btn.style.transform = 'scale(1)';
      btn.setAttribute('aria-expanded', 'false');
      clearTimeout(tooltipTimeout);
    };
    
    // Desktop hover events with delay
    btn.addEventListener('mouseenter', () => {
      if (!touchStarted) {
        tooltipTimeout = setTimeout(showTooltip, 200); // Small delay for better UX
      }
    });
    
    btn.addEventListener('mouseleave', () => {
      clearTimeout(tooltipTimeout);
      if (!touchStarted) {
        hideTooltip();
      }
    });
    
    // Enhanced mobile touch events
    btn.addEventListener('touchstart', (e) => {
      touchStarted = true;
      clearTimeout(tooltipTimeout);
      
      if (isTooltipVisible) {
        hideTooltip();
      } else {
        showTooltip();
        // Auto-hide after 4 seconds on mobile with longer text
        const autoHideDelay = tooltipText.length > 50 ? 5000 : 4000;
        tooltipTimeout = setTimeout(hideTooltip, autoHideDelay);
      }
      
      // Reset touch flag after a delay
      setTimeout(() => { touchStarted = false; }, 500);
    });
    
    // Hide on touch/click outside with improved detection
    const hideOnOutsideInteraction = (e) => {
      if (isTooltipVisible && !btn.contains(e.target) && !tooltip.contains(e.target)) {
        hideTooltip();
      }
    };
    
    document.addEventListener('touchstart', hideOnOutsideInteraction);
    document.addEventListener('click', hideOnOutsideInteraction);
    
    // Keyboard accessibility
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (isTooltipVisible) {
          hideTooltip();
        } else {
          showTooltip();
          tooltipTimeout = setTimeout(hideTooltip, 3000);
        }
      } else if (e.key === 'Escape') {
        hideTooltip();
      }
    });
    
    // Accessibility attributes
    btn.setAttribute('aria-haspopup', 'true');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('role', 'button');
    btn.setAttribute('tabindex', '0');

    // Enhanced cleanup function
    const cleanupTooltip = () => {
      clearTimeout(tooltipTimeout);
      document.removeEventListener('touchstart', hideOnOutsideInteraction);
      document.removeEventListener('click', hideOnOutsideInteraction);
      if (tooltip.parentNode) {
        tooltip.parentNode.removeChild(tooltip);
      }
    };
    
    // Remove tooltip from DOM when button is removed
    btn.addEventListener('remove', cleanupTooltip);
    
    // Store cleanup function for manual removal if needed
    btn._tooltipCleanup = cleanupTooltip;

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