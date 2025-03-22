import os
import re
from bs4 import BeautifulSoup

def wrap_translation(text):
    # Wrap the text in a valid XML span element
    return f'<span class="translation">{text}</span>'

def wrap_original(text):
    # Wrap the text in a valid XML span element
    return f'<span class="original">{text}</span>'

def process_html_file(file_path, output_folder):
    count_translation = 0
    count_original = 0
    with open(file_path, "r", encoding="utf-8") as file:
        soup = BeautifulSoup(file, "html.parser")
    
    # Find all div elements that include "example" in their classes
    for div in soup.select('div[class*="example"]'):
        # Convert the div to a string to manipulate it as text
        div_str = str(div)
        
        # Find the position where the ／ is located
        slash_index = div_str.find('／')
        
        if slash_index != -1:
            # Split the content into original and translation parts
            original_content = div_str[:slash_index]
            translation_content = div_str[slash_index + 1:]
            
            # Wrap the original content
            # Find the end of the opening <div> tag
            div_tag_end = original_content.find('>') + 1
            original_wrapped = (
                original_content[:div_tag_end] +  # Keep the <div> tag
                wrap_original(original_content[div_tag_end:])  # Wrap the rest
            )
            count_original += 1
            
            # Wrap the translation content
            # Find the closing </div> tag
            div_close_index = translation_content.rfind('</div>')
            if div_close_index != -1:
                # Wrap everything before the closing </div> in <span class="translation">
                translation_wrapped = wrap_translation(translation_content[:div_close_index])
                translation_content = translation_wrapped + translation_content[div_close_index:]
                count_translation += 1
            
            # Combine the wrapped original and translation content
            updated_div_str = f'{original_wrapped}／{translation_content}'
            
            # Replace the div content with the updated text
            div.replace_with(BeautifulSoup(updated_div_str, "html.parser"))
    
    # Save the modified content to the output folder
    output_path = os.path.join(output_folder, os.path.basename(file_path))
    with open(output_path, "w", encoding="utf-8") as file:
        file.write(str(soup))
    
    return count_translation, count_original

def process_all_html():
    # Create the output folder if it doesn't exist
    output_folder = "output"
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
    
    total_translation = 0
    total_original = 0
    for filename in os.listdir():
        if filename.endswith(".xhtml"):  # Check for .xhtml files
            file_path = os.path.join(".", filename)
            count_translation, count_original = process_html_file(file_path, output_folder)
            total_translation += count_translation
            total_original += count_original
            print(f"{filename}: {count_translation} translation occurrences, {count_original} original occurrences wrapped.")
    print(f"Total translation occurrences wrapped: {total_translation}")
    print(f"Total original occurrences wrapped: {total_original}")

if __name__ == "__main__":
    process_all_html()