def docinfos(doc):
    from datetime import datetime
    """Display detailed information about the current document"""
    info = {
        "Available fields": list(doc.keys()),
        "Document title": doc['title'],
        "File path": doc['path'],
        "Creation time": datetime.fromtimestamp(doc['created']/1000),
        "Modification time": datetime.fromtimestamp(doc['modified']/1000),
        "Content length": len(doc['content']),
        "Cursor position": doc['cursor'],
    }
    return info

def replace_text(doc,old_text, new_text):
    """Replace specified text in the document"""
    content = doc['content']
    new_content = content.replace(old_text, new_text)
    set_content(new_content)
    return None

def add_title(doc):
    """Add a title at the beginning of the document"""
    content = doc['content']
    title = f"# {doc['title']}\n\n"
    new_content = title + content
    set_content(new_content)
    return None

def generate_word_cloud(doc):
    """Generate a word cloud of the document content. Note the img_path option setting; my image files are placed in the attachments folder under the note directory"""
    import matplotlib.pyplot as plt
    from wordcloud import WordCloud
    import os
    from pathlib import Path
    
    script_path = str(Path(__file__))   # Python script path
    notebook_dir = script_path.split('.obsidian')[0]    # Vault directory path
    # Use the document directory
    doc_dir = os.path.dirname(doc['path'])  # Document directory, relative path
    attachments_dir = os.path.join(notebook_dir,doc_dir, 'attachments') # Attachments directory
    if not os.path.exists(attachments_dir):
        os.makedirs(attachments_dir)
    img_name = 'wordcloud.png'
    img_path = os.path.join(attachments_dir, img_name)
    
    # Generate word cloud
    wordcloud = WordCloud(width=800, height=400, background_color='white', font_path='msyh.ttc').generate(doc['content'])
    
    # Save image
    plt.figure(figsize=(10, 5))
    plt.imshow(wordcloud, interpolation='bilinear')
    plt.axis('off')
    plt.savefig(img_path, bbox_inches='tight', pad_inches=0)
    plt.close()
    
    # Return Markdown image link, using absolute file name
    return f"![Word Cloud]({img_path})"