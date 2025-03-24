import os
import re

def unformat_html(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Remove unnecessary newlines and spaces between tags
    content = re.sub(r">\s+<", "><", content)

    # Remove excessive spaces and newlines inside tags while preserving normal spaces
    content = re.sub(r"\s*\n\s*", " ", content)

    # Write back the cleaned content
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)

# Get the current directory where the script is running
current_directory = os.path.dirname(os.path.abspath(__file__))

# Process all HTML files in the same directory
for file_name in os.listdir(current_directory):
    if file_name.endswith(".html"):
        file_path = os.path.join(current_directory, file_name)
        unformat_html(file_path)
        print(f"Processed: {file_name}")
