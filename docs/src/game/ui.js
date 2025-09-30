/**
 * Manages various user interface elements of the game, specifically the
 * spawn row (where the current tile is waiting) and the next tile preview queue.
 */
export class UI {
    /**
     * @param {HTMLElement} previewContainer - The DOM element where the next tile preview is displayed.
     */
    constructor(previewContainer) {
        this.previewContainer = previewContainer;
    }

    /**
     * Updates the spawn row, clearing all previous tiles and optionally
     * setting a new letter and highlighting the active column.
     *
     * @param {number|undefined} col - The column index to highlight (or undefined to only clear).
     * @param {string|undefined} letter - The letter to display in the highlighted column.
     */
    updateSpawnRow(col, letter) {
        // 1. Clear all spawn tiles
        document.querySelectorAll('.spawn-tile').forEach(tile => {
            tile.textContent = '';
            // Remove highlight from all columns
            tile.classList.remove('spawn-row-active');
            // Make tile invisible when clearing
            tile.style.visibility = 'hidden';
        });

        // 2. If column and letter are provided, set the active tile
        if (col !== undefined && letter) {
            const spawnTile = document.querySelector(`.spawn-tile[data-col='${col}']`);

            if (spawnTile) {
                spawnTile.textContent = letter;
                // Add bold border/highlight to the active column
                spawnTile.classList.add('spawn-row-active');
                // Make tile visible when setting content
                spawnTile.style.visibility = 'visible';
            }
        }
    }

    /**
     * Updates the preview container with the list of letters coming next.
     *
     * @param {string[]} letterQueue - Array of letters to display as the next tiles.
     */
    updatePreview(letterQueue) {
        // Clear previous preview tiles
        this.previewContainer.innerHTML = '';

        // Create 7 empty grid cells to match game board columns
        for (let col = 0; col < 7; col++) {
            const gridCell = document.createElement('div');
            
            // Only add tiles to columns 1, 2, and 3 (positions 2, 3, 4)
            // Map so that column 3 shows the NEXT tile (letterQueue[0])
            if (col >= 1 && col <= 3 && letterQueue.length >= 3) {
                const previewTile = document.createElement('div');
                previewTile.classList.add('tile', 'preview-tile');
                
                // Reverse the mapping so column 3 gets the next tile (index 0)
                // Column 1 = letterQueue[2] (3rd next)
                // Column 2 = letterQueue[1] (2nd next)  
                // Column 3 = letterQueue[0] (1st next - immediate next tile)
                const queueIndex = 3 - col;
                previewTile.textContent = letterQueue[queueIndex];
                
                // Add special class for column 3 (the immediate next tile)
                if (col === 3) {
                    previewTile.classList.add('next-tile-highlight');
                }
                
                gridCell.appendChild(previewTile);
            }
            
            this.previewContainer.appendChild(gridCell);
        }
    }

    /**
     * Clears the current content of the spawn row.
     */
    clearSpawnRow() {
        this.updateSpawnRow();
    }

    /**
     * Updates the spawn row with a simple drop-in animation from the preview area.
     * 
     * @param {number} col - The column index to highlight
     * @param {string} letter - The letter to display in the highlighted column
     */
    updateSpawnRowWithDrop(col, letter) {
        // Trigger preview nudge animation first
        this.animatePreviewNudge();
        
        // Clear all spawn tiles first
        this.updateSpawnRow();
        
        // Set the new active tile with drop-in animation
        if (col !== undefined && letter) {
            const spawnTile = document.querySelector(`.spawn-tile[data-col='${col}']`);
            if (spawnTile) {
                spawnTile.textContent = letter;
                spawnTile.classList.add('spawn-row-active', 'spawn-drop-in');
                spawnTile.style.visibility = 'visible';
                
                // Clean up animation class after animation completes
                setTimeout(() => {
                    spawnTile.classList.remove('spawn-drop-in');
                }, 400);
            }
        }
    }

    /**
     * Animates the preview panel to nudge right, simulating tiles moving down
     */
    animatePreviewNudge() {
        const previewContent = document.querySelector('.preview-content');
        const noodleIcon = document.querySelector('.noodle-icon');
        
        if (previewContent && noodleIcon) {
            // Add animation classes
            previewContent.classList.add('animate-nudge');
            noodleIcon.classList.add('animate-nudge');
            
            // Remove animation classes after animation completes
            setTimeout(() => {
                previewContent.classList.remove('animate-nudge');
                noodleIcon.classList.remove('animate-nudge');
            }, 600);
        }
    }
}
