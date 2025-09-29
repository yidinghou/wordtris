// Game board management
class GameBoard {
    constructor(width = 10, height = 20) {
        this.width = width;
        this.height = height;
        this.grid = [];
        this.cellSize = 30;
        
        // Initialize empty grid
        this.clear();
    }
    
    /**
     * Clear the entire board
     */
    clear() {
        this.grid = [];
        for (let y = 0; y < this.height; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.width; x++) {
                this.grid[y][x] = null; // null = empty, string = letter
            }
        }
    }
    
    /**
     * Check if a position is within bounds
     */
    isValidPosition(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }
    
    /**
     * Check if a cell is empty
     */
    isEmpty(x, y) {
        if (!this.isValidPosition(x, y)) return false;
        return this.grid[y][x] === null;
    }
    
    /**
     * Set a letter at a specific position
     */
    setCell(x, y, letter) {
        if (this.isValidPosition(x, y)) {
            this.grid[y][x] = letter;
        }
    }
    
    /**
     * Get the letter at a specific position
     */
    getCell(x, y) {
        if (!this.isValidPosition(x, y)) return null;
        return this.grid[y][x];
    }
    
    /**
     * Check if a word piece can be placed at a position
     */
    canPlacePiece(piece, x, y) {
        const positions = piece.getAbsolutePositions(x, y);
        
        for (const pos of positions) {
            if (!this.isValidPosition(pos.x, pos.y) || !this.isEmpty(pos.x, pos.y)) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Place a word piece on the board
     */
    placePiece(piece, x, y) {
        const positions = piece.getAbsolutePositions(x, y);
        
        for (let i = 0; i < positions.length; i++) {
            const pos = positions[i];
            this.setCell(pos.x, pos.y, piece.letters[i]);
        }
    }
    
    /**
     * Find and clear completed words (horizontal, vertical, and diagonal)
     */
    clearCompletedWords() {
        const clearedWords = [];
        const cellsToRemove = new Set();
        
        // Check horizontal words
        for (let y = 0; y < this.height; y++) {
            let currentWord = '';
            let wordPositions = [];
            
            for (let x = 0; x <= this.width; x++) {
                const cell = x < this.width ? this.getCell(x, y) : null;
                
                if (cell && cell !== ' ') {
                    currentWord += cell;
                    wordPositions.push({ x, y });
                } else {
                    if (currentWord.length >= 3 && isValidWord(currentWord)) {
                        clearedWords.push(currentWord);
                        wordPositions.forEach(pos => {
                            cellsToRemove.add(`${pos.x},${pos.y}`);
                        });
                    }
                    currentWord = '';
                    wordPositions = [];
                }
            }
        }
        
        // Check vertical words
        for (let x = 0; x < this.width; x++) {
            let currentWord = '';
            let wordPositions = [];
            
            for (let y = 0; y <= this.height; y++) {
                const cell = y < this.height ? this.getCell(x, y) : null;
                
                if (cell && cell !== ' ') {
                    currentWord += cell;
                    wordPositions.push({ x, y });
                } else {
                    if (currentWord.length >= 3 && isValidWord(currentWord)) {
                        clearedWords.push(currentWord);
                        wordPositions.forEach(pos => {
                            cellsToRemove.add(`${pos.x},${pos.y}`);
                        });
                    }
                    currentWord = '';
                    wordPositions = [];
                }
            }
        }
        
        // Remove the cleared cells
        cellsToRemove.forEach(posStr => {
            const [x, y] = posStr.split(',').map(Number);
            this.setCell(x, y, null);
        });
        
        // Apply gravity to make pieces fall down
        if (cellsToRemove.size > 0) {
            this.applyGravity();
        }
        
        return clearedWords;
    }
    
    /**
     * Apply gravity to make letters fall down
     */
    applyGravity() {
        for (let x = 0; x < this.width; x++) {
            // Collect all non-empty cells in this column
            const letters = [];
            for (let y = this.height - 1; y >= 0; y--) {
                if (this.grid[y][x] !== null) {
                    letters.push(this.grid[y][x]);
                    this.grid[y][x] = null;
                }
            }
            
            // Place letters back from bottom up
            for (let i = 0; i < letters.length; i++) {
                this.grid[this.height - 1 - i][x] = letters[i];
            }
        }
    }
    
    /**
     * Check if the game is over (top row has letters)
     */
    isGameOver() {
        for (let x = 0; x < this.width; x++) {
            if (this.grid[0][x] !== null) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Get the height of the stack at a given column
     */
    getColumnHeight(x) {
        for (let y = 0; y < this.height; y++) {
            if (this.grid[y][x] !== null) {
                return this.height - y;
            }
        }
        return 0;
    }
    
    /**
     * Render the board on a canvas context
     */
    render(ctx, offsetX = 0, offsetY = 0) {
        const cellSize = this.cellSize;
        
        // Draw grid background
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(offsetX, offsetY, this.width * cellSize, this.height * cellSize);
        
        // Draw grid lines
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 1;
        
        for (let x = 0; x <= this.width; x++) {
            ctx.beginPath();
            ctx.moveTo(offsetX + x * cellSize, offsetY);
            ctx.lineTo(offsetX + x * cellSize, offsetY + this.height * cellSize);
            ctx.stroke();
        }
        
        for (let y = 0; y <= this.height; y++) {
            ctx.beginPath();
            ctx.moveTo(offsetX, offsetY + y * cellSize);
            ctx.lineTo(offsetX + this.width * cellSize, offsetY + y * cellSize);
            ctx.stroke();
        }
        
        // Draw letters
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const letter = this.grid[y][x];
                if (letter) {
                    const cellX = offsetX + x * cellSize;
                    const cellY = offsetY + y * cellSize;
                    
                    // Draw cell background
                    ctx.fillStyle = '#667eea';
                    ctx.fillRect(cellX + 2, cellY + 2, cellSize - 4, cellSize - 4);
                    
                    // Draw letter
                    ctx.fillStyle = 'white';
                    ctx.fillText(
                        letter, 
                        cellX + cellSize / 2, 
                        cellY + cellSize / 2
                    );
                }
            }
        }
    }
    
    /**
     * Get a copy of the current board state
     */
    getState() {
        return this.grid.map(row => [...row]);
    }
    
    /**
     * Restore board state from a saved state
     */
    setState(state) {
        this.grid = state.map(row => [...row]);
    }
}