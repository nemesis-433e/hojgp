import os
from bs4 import BeautifulSoup, NavigableString

def process_file(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f, 'html.parser')
    
    for div in soup.find_all('div', class_='explanation type'):
        content = div.decode_contents()
        
        # Skip if already processed
        if 'original' in content:
            continue
            
        # Find the ／ character
        split_index = content.find('／')
        if split_index == -1:
            continue
            
        # Clear existing content
        div.clear()
        
        # Add type span if exists
        type_span = None
        if '<span class="type">' in content:
            type_start = content.find('<span class="type">')
            type_end = content.find('</span>') + 7
            type_span = BeautifulSoup(content[type_start:type_end], 'html.parser').span
            content = content[type_end:]
            split_index = content.find('／')

        # Create original and translation spans
        original_span = soup.new_tag('span', **{'class': 'original'})
        translation_span = soup.new_tag('span', **{'class': 'translation'})
        
        # Split and clean content
        original_text = content[:split_index].strip()
        translation_text = content[split_index+1:].strip()

        # Add text to spans
        original_span.append(BeautifulSoup(original_text, 'html.parser'))
        translation_span.append(BeautifulSoup(translation_text, 'html.parser'))

        # Rebuild the structure
        if type_span:
            div.append(type_span)
        div.append(original_span)
        div.append(translation_span)

    # Save modified file
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(str(soup))

# Process all HTML files
for file in os.listdir():
    if file.endswith('.html'):
        process_file(file)