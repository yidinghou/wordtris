// Game state management
class GameState {
    constructor() {
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.isPlaying = false;
        this.isPaused = false;
        this.gameOver = false;
        this.fallSpeed = 1000; // milliseconds between automatic falls
        this.lastFall = 0;
        
        // Game statistics
        this.wordsFormed = 0;
        this.totalLetters = 0;
        this.longestWord = '';
        
        // Event listeners for state changes
        this.listeners = {
            scoreChange: [],
            levelChange: [],
            gameOver: [],
            wordFormed: []
        };
    }
    
    /**
     * Reset game state to initial values
     */
    reset() {
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.isPlaying = false;
        this.isPaused = false;
        this.gameOver = false;
        this.fallSpeed = 1000;
        this.lastFall = 0;
        this.wordsFormed = 0;
        this.totalLetters = 0;
        this.longestWord = '';
        
        this.updateDisplay();
    }
    
    /**
     * Start the game
     */
    start() {
        this.isPlaying = true;
        this.isPaused = false;
        this.gameOver = false;
        this.lastFall = Date.now();
    }
    
    /**
     * Pause/unpause the game
     */
    togglePause() {
        if (!this.isPlaying || this.gameOver) return;
        
        this.isPaused = !this.isPaused;
        if (!this.isPaused) {
            this.lastFall = Date.now(); // Reset fall timer
        }
    }
    
    /**
     * End the game
     */
    endGame() {
        this.isPlaying = false;
        this.gameOver = true;
        this.notifyListeners('gameOver', {
            score: this.score,
            level: this.level,
            wordsFormed: this.wordsFormed,
            longestWord: this.longestWord
        });
    }
    
    /**
     * Add points to the score
     */
    addScore(points) {
        this.score += points;
        this.notifyListeners('scoreChange', this.score);
        this.updateDisplay();
        
        // Check for level up (every 1000 points)
        const newLevel = Math.floor(this.score / 1000) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            this.fallSpeed = Math.max(100, 1000 - (this.level - 1) * 100);
            this.notifyListeners('levelChange', this.level);
        }
    }
    
    /**
     * Record a completed word
     */
    recordWord(word, letters) {
        this.wordsFormed++;
        this.totalLetters += letters;
        
        if (word.length > this.longestWord.length) {
            this.longestWord = word;
        }
        
        // Score calculation: base points + length bonus + level multiplier
        const basePoints = 10;
        const lengthBonus = word.length * 5;
        const levelMultiplier = this.level;
        const totalPoints = (basePoints + lengthBonus) * levelMultiplier;
        
        this.addScore(totalPoints);
        this.notifyListeners('wordFormed', { word, points: totalPoints });
    }
    
    /**
     * Check if it's time for the current piece to fall
     */
    shouldFall(currentTime) {
        if (!this.isPlaying || this.isPaused || this.gameOver) {
            return false;
        }
        
        return currentTime - this.lastFall >= this.fallSpeed;
    }
    
    /**
     * Update the last fall time
     */
    updateFallTime(currentTime) {
        this.lastFall = currentTime;
    }
    
    /**
     * Add event listener for state changes
     */
    addEventListener(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event].push(callback);
        }
    }
    
    /**
     * Notify all listeners of an event
     */
    notifyListeners(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }
    
    /**
     * Update the HTML display elements
     */
    updateDisplay() {
        const scoreElement = document.getElementById('score');
        const levelElement = document.getElementById('level');
        
        if (scoreElement) {
            scoreElement.textContent = formatScore(this.score);
        }
        
        if (levelElement) {
            levelElement.textContent = this.level;
        }
    }
    
    /**
     * Get game statistics
     */
    getStats() {
        return {
            score: this.score,
            level: this.level,
            wordsFormed: this.wordsFormed,
            totalLetters: this.totalLetters,
            longestWord: this.longestWord,
            averageWordLength: this.wordsFormed > 0 ? (this.totalLetters / this.wordsFormed).toFixed(1) : 0
        };
    }
}