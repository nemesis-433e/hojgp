import os
import re

def count_loadchapter_occurrences(directory):
    # Get the directory of the current script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Iterate through all files in the script's directory
    for filename in os.listdir(script_dir):
        # Check if the file is an HTML file
        if filename.endswith('.html'):
            file_path = os.path.join(script_dir, filename)
            
            # Read the file contents
            with open(file_path, 'r', encoding='utf-8') as file:
                content = file.read()
            
            # Use regex to find all loadChapter() calls
            # This pattern matches loadChapter with any parameters inside parentheses
            matches = re.findall(r'loadChapter\([^)]*\)', content)
            
            # Print the filename and number of occurrences if any matches found
            if matches:
                print(f"{filename} = {len(matches)} occurrences")

# Run the function
count_loadchapter_occurrences(__file__)
