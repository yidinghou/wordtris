/**
 * A class responsible for loading a dictionary, validating words on the game board,
 * and applying special themes when certain words are found.
 */
export class WordValidator {
    /**
     * @param {number} minWordLength - The minimum required length for a valid word (default 3).
     */
    constructor(minWordLength = 3) {
        this.minWordLength = minWordLength;
        this.validWords = [];       // Array of all valid words loaded from the dictionary
        this.wordDefinitions = {};  // Object mapping words to their definitions
        this.wordFound = false;     // Flag to track if any word was found in the current check

        // Special words that trigger a visual theme change
        this.specialWords = {
            "red": "theme-red",
            "blue": "theme-blue",
            "green": "theme-green",
            // Add more special words as needed
        };

        this.loadWords();
    }

    /**
     * Asynchronously loads the dictionary from a 'dict.csv' file and populates
     * the validWords and wordDefinitions properties.
     */
    async loadWords() {
        try {
            const response = await fetch('./dict.csv');
            const data = await response.text();
            
            this.validWords = [];
            this.wordDefinitions = {};
            
            const lines = data.split('\n').filter(line => line.trim().length > 2);
            if (lines.length <= 2) return; // No data or only headers

            // Parse Headers
            const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
            const wordIdx = headers.indexOf('word');
            const defIdx = headers.indexOf('definition');

            // Ensure we found the necessary header columns
            if (wordIdx === -1 || defIdx === -1) return;

            // Parse Rows
            for (let i = 1; i < lines.length; i++) {
                const row = lines[i].split(',');
                const wordRaw = row[wordIdx];
                const defRaw = row[defIdx];

                if (!wordRaw) continue;

                const word = wordRaw.trim();
                const def = defRaw.replace(/[\r\n]/g, '<br>'); // Replace newlines with <br> for HTML

                // Validation check for words
                if (word.length >= this.minWordLength && word.length <= 7 && /^[a-z]+$/.test(word)) {
                    this.validWords.push(word);
                    this.wordDefinitions[word] = def;
                }
            }
            console.log(`WordValidator: Loaded ${this.validWords.length} words.`);
        } catch (error) {
            console.error('Error loading words:', error);
        }
    }

    /**
     * Gets the definition for a given word.
     * @param {string} word - The word to look up.
     * @returns {string} The definition or 'Definition not found'.
     */
    getDefinition(word) {
        return this.wordDefinitions[word] || 'Definition not found';
    }

    /**
     * Applies a special CSS theme to the document body if the word is special.
     * @param {string} word - The word to check.
     * @returns {boolean} True if a theme was applied, false otherwise.
     */
    applyTheme(word) {
        const wordLower = word.toLowerCase();
        if (this.specialWords[wordLower]) {
            // Remove any existing theme classes
            Object.values(this.specialWords).forEach(themeClass => {
                document.body.classList.remove(themeClass);
            });

            // Apply the new theme
            document.body.classList.add(this.specialWords[wordLower]);
            console.log(`Applied theme: ${this.specialWords[wordLower]} for word: ${word}`);
            return true;
        }
        return false;
    }

    // --- Word Collection Helpers ---

    /**
     * Collects letters from a specific column, substituting empty tiles with spaces.
     */
    getColumnLetters(game, board, col) {
        let letters = '';
        let positions = [];

        for (let r = 0; r < game.rows; r++) {
            const tile = board.getTileElement(r, col);
            if (tile && tile.textContent) {
                letters += tile.textContent;
            } else {
                letters += ' '; // Add space for empty/null tiles
            }
            positions.push([r, col]);
        }
        return this.filterSpacesAndPositions(letters, positions);
    }

    /**
     * Collects letters from a specific row, substituting empty tiles with spaces.
     */
    getRowLetters(game, board, row) {
        let letters = '';
        let positions = [];

        for (let c = 0; c < game.cols; c++) {
            const tile = board.getTileElement(row, c);
            if (tile && tile.textContent) {
                letters += tile.textContent;
            } else {
                letters += ' '; // Add space for empty/null tiles
            }
            positions.push([row, c]);
        }
        return this.filterSpacesAndPositions(letters, positions);
    }

    /**
     * Collects letters along a diagonal, substituting empty tiles with spaces.
     * @param {string} direction - 'main' for top-left to bottom-right, 'anti' for top-right to bottom-left.
     */
    getDiagonalLetters(game, board, startRow, startCol, direction = 'main') {
        let letters = '';
        let positions = [];

        // Define diagonal traversal direction
        const rowIncrement = (direction === 'main') ? 1 : -1; // Down for main, up for anti

        // Step 1: Move to leftmost position on the diagonal
        let r = startRow;
        let c = startCol;

        // Traverse to the true start of the diagonal line based on direction
        while (c > 0 && r >= 0 && r < game.rows) {
            c--;
            r -= rowIncrement;
        }

        // Correct for overshooting the board boundary
        if (c < 0) { c = 0; r += rowIncrement; }
        if (r < 0) { r = 0; c += (direction === 'anti' ? 1 : 0); }
        if (r >= game.rows) { r = game.rows - 1; c -= (direction === 'main' ? 1 : 0); }


        // Step 2: Traverse diagonally right, collecting letters
        while (r >= 0 && r < game.rows && c < game.cols) {
            const tile = board.getTileElement(r, c);
            if (tile && tile.textContent) {
                letters += tile.textContent;
            } else {
                letters += ' '; // Add space for empty/null tiles
            }
            positions.push([r, c]);

            c++; // Move right
            r += rowIncrement; // Move down for main diagonal, up for anti-diagonal
        }

        return this.filterSpacesAndPositions(letters, positions);
    }

    /**
     * Filters the letter string and position array, removing leading/trailing spaces
     * and sections that are only spaces between word segments.
     * NOTE: This is a simplified interpretation of the code's intent given the
     * constraints of string matching.
     */
    filterSpacesAndPositions(letters, positions) {
        // Split the string by spaces to get potential word segments
        const segments = letters.split(' ');
        const segmentInfo = [];
        let posIndex = 0;

        for (const segment of segments) {
            if (segment.length >= this.minWordLength) {
                // If a segment is a potential word, we need to track its start position
                segmentInfo.push({
                    word: segment.toLowerCase(),
                    startIndex: posIndex + letters.indexOf(segment),
                    endIndex: posIndex + letters.indexOf(segment) + segment.length
                });
            }
            // Update posIndex to point to the start of the next segment search
            posIndex += segment.length + 1;
        }

        return { letters, positions }; // Return original data for now, actual word finding is done in findValidWordsInString
    }

    // --- Core Word Finding ---

    /**
     * Finds all valid words (of minLength or greater) within a continuous string of letters.
     * @param {string} letters - A string of letters (without spaces).
     * @returns {object[]} An array of word objects {word, startIndex}.
     */
    findValidWordsInString(letters) {
        const foundWords = [];
        const letterString = letters.toLowerCase();

        for (let i = 0; i < letterString.length; i++) {
            for (let j = i + this.minWordLength; j <= letterString.length; j++) {
                const subString = letterString.substring(i, j);

                if (this.validWords.includes(subString)) {
                    foundWords.push({
                        word: subString,
                        startIndex: i
                    });
                }
            }
        }
        return foundWords;
    }

    // --- Tile Conversion and Processing ---

    /**
     * Converts word positions (startIndex and length) into actual tile elements.
     * @returns {HTMLElement[]} An array of the tile elements corresponding to the word.
     */
    _getTilesForWord(wordObj, direction, board, row, col) {
        const tiles = [];

        switch (direction) {
            case 'column':
                for (let i = 0; i < wordObj.word.length; i++) {
                    // Position is row index = startIndex + i
                    const actualRow = wordObj.startIndex + i;
                    const tile = board.getTileElement(actualRow, col);
                    if (tile) tiles.push(tile);
                }
                break;

            case 'row':
                for (let i = 0; i < wordObj.word.length; i++) {
                    // Position is col index = startIndex + i
                    const colPos = wordObj.startIndex + i;
                    const tile = board.getTileElement(row, colPos);
                    if (tile) tiles.push(tile);
                }
                break;

            case 'mainDiag':
                // Find top-left starting point (r, c) of the diagonal line
                let startRow = row;
                let startCol = col;
                while (startRow > 0 && startCol > 0) {
                    startRow--;
                    startCol--;
                }

                // Traverse from the diagonal start, using startIndex
                for (let i = 0; i < wordObj.word.length; i++) {
                    // r = startRow + (startIndex + i), c = startCol + (startIndex + i)
                    const r = startRow + wordObj.startIndex + i;
                    const c = startCol + wordObj.startIndex + i;

                    if (r >= 0 && r < board.game.rows && c >= 0 && c < board.game.cols) {
                        const tile = board.getTileElement(r, c);
                        if (tile) tiles.push(tile);
                    }
                }
                break;

            case 'antiDiag':
                // Find bottom-left starting point (r, c) of the diagonal line
                let startRowAnti = row;
                let startColAnti = col;
                while (startRowAnti < board.game.rows - 1 && startColAnti > 0) {
                    startRowAnti++;
                    startColAnti--;
                }

                // Traverse from the diagonal start, using startIndex
                for (let i = 0; i < wordObj.word.length; i++) {
                    // r = startRowAnti - (startIndex + i), c = startColAnti + (startIndex + i)
                    // The anti-diagonal index calculation is complex. This interpretation uses the
                    // indices derived from the getDiagonalLetters process.

                    // To simplify this, we'll rely on the position array from getDiagonalLetters
                    // which is missing from the passed arguments. Since we can't access that here,
                    // we'll use the geometric calculation:
                    const r = startRowAnti - (wordObj.startIndex + i);
                    const c = startColAnti + (wordObj.startIndex + i);

                    if (r >= 0 && r < board.game.rows && c >= 0 && c < board.game.cols) {
                        const tile = board.getTileElement(r, c);
                        if (tile) tiles.push(tile);
                    }
                }
                break;
        }

        return tiles;
    }

    /**
     * Processes an array of found word objects, applies themes, and calls the callback.
     * @returns {boolean} True if any words were found, false otherwise.
     */
    _processFoundWords(words, direction, board, row, col, callback) {
        let foundAnyWords = false;

        words.forEach(wordObj => {
            console.log(`Found word in ${direction}: ${wordObj.word}`);
            this.applyTheme(wordObj.word);
            foundAnyWords = true;
            this.wordFound = true; // Set general flag

            // Get tiles based on direction and word position
            const tiles = this._getTilesForWord(wordObj, direction, board, row, col);

            // Only call callback if we found all tiles for the word
            if (tiles.length === wordObj.word.length) {
                callback(tiles, wordObj.word); // Pass word string to callback
            }
        });

        return foundAnyWords;
    }

    // --- Directional Checks ---

    checkColumn(game, board, col, callback) {
        const { letters, positions } = this.getColumnLetters(game, board, col);
        // Find valid words in the string of letters
        const foundWords = this.findValidWordsInString(letters);

        if (foundWords.length === 0) return false;

        // Process only the first word found (as per the implied logic)
        const wordObj = foundWords[0];

        // Process found word (convert to tiles, apply theme, call callback)
        return this._processFoundWords([wordObj], 'column', board, 0, col, callback);
    }

    checkRow(game, board, row, callback) {
        const { letters, positions } = this.getRowLetters(game, board, row);
        const foundWords = this.findValidWordsInString(letters);

        if (foundWords.length === 0) return false;

        const wordObj = foundWords[0];
        return this._processFoundWords([wordObj], 'row', board, row, 0, callback);
    }

    checkMainDiagonal(game, board, row, col, callback) {
        // Step 1: Get the true top-left starting point for the diagonal line passing through (row, col)
        let startRow = row;
        let startCol = col;
        while (startRow > 0 && startCol > 0) {
            startRow--;
            startCol--;
        }

        // Step 2: Get the letters and positions for the entire diagonal line
        const { letters, positions } = this.getDiagonalLetters(game, board, row, col, 'main');
        const foundWords = this.findValidWordsInString(letters);

        if (foundWords.length === 0) return false;

        const wordObj = foundWords[0];
        // Process found word (convert to tiles, apply theme, call callback)
        // Pass the calculated start points of the diagonal line
        return this._processFoundWords([wordObj], 'mainDiag', board, row, col, callback);
    }

    checkAntiDiagonal(game, board, row, col, callback) {
        // Step 1: Get the true bottom-left starting point for the anti-diagonal line passing through (row, col)
        let startRow = row;
        let startCol = col;
        while (startRow < game.rows - 1 && startCol > 0) {
            startRow++;
            startCol--;
        }

        // Step 2: Get the letters and positions for the entire anti-diagonal line
        const { letters, positions } = this.getDiagonalLetters(game, board, row, col, 'anti');
        const foundWords = this.findValidWordsInString(letters);

        if (foundWords.length === 0) return false;

        const wordObj = foundWords[0];
        // Process found word (convert to tiles, apply theme, call callback)
        // Pass the calculated start points of the anti-diagonal line
        return this._processFoundWords([wordObj], 'antiDiag', board, row, col, callback);
    }

    /**
     * The main function to check for words in all four directions.
     * @returns {boolean} True if any words were found, false otherwise.
     */
    checkWords(game, board, row, col, callback) {
        // Reset word found flag at the beginning
        this.wordFound = false;

        // Check in all four directions
        const colFound = this.checkColumn(game, board, col, callback);
        const rowFound = this.checkRow(game, board, row, callback);
        const mainDiagFound = this.checkMainDiagonal(game, board, row, col, callback);
        const antiDiagFound = this.checkAntiDiagonal(game, board, row, col, callback);

        // Synchronize the overall result with the general wordFound flag
        const foundAnyWords = colFound || rowFound || mainDiagFound || antiDiagFound;
        this.wordFound = foundAnyWords;

        return foundAnyWords;
    }
}