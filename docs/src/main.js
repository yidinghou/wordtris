// Main application entry point
let game;

/**
 * Initialize the game when the page loads
 */
function initializeGame() {
    try {
        // Create game instance
        game = new GameEngine('game-canvas');
        
        console.log('Wordtris game initialized successfully!');
        console.log('Controls:');
        console.log('- Arrow keys: Move piece');
        console.log('- Spacebar/Up arrow: Rotate piece');
        console.log('- C key: Drop piece');
        
        // Set canvas focus for keyboard input
        const canvas = document.getElementById('game-canvas');
        canvas.setAttribute('tabindex', '0');
        canvas.focus();
        
    } catch (error) {
        console.error('Failed to initialize game:', error);
        showError('Failed to initialize game. Please refresh the page.');
    }
}

/**
 * Show error message to user
 */
function showError(message) {
    const container = document.querySelector('.game-container');
    if (container) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #ff6b6b;">
                <h3>Error</h3>
                <p>${message}</p>
                <button onclick="location.reload()">Reload Page</button>
            </div>
        `;
    }
}

/**
 * Handle window resize to maintain canvas aspect ratio
 */
function handleResize() {
    if (!game) return;
    
    const canvas = game.canvas;
    const container = canvas.parentElement;
    
    // Maintain aspect ratio
    const containerWidth = container.clientWidth - 40; // Account for padding
    const aspectRatio = canvas.height / canvas.width;
    
    if (containerWidth < canvas.width) {
        canvas.style.width = containerWidth + 'px';
        canvas.style.height = (containerWidth * aspectRatio) + 'px';
    } else {
        canvas.style.width = canvas.width + 'px';
        canvas.style.height = canvas.height + 'px';
    }
}

/**
 * Show game instructions
 */
function showInstructions() {
    const modal = document.createElement('div');
    modal.className = 'game-over-overlay';
    modal.innerHTML = `
        <div class="game-over-modal">
            <h2>How to Play Wordtris</h2>
            <div style="text-align: left; margin: 20px 0;">
                <h3>Objective:</h3>
                <p>Form complete words by arranging falling letter pieces. Clear words to score points!</p>
                
                <h3>Controls:</h3>
                <ul>
                    <li><strong>← →</strong> Move piece left/right</li>
                    <li><strong>↓</strong> Move piece down faster</li>
                    <li><strong>↑ or Space</strong> Rotate piece</li>
                    <li><strong>C</strong> Drop piece instantly</li>
                </ul>
                
                <h3>Scoring:</h3>
                <ul>
                    <li>Form words of 3+ letters horizontally or vertically</li>
                    <li>Longer words = more points</li>
                    <li>Higher levels = score multipliers</li>
                </ul>
                
                <h3>Tips:</h3>
                <ul>
                    <li>Plan ahead - use the ghost piece preview</li>
                    <li>Try to form multiple words at once</li>
                    <li>Don't let pieces reach the top!</li>
                </ul>
            </div>
            <button onclick="this.parentElement.parentElement.remove()">Got it!</button>
        </div>
    `;
    document.body.appendChild(modal);
}

/**
 * Add instructions button
 */
function addInstructionsButton() {
    const controls = document.querySelector('.game-controls');
    if (controls) {
        const helpBtn = document.createElement('button');
        helpBtn.textContent = 'Help';
        helpBtn.onclick = showInstructions;
        controls.appendChild(helpBtn);
    }
}

/**
 * Check for mobile device and show touch controls info
 */
function checkMobileDevice() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        const mobileInfo = document.createElement('div');
        mobileInfo.style.cssText = `
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 10px;
            padding: 15px;
            margin: 20px 0;
            text-align: center;
        `;
        mobileInfo.innerHTML = `
            <strong>Mobile Controls:</strong><br>
            Tap and drag to move pieces, tap to rotate
        `;
        
        const container = document.querySelector('.game-container');
        container.insertBefore(mobileInfo, container.firstChild);
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
    addInstructionsButton();
    checkMobileDevice();
});

window.addEventListener('resize', debounce(handleResize, 250));

// Prevent context menu on canvas
document.addEventListener('contextmenu', (e) => {
    if (e.target.tagName === 'CANVAS') {
        e.preventDefault();
    }
});

// Handle visibility change (pause when tab not active)
document.addEventListener('visibilitychange', () => {
    if (game && game.gameState.isPlaying && !game.gameState.isPaused) {
        if (document.hidden) {
            game.togglePause();
        }
    }
});

// Export for global access
window.game = game;