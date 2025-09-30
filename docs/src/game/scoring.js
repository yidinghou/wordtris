/**
 * Manages game scoring, including letter point values, word calculation,
 * preventing duplicate scoring, and updating the score display in the DOM.
 */
export class Scoring {
    constructor() {
        this.score = 0;
        // Target element where the current score is displayed
        this.scoreElement = document.getElementById('score');

        // Standard Scrabble-like point values for letters
        this.letterValues = {
            'A': 1, 'B': 3, 'C': 3, 'D': 2, 'E': 1, 'F': 4,
            'G': 2, 'H': 4, 'I': 1, 'J': 8, 'K': 5, 'L': 1,
            'M': 3, 'N': 1, 'O': 1, 'P': 3, 'Q': 10, 'R': 1,
            'S': 1, 'T': 1, 'U': 1, 'V': 4, 'W': 4, 'X': 8,
            'Y': 4, 'Z': 10
        };

        // Track last word scored to prevent double-counting within a short period
        this.lastWordScored = "";
        this.lastScoredTimestamp = 0;
    }

    /**
     * Calculates the score for a given word.
     * Score = Word Length + Sum of Letter Point Values
     *
     * @param {string} word - The word string to calculate points for.
     * @returns {number} The total points for the word.
     */
    calculateWordScore(word) {
        const wordLength = word.length;
        let scrabblePoints = 0;

        for (let i = 0; i < wordLength; i++) {
            const letter = word[i].toUpperCase();
            // Get value, defaulting to 0 if the letter isn't found
            scrabblePoints += this.letterValues[letter] || 0;
        }

        // Final score is based on both length and letter values
        return wordLength + scrabblePoints;
    }

    /**
     * Calculates the word score, adds it to the total score, updates the display,
     * and handles prevention of duplicate scoring.
     *
     * @param {string} word - The word string to be scored.
     * @returns {number} The points earned from this scoring operation (0 if duplicate).
     */
    addPoints(word) {
        const now = Date.now();

        // Prevent double-counting the same word in quick succession (within 500ms)
        if (word === this.lastWordScored && (now - this.lastScoredTimestamp < 500)) {
            console.log('Preventing duplicate scoring for word:', word);
            return 0;
        }

        const pointsEarned = this.calculateWordScore(word);
        this.score += pointsEarned;
        this.updateDisplay();

        // Store this word as the last scored
        this.lastWordScored = word;
        this.lastScoredTimestamp = now;

        return pointsEarned;
    }

    /**
     * Resets the total score to zero and updates the display.
     */
    resetScore() {
        this.score = 0;
        this.updateDisplay();
        // Also reset duplication prevention trackers
        this.lastWordScored = "";
        this.lastScoredTimestamp = 0;
    }

    /**
     * Updates the text content of the score display element in the DOM.
     */
    updateDisplay() {
        if (this.scoreElement) {
            this.scoreElement.textContent = this.score;
        }
    }
}
