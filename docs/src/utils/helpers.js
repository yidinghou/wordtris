// Utility functions for the game

/**
 * Generate a random integer between min and max (inclusive)
 */
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Get a random element from an array
 */
function randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Check if two rectangles collide
 */
function rectanglesCollide(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

/**
 * Clamp a value between min and max
 */
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Format score with commas
 */
function formatScore(score) {
    return score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Debounce function to limit function calls
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Deep clone an object
 */
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if a string is a valid word (basic implementation)
 */
function isValidWord(word) {
    // This is a basic implementation - you might want to integrate with a dictionary API
    const commonWords = [
        'THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN', 'HER', 'WAS', 'ONE',
        'OUR', 'HAD', 'HAS', 'HOW', 'WHO', 'OIL', 'USE', 'HIM', 'SHE', 'NOW', 'ITS', 'WAY',
        'MAY', 'SAY', 'NEW', 'TRY', 'MAN', 'DAY', 'TOO', 'OLD', 'SEE', 'TWO', 'GOT', 'BOY',
        'DID', 'WHY', 'LET', 'PUT', 'END', 'WHY', 'TRY', 'GOD', 'SIX', 'DOG', 'EAT', 'AGO',
        'SIT', 'FUN', 'BAD', 'YES', 'YET', 'ARM', 'FAR', 'OFF', 'BAG', 'BIG', 'BOX', 'CAR',
        'CAT', 'CUT', 'EYE', 'FEW', 'GOT', 'GUN', 'HOT', 'JOB', 'LOT', 'MOM', 'RED', 'RUN',
        'SEA', 'SET', 'SUN', 'TOP', 'WIN', 'BAT', 'BED', 'BIT', 'BOW', 'BUS', 'CUP', 'EAR',
        'EGG', 'FAN', 'FIG', 'FLY', 'FOX', 'HAT', 'HIT', 'ICE', 'JAR', 'KEY', 'LEG', 'MAP',
        'NET', 'NUT', 'PAN', 'PEN', 'PIE', 'POT', 'RAT', 'RUG', 'SAD', 'SKY', 'TEA', 'TOY'
    ];
    
    return word.length >= 3 && commonWords.includes(word.toUpperCase());
}