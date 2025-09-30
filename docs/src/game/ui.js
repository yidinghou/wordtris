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
        });

        // 2. If column and letter are provided, set the active tile
        if (col !== undefined && letter) {
            const spawnTile = document.querySelector(`.spawn-tile[data-col='${col}']`);

            if (spawnTile) {
                spawnTile.textContent = letter;
                // Add bold border/highlight to the active column
                spawnTile.classList.add('spawn-row-active');
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
            
            // Only add tiles to columns 0, 1, and 2 (positions 1, 2, 3)
            if (col < 3 && col < letterQueue.length) {
                const previewTile = document.createElement('div');
                previewTile.classList.add('tile', 'preview-tile');
                previewTile.textContent = letterQueue[col];
                
                // Add special class for the third tile (column 2, next tile)
                if (col === 2) {
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
}
