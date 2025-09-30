/**
 * Represents a class responsible for handling various tile animations
 * in a tile-based game, such as tile dropping, highlighting, and cascading falls.
 * It uses requestAnimationFrame for smooth animations and setInterval for timing.
 */
export class Animations {

    /**
     * Animates a letter tile dropping from the current position to a target row.
     * It uses setInterval for the step-by-step falling animation.
     *
     * @param {object} board - The game board element or object used to get tile elements.
     * @param {number} row - The target row for the tile to land.
     * @param {number} col - The column where the tile is dropping.
     * @param {string} letter - The letter content of the tile.
     * @param {function} onComplete - Callback executed when the animation finishes.
     */
    static animateTileDrop(board, row, col, letter, onComplete) {
        let currentRow = 0;

        // Clear the target tile first to prevent duplicates
        const targetTile = board.getTileElement(row, col);
        if (targetTile) {
            targetTile.textContent = '';
            targetTile.classList.remove('locked', 'falling');
        }

        // Set the current tile content immediately in the starting row (row 0)
        let currentTile = board.getTileElement(currentRow, col);
        currentTile.textContent = letter;

        const interval = setInterval(() => {
            // Check if animation should stop
            if (currentRow >= row) {
                // Animation completed, clear the interval
                clearInterval(interval);

                // Clear the previous tile if we moved from above
                if (currentRow > 0) {
                    const prevTile = board.getTileElement(currentRow - 1, col);
                    prevTile.classList.remove('falling');
                    prevTile.textContent = '';
                }

                // Lock the final tile (add 'locked' class and final content)
                currentTile.classList.add('locked');
                currentTile.textContent = letter;

                // Call the onComplete callback
                if (onComplete) {
                    onComplete();
                }
                return;
            }

            // Animate falling step
            if (currentRow > 0) {
                // Get the tile that was previously occupied (the one above)
                const prevTile = board.getTileElement(currentRow - 1, col);

                // Clear the 'falling' class and content from the tile above
                prevTile.classList.remove('falling');
                prevTile.textContent = '';
            }

            // Move to the next row
            currentRow++;
            currentTile = board.getTileElement(currentRow, col);

            // Add 'falling' class and content to the new current tile
            currentTile.classList.add('falling');
            currentTile.textContent = letter;

        }, 50); // Frame delay in milliseconds
    }

    /**
     * Highlights tiles and then performs a shake animation.
     *
     * @param {HTMLElement[]} tiles - An array of tile elements to highlight and shake.
     * @param {function} onComplete - Callback executed when all animations finish.
     */
    static highlightAndClearTiles(tiles, onComplete) {
        // 1. Highlight the tiles (add 'highlight' class)
        tiles.forEach(tile => {
            tile.classList.add('highlight');
            tile.classList.remove('locked');
        });

        // 2. Clear content after highlight phase
        setTimeout(() => {
            tiles.forEach(tile => tile.textContent = '');
        }, 300); // Wait 300ms for highlight to show

        // 3. Shake the surrounding tiles (add 'shake' class)
        setTimeout(() => {
            tiles.forEach(tile => tile.classList.add('shake'));
        }, 500); // Wait 500ms before starting shake (and potential clear)

        // 4. Clean up and run onComplete
        setTimeout(() => {
            tiles.forEach(tile => {
                tile.classList.remove('highlight');
                tile.classList.remove('shake');
            });
            if (onComplete) {
                onComplete(tiles);
            }
        }, 800); // Total duration: 500ms + 300ms (to remove shake)
    }


    /**
     * Animates tiles falling down to fill empty spaces created by cleared tiles.
     * This is a complex animation involving identifying tiles that need to move
     * and managing the animation loop for each column.
     *
     * @param {object} game - The game state object (used for the board array).
     * @param {object} board - The board element object (used to get/clear tile elements).
     * @param {object[]} clearedTiles - Array of objects representing the cleared tile positions.
     * @param {function} onComplete - Callback executed when all falling animations finish.
     */
    static animateTilesFalling(game, board, clearedTiles, onComplete) {
        // Identify unique columns that were affected
        const columnsToProcess = [...new Set(clearedTiles.map(tile => parseInt(tile.dataset.col)))];
        let completedColumns = 0;

        columnsToProcess.forEach(col => {
            const emptySpaces = [];
            const tilesToMove = [];
            let fallDistance = 0; // Local fall distance for the current column

            // 1. Find all empty positions in this column (from bottom up)
            for (let r = game.rows - 1; r >= 0; r--) {
                if (!game.getTile(r, col)) {
                    emptySpaces.push(r); // r is the row index of the empty spot
                }
            }

            // If no empty spaces, nothing needs to fall
            if (emptySpaces.length === 0) {
                completedColumns++;
                if (completedColumns === columnsToProcess.length && onComplete) {
                    onComplete();
                }
                return;
            }

            // Find the lowest empty space to start looking for tiles to fall
            const lowestEmptyRow = Math.max(...emptySpaces);

            // 2. Find all tiles above the lowest empty space that need to fall
            for (let r = lowestEmptyRow - 1; r >= 0; r--) {
                const tileContent = game.getTile(r, col);
                if (tileContent) {
                    // Check how far this tile should fall (how many empty spots are below it)
                    fallDistance = 0;
                    for (let checkRow = r + 1; checkRow <= lowestEmptyRow; checkRow++) {
                        if (emptySpaces.includes(checkRow)) {
                            fallDistance++;
                        }
                    }

                    if (fallDistance > 0) {
                        tilesToMove.push({
                            fromRow: r,
                            toRow: r + fallDistance,
                            col: col,
                            fallDistance: fallDistance
                        });
                        // Set the new game board position for the tile content immediately (data update)
                        game.board[r + fallDistance][col] = tileContent;
                        // Clear the tile in the game state where it currently is (data update)
                        game.board[r][col] = null;
                    }
                }
            }

            // If no tiles need to move, we are done with this column
            if (tilesToMove.length === 0) {
                completedColumns++;
                if (completedColumns === columnsToProcess.length && onComplete) {
                    onComplete();
                }
                return;
            }

            // 3. Animate all tiles falling simultaneously in this column
            let animationStep = 0;
            // The maximum distance any tile needs to fall in this column
            const maxFallDistance = Math.max(...tilesToMove.map(t => t.fallDistance));

            const fallInterval = setInterval(() => {
                // Stop condition: animation step reaches the maximum required distance
                if (animationStep >= maxFallDistance) {
                    clearInterval(fallInterval);
                    completedColumns++;
                    if (completedColumns === columnsToProcess.length && onComplete) {
                        onComplete();
                    }
                    return;
                }

                // Animate all tiles that are currently still moving
                tilesToMove.forEach(({ fromRow, toRow, col, fallDistance }) => {
                    if (animationStep < fallDistance) {
                        // Current position where the tile should be drawn visually
                        const currentRow = fromRow + animationStep + 1;
                        // Previous position (visually the tile that is now empty)
                        const prevRow = fromRow + animationStep;

                        const prevTile = board.getTileElement(prevRow, col);
                        const currentTile = board.getTileElement(currentRow, col);

                        // Move the visual content (text and classes)
                        currentTile.textContent = prevTile.textContent;
                        currentTile.className = prevTile.className; // Transfer 'locked'/'falling' etc.

                        // Clear the visual tile above it
                        board.clearTileElement(prevTile);
                    }
                });

                animationStep++;

            }, 100); // Animation frame speed
        });
    }
}
