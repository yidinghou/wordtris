/**
 * A class responsible for generating a constrained and weighted sequence of letters (tiles)
 * for a tile-based word game.
 */
export class TileGenerator {
    /**
     * @param {number} tileCount - The total number of tiles to generate in a batch.
     */
    constructor(tileCount = 100) {
        this.tileCount = tileCount;
        this.currentIndex = 0; // Tracks which tile in the sequence is next

        // Define vowels (used for generation rules)
        this.vowels = 'aeiou'.split('');
        // Define consonants (all letters not vowels)
        this.consonants = 'abcdefghijklmnopqrstuvwxyz'.split('')
            .filter(l => !this.vowels.includes(l));

        // Letter weights based on approximate Scrabble/English frequency
        this.letterWeights = {
            a: 8.27, b: 1.49, c: 2.78, d: 4.25, e: 12.70, f: 2.23, g: 2.02, h: 6.09,
            i: 6.97, j: 0.15, k: 0.77, l: 4.09, m: 2.41, n: 6.75, o: 7.51, p: 1.93,
            q: 0.10, r: 5.99, s: 6.33, t: 9.06, u: 2.76, v: 0.98, w: 2.36, x: 0.15,
            y: 1.97, z: 0.07
        };

        // The generated pool of letters, built according to weights
        this.letterPool = this._buildWeightedPool();

        // Initial generation of the tile sequence
        this.generateTiles();
    }

    // --- Private Helper Methods ---

    /**
     * Creates a weighted pool (array) of letters based on the percentages
     * in this.letterWeights, which is used for random selection.
     * @returns {string[]} An array of letters, where frequency reflects weight.
     */
    _buildWeightedPool() {
        const pool = [];
        // Scale the weights by 10 to get integer counts (e.g., 8.2 becomes 82)
        Object.entries(this.letterWeights).forEach(([letter, weight]) => {
            for (let i = 0; i < Math.round(weight * 10); i++) {
                pool.push(letter);
            }
        });
        return pool;
    }

    /**
     * Picks a random letter from the pre-built weighted pool.
     * @returns {string} A randomly selected letter.
     */
    _pickRandomLetter() {
        const idx = Math.floor(Math.random() * this.letterPool.length);
        return this.letterPool[idx];
    }

    /**
     * Validates if the next letter meets the game's sequence constraints.
     *
     * @param {string} nextLetter - The candidate letter.
     * @param {string[]} lastTiles - The sequence of recently placed tiles.
     * @returns {boolean} True if the letter is valid, false otherwise.
     */
    _isValidNextLetter(nextLetter, lastTiles) {
        const recentTiles = lastTiles.slice(-10); // Check the last 10 tiles

        // Rule 1: No single tile (character) 3 times in the last 10
        const recentCount = recentTiles.filter(l => l === nextLetter).length;
        if (recentCount >= 3) {
            return false;
        }

        // Rule 2: No more than 3 vowels/consonants in a row
        let streak = 0;
        const isVowel = this.vowels.includes(nextLetter);

        // Check the current streak in the recent history
        for (let i = recentTiles.length - 1; i >= 0; i--) {
            if (this.vowels.includes(recentTiles[i]) === isVowel) {
                streak++;
            } else {
                break; // Streak broken
            }
        }

        if (streak >= 3) {
            return false;
        }

        return true; // All constraints passed
    }

    // --- Public Generation Methods ---

    /**
     * Generates a new sequence of tiles, ensuring they follow the constraints.
     * This method resets the sequence and current index.
     */
    generateTiles() {
        this.tiles = [];
        const lastTiles = []; // Tracks the last N successfully generated tiles for constraint checking

        while (this.tiles.length < this.tileCount) {
            let tries = 0;
            let nextLetter;

            do {
                nextLetter = this._pickRandomLetter();
                tries++;

                // Avoid infinite loop if constraints are too strict
                if (tries > 100) {
                    console.warn("Tile generation constraints too strict. Breaking loop.");
                    break;
                }
            } while (!this._isValidNextLetter(nextLetter, lastTiles));

            // Only push if a valid letter was found (not broken by the 100 tries)
            if (tries <= 100) {
                this.tiles.push(nextLetter);
                lastTiles.push(nextLetter); // Update the lastTiles tracker
            }
        }

        this.currentIndex = 0; // Reset index to the start of the new sequence
    }

    /**
     * Gets the next tile in the sequence. If the sequence is exhausted, it regenerates it.
     * @returns {string} The next letter in the generated sequence.
     */
    getNextTile() {
        // If we've exhausted the current batch, generate a new one
        if (this.currentIndex >= this.tiles.length) {
            this.generateTiles();
        }

        // Return the current tile and increment the index
        return this.tiles[this.currentIndex++];
    }

    /**
     * Resets the sequence to the beginning by generating a fresh batch of tiles.
     */
    reset() {
        this.generateTiles();
    }
}
