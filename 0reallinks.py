import os
import re
from typing import List

def convert_onclick_to_href(file_path: str) -> bool:
    """
    Convert onclick attributes with loadChapter to href attributes in HTML files.
    
    Args:
        file_path (str): Path to the HTML file to be modified.
    
    Returns:
        bool: True if file was modified, False otherwise
    """
    try:
        # Read the file
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Regex patterns to find different variations of onclick with loadChapter
        patterns = [
            # Pattern 1: Simple loadChapter with no return false
            r'<a\s+onclick="loadChapter\(\'([^\']+)\'\);\s*"([^>]*)>',
            
            # Pattern 2: loadChapter with return false
            r'<a\s+onclick="loadChapter\(\'([^\']+)\'\);\s*return\s+false;\s*"([^>]*)>'
        ]
        
        # Track if any modifications were made
        file_modified = False
        
        # Replace function
        def replace_link(match):
            nonlocal file_modified
            file_modified = True
            
            chapter_param = match.group(1)
            extra_attrs = match.group(2)
            
            # Construct new href
            href = f'index.html?chapter={chapter_param}'
            
            # Return transformed link
            return f'<a href=\'{href}\'{extra_attrs}>'
        
        # Apply each pattern
        new_content = content
        for pattern in patterns:
            new_content = re.sub(pattern, replace_link, new_content)
        
        # Write back to file if modified
        if file_modified:
            with open(file_path, 'w', encoding='utf-8') as file:
                file.write(new_content)
            return True
        
        return False
    
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def process_html_files(directory: str) -> List[str]:
    """
    Process all HTML files in the given directory.
    
    Args:
        directory (str): Path to the directory containing HTML files.
    
    Returns:
        List[str]: List of files that were modified
    """
    modified_files = []
    
    # Iterate through all files in the directory
    for filename in os.listdir(directory):
        if filename.endswith('.html'):
            file_path = os.path.join(directory, filename)
            
            # Try to convert the file
            if convert_onclick_to_href(file_path):
                modified_files.append(filename)
    
    return modified_files

def main():
    # Get the current directory of the script
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Process HTML files
    modified = process_html_files(current_dir)
    
    # Print results
    if modified:
        print("The following files were modified:")
        for file in modified:
            print(f"- {file}")
    else:
        print("No files were modified.")

if __name__ == "__main__":
    main()