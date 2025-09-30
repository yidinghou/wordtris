import { GameConfig } from './gameConfig.js';

/**
 * Represents the visual game board and handles all DOM manipulation
 * related to the tiles and their containers.
 */
export class Board {

    /**
     * Initializes the Board instance.
     * @param {object} game - The game state object containing rows/cols information.
     * @param {HTMLElement} gameBoard - The main container element for the game grid.
     * @param {HTMLElement} spawnRow - The container element for the tile spawn area.
     */
    constructor(game, gameBoard, spawnRow) {
        this.game = game;
        this.gameBoard = gameBoard;
        this.spawnRow = spawnRow;
        this.initializeDOM();
    }

    /**
     * Sets up the main DOM structure by calling helper methods.
     */
    initializeDOM() {
        this.createGameBoard();
        this.createSpawnRow();
    }

    /**
     * Creates the tile elements for the main game board grid.
     */
    createGameBoard() {
        // Set up the main game board container styles (CSS Grid)
        this.gameBoard.style.display = 'grid';
        this.gameBoard.style.gridTemplateColumns = `repeat(${this.game.cols}, ${GameConfig.TILE_SIZE}px)`;
        this.gameBoard.style.gridTemplateRows = `repeat(${this.game.rows}, ${GameConfig.TILE_SIZE}px)`;
        this.gameBoard.style.gap = '5px';
        this.gameBoard.style.justifyContent = 'center';
        this.gameBoard.style.margin = '0 auto 10px';

        // Create and append the tile elements
        for (let r = 0; r < this.game.rows; r++) {
            for (let c = 0; c < this.game.cols; c++) {
                const tile = document.createElement('div');
                tile.classList.add('tile');
                tile.dataset.row = r;
                tile.dataset.col = c;
                this.gameBoard.appendChild(tile);
            }
        }
    }

    /**
     * Creates the tile elements for the tile spawn row/area above the board.
     */
    createSpawnRow() {
        // Create and append the spawn tile elements
        for (let c = 0; c < this.game.cols; c++) {
            const spawnTile = document.createElement('div');
            spawnTile.classList.add('tile', 'spawn-tile');
            spawnTile.dataset.col = c;
            this.spawnRow.appendChild(spawnTile);
        }

        // Set up the spawn row container styles (CSS Grid, matching the board)
        this.spawnRow.style.display = 'grid';
        this.spawnRow.style.gridTemplateColumns = `repeat(${this.game.cols}, ${GameConfig.TILE_SIZE}px)`;
        this.spawnRow.style.gap = '5px';
        this.spawnRow.style.justifyContent = 'center';
        this.spawnRow.style.margin = '0 auto 10px';
    }

    // --- Utility Methods ---

    /**
     * Retrieves a tile element from the main game board by its row and column.
     * @param {number} row - The row index.
     * @param {number} col - The column index.
     * @returns {HTMLElement} The tile DOM element.
     */
    getTileElement(row, col) {
        return document.querySelector(`.tile[data-row='${row}'][data-col='${col}']`);
    }

    /**
     * Retrieves a tile element from the spawn row by its column.
     * @param {number} col - The column index.
     * @returns {HTMLElement} The spawn tile DOM element.
     */
    getSpawnTileElement(col) {
        return document.querySelector(`.spawn-tile[data-col='${col}']`);
    }

    /**
     * Resets a tile element by removing classes and clearing text content.
     * @param {HTMLElement} tile - The tile DOM element to clear.
     */
    clearTileElement(tile) {
        if (!tile) return;
        tile.className = 'tile'; // Reset to only the base 'tile' class
        tile.textContent = '';
    }

    /**
     * Clears all tile elements on the main game board.
     */
    resetBoard() {
        for (let r = 0; r < this.game.rows; r++) {
            for (let c = 0; c < this.game.cols; c++) {
                const tile = this.getTileElement(r, c);
                if (tile) {
                    this.clearTileElement(tile);
                }
            }
        }
    }
}