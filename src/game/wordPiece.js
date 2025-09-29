// Word piece management
class WordPiece {
    constructor(word = null) {
        this.word = word || this.generateRandomWord();
        this.letters = this.word.split('');
        this.x = 0;
        this.y = 0;
        this.rotation = 0; // 0 = horizontal, 1 = vertical
        
        // Color for rendering
        this.color = this.getRandomColor();
    }
    
    /**
     * Generate a random word for the piece
     */
    generateRandomWord() {
        const words = [
            'CAT', 'DOG', 'SUN', 'CAR', 'HAT', 'BAT', 'RUN', 'FUN', 'BOX', 'FOX',
            'TREE', 'GAME', 'WORD', 'PLAY', 'TIME', 'LOVE', 'LIFE', 'BLUE', 'FIRE', 'STAR',
            'HOUSE', 'WATER', 'LIGHT', 'MUSIC', 'HAPPY', 'WORLD', 'MAGIC', 'DREAM', 'SMILE', 'PEACE',
            'FLOWER', 'BRIDGE', 'CASTLE', 'DRAGON', 'FOREST', 'SUNSET', 'WINTER', 'SPRING', 'SUMMER', 'AUTUMN'
        ];
        return randomChoice(words);
    }
    
    /**
     * Get a random color for the piece
     */
    getRandomColor() {
        const colors = [
            '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', 
            '#ffeaa7', '#dda0dd', '#98d8c8', '#f7dc6f'
        ];
        return randomChoice(colors);
    }
    
    /**
     * Get the positions of all letters relative to the piece's origin
     */
    getRelativePositions() {
        const positions = [];
        
        if (this.rotation === 0) {
            // Horizontal layout
            for (let i = 0; i < this.letters.length; i++) {
                positions.push({ x: i, y: 0 });
            }
        } else {
            // Vertical layout
            for (let i = 0; i < this.letters.length; i++) {
                positions.push({ x: 0, y: i });
            }
        }
        
        return positions;
    }
    
    /**
     * Get the absolute positions of all letters on the board
     */
    getAbsolutePositions(x = this.x, y = this.y) {
        const relativePositions = this.getRelativePositions();
        return relativePositions.map(pos => ({
            x: x + pos.x,
            y: y + pos.y
        }));
    }
    
    /**
     * Get the bounding box of the piece
     */
    getBounds() {
        const positions = this.getRelativePositions();
        
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;
        
        positions.forEach(pos => {
            minX = Math.min(minX, pos.x);
            maxX = Math.max(maxX, pos.x);
            minY = Math.min(minY, pos.y);
            maxY = Math.max(maxY, pos.y);
        });
        
        return {
            width: maxX - minX + 1,
            height: maxY - minY + 1,
            minX, maxX, minY, maxY
        };
    }
    
    /**
     * Rotate the piece (toggle between horizontal and vertical)
     */
    rotate() {
        this.rotation = (this.rotation + 1) % 2;
    }
    
    /**
     * Get a rotated version without modifying the original
     */
    getRotated() {
        const rotated = new WordPiece(this.word);
        rotated.x = this.x;
        rotated.y = this.y;
        rotated.rotation = (this.rotation + 1) % 2;
        rotated.color = this.color;
        return rotated;
    }
    
    /**
     * Move the piece by a delta
     */
    move(deltaX, deltaY) {
        this.x += deltaX;
        this.y += deltaY;
    }
    
    /**
     * Set the piece position
     */
    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }
    
    /**
     * Check if the piece can fit at a given position on a board
     */
    canFitAt(board, x, y) {
        return board.canPlacePiece(this, x, y);
    }
    
    /**
     * Check if the piece can move in a direction
     */
    canMove(board, deltaX, deltaY) {
        return this.canFitAt(board, this.x + deltaX, this.y + deltaY);
    }
    
    /**
     * Check if the piece can rotate
     */
    canRotate(board) {
        const rotated = this.getRotated();
        return rotated.canFitAt(board, this.x, this.y);
    }
    
    /**
     * Get the lowest possible Y position for the piece at its current X
     */
    getDropPosition(board) {
        let dropY = this.y;
        while (this.canFitAt(board, this.x, dropY + 1)) {
            dropY++;
        }
        return dropY;
    }
    
    /**
     * Render the piece on a canvas context
     */
    render(ctx, offsetX = 0, offsetY = 0, cellSize = 30, alpha = 1) {
        const positions = this.getAbsolutePositions();
        
        ctx.save();
        ctx.globalAlpha = alpha;
        
        for (let i = 0; i < positions.length; i++) {
            const pos = positions[i];
            const letter = this.letters[i];
            
            const cellX = offsetX + pos.x * cellSize;
            const cellY = offsetY + pos.y * cellSize;
            
            // Draw cell background
            ctx.fillStyle = this.color;
            ctx.fillRect(cellX + 2, cellY + 2, cellSize - 4, cellSize - 4);
            
            // Draw border
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            ctx.strokeRect(cellX + 2, cellY + 2, cellSize - 4, cellSize - 4);
            
            // Draw letter
            ctx.fillStyle = 'white';
            ctx.font = 'bold 18px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(
                letter, 
                cellX + cellSize / 2, 
                cellY + cellSize / 2
            );
        }
        
        ctx.restore();
    }
    
    /**
     * Render a preview of the piece (smaller size)
     */
    renderPreview(ctx, x, y, scale = 0.7) {
        const cellSize = 30 * scale;
        const positions = this.getRelativePositions();
        
        ctx.save();
        
        for (let i = 0; i < positions.length; i++) {
            const pos = positions[i];
            const letter = this.letters[i];
            
            const cellX = x + pos.x * cellSize;
            const cellY = y + pos.y * cellSize;
            
            // Draw cell background
            ctx.fillStyle = this.color;
            ctx.fillRect(cellX, cellY, cellSize, cellSize);
            
            // Draw border
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
            ctx.strokeRect(cellX, cellY, cellSize, cellSize);
            
            // Draw letter
            ctx.fillStyle = 'white';
            ctx.font = `bold ${Math.floor(14 * scale)}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(
                letter, 
                cellX + cellSize / 2, 
                cellY + cellSize / 2
            );
        }
        
        ctx.restore();
    }
    
    /**
     * Create a copy of the piece
     */
    clone() {
        const clone = new WordPiece(this.word);
        clone.x = this.x;
        clone.y = this.y;
        clone.rotation = this.rotation;
        clone.color = this.color;
        return clone;
    }
    
    /**
     * Get piece information as an object
     */
    getInfo() {
        return {
            word: this.word,
            length: this.letters.length,
            position: { x: this.x, y: this.y },
            rotation: this.rotation,
            bounds: this.getBounds()
        };
    }
}