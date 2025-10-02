#!/usr/bin/env python3
"""
Enhanced script to create comprehensive CSV files with words and definitions using multiple NLTK sources.
Includes stopwords with custom definitions for common function words.
"""

import csv
import nltk
from nltk.corpus import wordnet as wn
from nltk.corpus import words
from nltk.corpus import stopwords
import random

def download_required_data():
    """Download required NLTK data."""
    corpora_to_download = [
        ('wordnet', 'WordNet'),
        ('words', 'Words corpus'), 
        ('stopwords', 'Stopwords'),
        ('brown', 'Brown corpus')
    ]
    
    for corpus_name, display_name in corpora_to_download:
        try:
            nltk.data.find(f'corpora/{corpus_name}')
            print(f"{display_name} already downloaded")
        except LookupError:
            print(f"Downloading {display_name}...")
            nltk.download(corpus_name)

def get_word_definition(word):
    """
    Get the best definition for a word using WordNet.
    Returns None if no definition is found - caller can decide to keep blank or skip.
    """
    # Try WordNet
    synsets = wn.synsets(word)
    if synsets:
        return synsets[0].definition()
    
    # Return None if no definition found
    return None

def clean_word(word):
    """Clean and validate a word."""
    word = word.lower().strip()
    # Only keep words with alphabetic characters
    if word.isalpha() and len(word) >= 3:
        return word
    return None

def get_comprehensive_word_list(target_length=None, include_stopwords=True):
    """
    Get a comprehensive list of words from multiple sources.
    
    Args:
        target_length (int, optional): Filter by specific word length
        include_stopwords (bool): Whether to include common stopwords
    
    Returns:
        list: List of unique words
    """
    all_words = set()
    
    # Get words from NLTK words corpus
    try:
        english_words = set(words.words())
        all_words.update([word.lower() for word in english_words if word.isalpha()])
        print(f"Added {len(english_words)} words from NLTK words corpus")
    except Exception as e:
        print(f"Error accessing words corpus: {e}")
    
    # Add stopwords if requested
    if include_stopwords:
        try:
            english_stopwords = set(stopwords.words('english'))
            # Filter stopwords by length if specified
            if target_length:
                stopwords_filtered = [word for word in english_stopwords if len(word) == target_length]
            else:
                stopwords_filtered = list(english_stopwords)
            all_words.update(stopwords_filtered)
            print(f"Added {len(stopwords_filtered)} stopwords")
        except Exception as e:
            print(f"Error accessing stopwords: {e}")
    
    # Note: Custom definitions removed - using only NLTK sources
    
    # Filter by target length if specified
    if target_length:
        all_words = {word for word in all_words if len(word) == target_length}
    
    return list(all_words)

def create_enhanced_words_by_length_csv(target_length, max_words_per_length=500):
    """
    Create a CSV for words of a specific length using enhanced word sources.
    
    Args:
        target_length (int): The target word length (3-8)
        max_words_per_length (int): Maximum number of words to include for this length
    
    Returns:
        int: Number of word-definition pairs created
    """
    filename = f"{target_length}_letter_words_enhanced.csv"
    print(f"Creating enhanced {filename} for {target_length}-letter words...")
    
    # Get comprehensive word list
    word_list = get_comprehensive_word_list(target_length=target_length)
    
    # Shuffle to get random selection
    random.shuffle(word_list)
    
    word_definitions = []
    processed = 0
    
    # Get stopwords for comparison
    try:
        english_stopwords = set(stopwords.words('english'))
    except Exception:
        english_stopwords = set()
    
    for word in word_list:
        if len(word_definitions) >= max_words_per_length:
            break
            
        cleaned_word = clean_word(word)
        if cleaned_word and len(cleaned_word) == target_length:
            definition = get_word_definition(cleaned_word)
            
            # Always keep stopwords (even with blank definitions)
            # For other words, only keep if they have a definition
            if cleaned_word in english_stopwords:
                word_definitions.append((cleaned_word, definition or ""))
                processed += 1
            elif definition:  # Non-stopwords need a definition
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


def main():
    """Main function to create enhanced word definition CSV files."""
    print("Enhanced Word Definition CSV Generator using NLTK")
    print("=" * 60)
    
    # Download required NLTK data
    download_required_data()
    
    print("\nGenerating enhanced CSV files...")
        
    # Create enhanced length-specific files
    print("\nCreating enhanced length-specific files...")
    length_results = {}
    for length in range(3, 9):
        count = create_enhanced_words_by_length_csv(length, max_words_per_length=300)
        length_results[length] = count
    
    print("\nGeneration complete!")
    print("- Enhanced individual length files:")
    for length, count in length_results.items():
        print(f"  {length}-letter words: {count} entries in '{length}_letter_words_enhanced.csv'")
    
    # Show examples with common words
    print("\nSample entries from common_words_with_definitions.csv:")
    try:
        with open("common_words_with_definitions.csv", 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            next(reader)  # Skip header
            for i, row in enumerate(reader):
                if i < 10:  # Show first 10 entries
                    print(f"  {row[0]} ({len(row[0])} letters): {row[1][:60]}{'...' if len(row[1]) > 60 else ''}")
                else:
                    break
    except Exception as e:
        print(f"Error reading sample: {e}")

if __name__ == "__main__":
    main()