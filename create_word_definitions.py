#!/usr/bin/env python3
"""
Script to create a CSV file with words and definitions using NLTK WordNet.
"""

import csv
import nltk
from nltk.corpus import wordnet as wn
from nltk.corpus import words
import random

def download_required_data():
    """Download required NLTK data."""
    try:
        nltk.data.find('corpora/wordnet')
        print("WordNet already downloaded")
    except LookupError:
        print("Downloading WordNet...")
        nltk.download('wordnet')
    
    try:
        nltk.data.find('corpora/words')
        print("Words corpus already downloaded")
    except LookupError:
        print("Downloading words corpus...")
        nltk.download('words')
    
    try:
        nltk.data.find('corpora/omw-1.4')
        print("Open Multilingual Wordnet already downloaded")
    except LookupError:
        print("Downloading Open Multilingual Wordnet...")
        nltk.download('omw-1.4')

def get_word_definition(word):
    """
    Get the best definition for a word using WordNet.
    Returns the first definition of the most common synset.
    """
    synsets = wn.synsets(word)
    if synsets:
        # Get the first synset (most common)
        synset = synsets[0]
        # Return the definition
        return synset.definition()
    return None

def clean_word(word):
    """Clean and validate a word."""
    word = word.lower().strip()
    # Only keep words with alphabetic characters
    if word.isalpha() and len(word) >= 3:
        return word
    return None

def create_word_definition_csv(filename="word_definitions.csv", max_words=1000, min_length=3, max_length=8):
    """
    Create a CSV file with words and definitions.
    
    Args:
        filename (str): Output CSV filename
        max_words (int): Maximum number of words to include
        min_length (int): Minimum word length
        max_length (int): Maximum word length
    """
    print(f"Creating {filename} with up to {max_words} words...")
    
    # Get English words from NLTK
    english_words = set(words.words())
    
    # Filter words by length
    filtered_words = [word for word in english_words 
                     if min_length <= len(word) <= max_length and word.isalpha()]
    
    # Shuffle to get a random selection
    random.shuffle(filtered_words)
    
    word_definitions = []
    processed = 0
    
    for word in filtered_words:
        if len(word_definitions) >= max_words:
            break
            
        cleaned_word = clean_word(word)
        if cleaned_word:
            definition = get_word_definition(cleaned_word)
            if definition:
                word_definitions.append((cleaned_word, definition))
                processed += 1
                
                if processed % 100 == 0:
                    print(f"Processed {processed} words...")
    
    # Write to CSV
    with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.writer(csvfile)
        # Write header
        writer.writerow(['word', 'definition'])
        # Write data
        writer.writerows(word_definitions)
    
    print(f"Created {filename} with {len(word_definitions)} word-definition pairs")
    return len(word_definitions)

def create_words_by_length_csv(target_length, max_words_per_length=500):
    """
    Create a CSV for words of a specific length.
    
    Args:
        target_length (int): The target word length (3-8)
        max_words_per_length (int): Maximum number of words to include for this length
    
    Returns:
        int: Number of word-definition pairs created
    """
    filename = f"{target_length}_letter_words_definitions.csv"
    print(f"Creating {filename} for {target_length}-letter words...")
    
    # Get all English words
    try:
        english_words = set(words.words())
        # Filter words by exact length
        filtered_words = [word.lower() for word in english_words 
                         if len(word) == target_length and word.isalpha()]
        
        # Shuffle to get a random selection
        random.shuffle(filtered_words)
        
        # Limit to max_words_per_length
        filtered_words = filtered_words[:max_words_per_length * 2]  # Get more than needed in case some don't have definitions
        
    except Exception as e:
        print(f"Error accessing words corpus: {e}")
        return 0
    
    word_definitions = []
    processed = 0
    
    for word in filtered_words:
        if len(word_definitions) >= max_words_per_length:
            break
            
        cleaned_word = clean_word(word)
        if cleaned_word and len(cleaned_word) == target_length:
            definition = get_word_definition(cleaned_word)
            if definition:
                word_definitions.append((cleaned_word, definition))
                processed += 1
                
                if processed % 50 == 0:
                    print(f"  Processed {processed} {target_length}-letter words...")
    
    # Sort alphabetically
    word_definitions.sort(key=lambda x: x[0])
    
    # Write to CSV
    with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.writer(csvfile)
        # Write header
        writer.writerow(['word', 'definition'])
        # Write data
        writer.writerows(word_definitions)
    
    print(f"  Created {filename} with {len(word_definitions)} word-definition pairs")
    return len(word_definitions)

def create_all_length_csvs(min_length=3, max_length=8, max_words_per_length=500):
    """
    Create CSV files for words of each length from min_length to max_length.
    
    Args:
        min_length (int): Minimum word length (default: 3)
        max_length (int): Maximum word length (default: 8)
        max_words_per_length (int): Maximum words per length file (default: 500)
    
    Returns:
        dict: Dictionary mapping length to count of words generated
    """
    print(f"Creating separate CSV files for word lengths {min_length}-{max_length}...")
    
    results = {}
    total_words = 0
    
    for length in range(min_length, max_length + 1):
        count = create_words_by_length_csv(length, max_words_per_length)
        results[length] = count
        total_words += count
    
    print("\nSummary of length-specific files:")
    for length, count in results.items():
        print(f"  {length}-letter words: {count} entries in '{length}_letter_words_definitions.csv'")
    
    print(f"Total words across all files: {total_words}")
    return results

def create_combined_length_csv(filename="all_words_3_to_8_letters.csv", max_words_per_length=300):
    """
    Create a single CSV with all words from 3-8 letters, organized by length.
    
    Args:
        filename (str): Output filename
        max_words_per_length (int): Maximum words per length to include
    
    Returns:
        int: Total number of word-definition pairs created
    """
    print(f"Creating combined CSV: {filename}")
    
    all_word_definitions = []
    
    # Get words for each length
    for target_length in range(3, 9):  # 3 to 8 letters
        print(f"  Processing {target_length}-letter words...")
        
        try:
            english_words = set(words.words())
            # Filter words by exact length
            filtered_words = [word.lower() for word in english_words 
                             if len(word) == target_length and word.isalpha()]
            
            # Shuffle and limit
            random.shuffle(filtered_words)
            filtered_words = filtered_words[:max_words_per_length * 2]
            
        except Exception as e:
            print(f"    Error accessing words corpus: {e}")
            continue
        
        length_word_definitions = []
        
        for word in filtered_words:
            if len(length_word_definitions) >= max_words_per_length:
                break
                
            cleaned_word = clean_word(word)
            if cleaned_word and len(cleaned_word) == target_length:
                definition = get_word_definition(cleaned_word)
                if definition:
                    length_word_definitions.append((cleaned_word, definition))
        
        # Sort alphabetically within length
        length_word_definitions.sort(key=lambda x: x[0])
        all_word_definitions.extend(length_word_definitions)
        
        print(f"    Added {len(length_word_definitions)} {target_length}-letter words")
    
    # Write to CSV
    with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.writer(csvfile)
        # Write header
        writer.writerow(['word', 'definition'])
        # Write data
        writer.writerows(all_word_definitions)
    
    print(f"Created {filename} with {len(all_word_definitions)} total word-definition pairs")
    return len(all_word_definitions)

def main():
    """Main function to create word definition CSV files."""
    print("Word Definition CSV Generator using NLTK")
    print("=" * 50)
    
    # Download required NLTK data
    download_required_data()
    
    print("\nGenerating CSV files...")
    
    # Create a general word definitions file
    count1 = create_word_definition_csv("word_definitions.csv", max_words=2000)
    
    # Create separate CSV files for each word length (3-8 letters)
    length_results = create_all_length_csvs(min_length=3, max_length=8, max_words_per_length=500)
    
    # Create a combined file with all lengths
    count_combined = create_combined_length_csv("all_words_3_to_8_letters.csv", max_words_per_length=300)
    
    print("\nGeneration complete!")
    print(f"- General words: {count1} entries in 'word_definitions.csv'")
    print(f"- Combined 3-8 letter words: {count_combined} entries in 'all_words_3_to_8_letters.csv'")
    print("- Individual length files:")
    for length, count in length_results.items():
        print(f"  {length}-letter words: {count} entries")
    
    # Show a few examples from the combined file
    print("\nSample entries from all_words_3_to_8_letters.csv:")
    try:
        with open("all_words_3_to_8_letters.csv", 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            next(reader)  # Skip header
            for i, row in enumerate(reader):
                if i < 8:  # Show first 8 entries
                    print(f"  {row[0]} ({len(row[0])} letters): {row[1][:60]}{'...' if len(row[1]) > 60 else ''}")
                else:
                    break
    except Exception as e:
        print(f"Error reading sample: {e}")

def show_samples_by_length():
    """Show sample entries from each length-specific file."""
    print("\nSample entries by word length:")
    for length in range(3, 9):
        filename = f"{length}_letter_words_definitions.csv"
        try:
            with open(filename, 'r', encoding='utf-8') as f:
                reader = csv.reader(f)
                next(reader)  # Skip header
                first_row = next(reader, None)
                if first_row:
                    definition = first_row[1][:50] + '...' if len(first_row[1]) > 50 else first_row[1]
                    print(f"  {length}-letter: {first_row[0]} -> {definition}")
        except (FileNotFoundError, StopIteration):
            print(f"  {length}-letter: No file or no data")
        except Exception as e:
            print(f"  {length}-letter: Error reading file: {e}")

if __name__ == "__main__":
    main()
    show_samples_by_length()