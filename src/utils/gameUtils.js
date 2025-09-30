import { GameConfig } from '../game/gameConfig.js';

/**
 * Utility functions for game operations
 * Pure functions that help with common game logic
 */

/**
 * Creates an empty game board with the specified dimensions
 * @param {number} rows - Number of rows (defaults to config)
 * @param {number} cols - Number of columns (defaults to config)
 * @returns {Array[][]} Empty 2D array representing the game board
 */
export function createEmptyBoard(rows = GameConfig.ROWS, cols = GameConfig.COLS) {
  return Array(rows).fill(null).map(() => Array(cols).fill(null));
}

/**
 * Validates if the given coordinates are within the board boundaries
 * @param {number} row - Row coordinate to validate
 * @param {number} col - Column coordinate to validate
 * @param {number} rows - Total rows (defaults to config)
 * @param {number} cols - Total columns (defaults to config)
 * @returns {boolean} True if position is valid, false otherwise
 */
export function isValidPosition(row, col, rows = GameConfig.ROWS, cols = GameConfig.COLS) {
  return row >= 0 && row < rows && col >= 0 && col < cols;
}

/**
 * Finds the landing row for a tile dropped in the specified column
 * @param {Array[][]} board - The current game board state
 * @param {number} col - Column to drop the tile in
 * @returns {number} Row index where tile will land, or -1 if column is full
 */
export function findDropRow(board, col) {
  for (let row = board.length - 1; row >= 0; row--) {
    if (!board[row][col]) {
      return row;
    }
  }
  return -1;
}

/**
 * Checks if a column is full
 * @param {Array[][]} board - The current game board state
 * @param {number} col - Column to check
 * @returns {boolean} True if column is full, false otherwise
 */
export function isColumnFull(board, col) {
  return board[0][col] !== null;
}