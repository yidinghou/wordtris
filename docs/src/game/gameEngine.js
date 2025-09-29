// Main game engine
class GameEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // Game components
        this.board = new GameBoard(10, 20);
        this.gameState = new GameState();
        this.currentPiece = null;
        this.nextPiece = new WordPiece();
        this.ghostPiece = null;
        
        // Input handling
        this.keys = {};
        this.lastKeyPress = 0;
        this.keyRepeatDelay = 150;
        
        // Animation
        this.animationId = null;
        this.lastUpdate = 0;
        
        // Initialize
        this.initializeEventListeners();
        this.setupGameStateListeners();
        this.resetGame();
    }
    
    /**
     * Initialize event listeners for input
     */
    initializeEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            this.handleKeyPress(e.code);
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // Button events
        const startBtn = document.getElementById('start-btn');
        const pauseBtn = document.getElementById('pause-btn');
        const restartBtn = document.getElementById('restart-btn');
        
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startGame());
        }
        
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => this.togglePause());
        }
        
        if (restartBtn) {
            restartBtn.addEventListener('click', () => this.resetGame());
        }
        
        // Prevent arrow key scrolling
        window.addEventListener('keydown', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
                e.preventDefault();
            }
        });
    }
    
    /**
     * Setup game state event listeners
     */
    setupGameStateListeners() {
        this.gameState.addEventListener('gameOver', (data) => {
            this.showGameOver(data);
        });
        
        this.gameState.addEventListener('wordFormed', (data) => {
            this.showWordFormed(data);
        });
    }
    
    /**
     * Handle key presses
     */
    handleKeyPress(keyCode) {
        if (!this.gameState.isPlaying || this.gameState.isPaused) return;
        
        const currentTime = Date.now();
        
        switch (keyCode) {
            case 'ArrowLeft':
                if (currentTime - this.lastKeyPress > this.keyRepeatDelay) {
                    this.movePiece(-1, 0);
                    this.lastKeyPress = currentTime;
                }
                break;
                
            case 'ArrowRight':
                if (currentTime - this.lastKeyPress > this.keyRepeatDelay) {
                    this.movePiece(1, 0);
                    this.lastKeyPress = currentTime;
                }
                break;
                
            case 'ArrowDown':
                this.movePiece(0, 1);
                break;
                
            case 'ArrowUp':
            case 'Space':
                this.rotatePiece();
                break;
                
            case 'KeyC':
                this.dropPiece();
                break;
        }
        
        this.updateGhostPiece();
    }
    
    /**
     * Start the game
     */
    startGame() {
        this.gameState.start();
        this.spawnNewPiece();
        this.gameLoop();
        
        // Update button states
        this.updateButtons();
    }
    
    /**
     * Toggle pause
     */
    togglePause() {
        this.gameState.togglePause();
        
        if (this.gameState.isPaused) {
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
                this.animationId = null;
            }
        } else {
            this.gameLoop();
        }
        
        this.updateButtons();
    }
    
    /**
     * Reset the game
     */
    resetGame() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        this.board.clear();
        this.gameState.reset();
        this.currentPiece = null;
        this.nextPiece = new WordPiece();
        this.ghostPiece = null;
        
        this.updateNextPieceDisplay();
        this.updateButtons();
        this.render();
    }
    
    /**
     * Spawn a new piece
     */
    spawnNewPiece() {
        this.currentPiece = this.nextPiece;
        this.nextPiece = new WordPiece();
        
        // Position the piece at the top center
        const startX = Math.floor((this.board.width - this.currentPiece.getBounds().width) / 2);
        this.currentPiece.setPosition(startX, 0);
        
        // Check if the game is over
        if (!this.currentPiece.canFitAt(this.board, this.currentPiece.x, this.currentPiece.y)) {
            this.gameState.endGame();
            return;
        }
        
        this.updateGhostPiece();
        this.updateNextPieceDisplay();
    }
    
    /**
     * Move the current piece
     */
    movePiece(deltaX, deltaY) {
        if (!this.currentPiece) return false;
        
        if (this.currentPiece.canMove(this.board, deltaX, deltaY)) {
            this.currentPiece.move(deltaX, deltaY);
            return true;
        }
        
        // If moving down failed, lock the piece
        if (deltaY > 0) {
            this.lockPiece();
        }
        
        return false;
    }
    
    /**
     * Rotate the current piece
     */
    rotatePiece() {
        if (!this.currentPiece) return false;
        
        if (this.currentPiece.canRotate(this.board)) {
            this.currentPiece.rotate();
            return true;
        }
        
        return false;
    }
    
    /**
     * Drop the piece to the bottom
     */
    dropPiece() {
        if (!this.currentPiece) return;
        
        const dropY = this.currentPiece.getDropPosition(this.board);
        this.currentPiece.y = dropY;
        this.lockPiece();
    }
    
    /**
     * Lock the current piece in place
     */
    lockPiece() {
        if (!this.currentPiece) return;
        
        // Place the piece on the board
        this.board.placePiece(this.currentPiece, this.currentPiece.x, this.currentPiece.y);
        
        // Check for completed words
        const clearedWords = this.board.clearCompletedWords();
        
        // Award points for cleared words
        clearedWords.forEach(word => {
            this.gameState.recordWord(word, word.length);
        });
        
        // Check for game over
        if (this.board.isGameOver()) {
            this.gameState.endGame();
            return;
        }
        
        // Spawn next piece
        this.spawnNewPiece();
    }
    
    /**
     * Update the ghost piece (preview of where piece will land)
     */
    updateGhostPiece() {
        if (!this.currentPiece) {
            this.ghostPiece = null;
            return;
        }
        
        this.ghostPiece = this.currentPiece.clone();
        this.ghostPiece.y = this.currentPiece.getDropPosition(this.board);
    }
    
    /**
     * Update the next piece display
     */
    updateNextPieceDisplay() {
        const display = document.getElementById('next-word-display');
        if (display && this.nextPiece) {
            display.textContent = this.nextPiece.word;
        }
    }
    
    /**
     * Update button states
     */
    updateButtons() {
        const startBtn = document.getElementById('start-btn');
        const pauseBtn = document.getElementById('pause-btn');
        
        if (startBtn) {
            startBtn.textContent = this.gameState.isPlaying ? 'Playing...' : 'Start Game';
            startBtn.disabled = this.gameState.isPlaying && !this.gameState.gameOver;
        }
        
        if (pauseBtn) {
            pauseBtn.textContent = this.gameState.isPaused ? 'Resume' : 'Pause';
            pauseBtn.disabled = !this.gameState.isPlaying || this.gameState.gameOver;
        }
    }
    
    /**
     * Main game loop
     */
    gameLoop() {
        const currentTime = Date.now();
        
        // Handle automatic falling
        if (this.gameState.shouldFall(currentTime)) {
            this.movePiece(0, 1);
            this.gameState.updateFallTime(currentTime);
        }
        
        // Render the game
        this.render();
        
        // Continue the loop
        if (this.gameState.isPlaying && !this.gameState.isPaused && !this.gameState.gameOver) {
            this.animationId = requestAnimationFrame(() => this.gameLoop());
        }
    }
    
    /**
     * Render the entire game
     */
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Calculate offsets to center the board
        const boardPixelWidth = this.board.width * this.board.cellSize;
        const boardPixelHeight = this.board.height * this.board.cellSize;
        const offsetX = (this.canvas.width - boardPixelWidth) / 2;
        const offsetY = (this.canvas.height - boardPixelHeight) / 2;
        
        // Render board
        this.board.render(this.ctx, offsetX, offsetY);
        
        // Render ghost piece
        if (this.ghostPiece && this.currentPiece && this.ghostPiece.y !== this.currentPiece.y) {
            this.ghostPiece.render(this.ctx, offsetX, offsetY, this.board.cellSize, 0.3);
        }
        
        // Render current piece
        if (this.currentPiece) {
            this.currentPiece.render(this.ctx, offsetX, offsetY, this.board.cellSize);
        }
        
        // Render pause overlay
        if (this.gameState.isPaused) {
            this.renderPauseOverlay();
        }
    }
    
    /**
     * Render pause overlay
     */
    renderPauseOverlay() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
    }
    
    /**
     * Show game over screen
     */
    showGameOver(data) {
        const overlay = document.createElement('div');
        overlay.className = 'game-over-overlay';
        overlay.innerHTML = `
            <div class="game-over-modal">
                <h2>Game Over!</h2>
                <p>Final Score: ${formatScore(data.score)}</p>
                <p>Level Reached: ${data.level}</p>
                <p>Words Formed: ${data.wordsFormed}</p>
                <p>Longest Word: ${data.longestWord}</p>
                <button onclick="this.parentElement.parentElement.remove(); game.resetGame();">
                    Play Again
                </button>
            </div>
        `;
        document.body.appendChild(overlay);
        
        this.updateButtons();
    }
    
    /**
     * Show word formed notification
     */
    showWordFormed(data) {
        // Create a temporary notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4ecdc4;
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            font-weight: bold;
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;
        notification.textContent = `${data.word} (+${data.points} points)`;
        
        document.body.appendChild(notification);
        
        // Remove after 2 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 2000);
    }
    
    /**
     * Get current game statistics
     */
    getStats() {
        return this.gameState.getStats();
    }
}

// Add CSS for notification animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);