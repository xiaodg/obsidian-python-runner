def docinfos(doc):
    from datetime import datetime
    """显示当前文档的详细信息"""
    info = {
        "可用字段": list(doc.keys()),
        "文档标题": doc['title'],
        "文件路径": doc['path'],
        "创建时间": datetime.fromtimestamp(doc['created']/1000),
        "修改时间": datetime.fromtimestamp(doc['modified']/1000),
        "内容长度": len(doc['content']),
        "光标位置": doc['cursor'],
    }
    return info

def replace_text(doc,old_text, new_text):
    """替换文档中的指定文本"""
    content = doc['content']
    new_content = content.replace(old_text, new_text)
    set_content(new_content)
    return None

def add_title(doc):
    """在文档开头添加标题"""
    content = doc['content']
    title = f"# {doc['title']}\n\n"
    new_content = title + content
    set_content(new_content)
    return None

def generate_word_cloud(doc):
    """生成文档内容的词云图,注意img_path选项设置，我的图片文件是放在笔记所在目录的attachments文件夹下"""
    import matplotlib.pyplot as plt
    from wordcloud import WordCloud
    import os
    from pathlib import Path
    
    script_path = str(Path(__file__))   #python脚本路径
    notebook_dir = script_path.split('.obsidian')[0]    #Vault目录路径
    # 使用文档所在目录
    doc_dir = os.path.dirname(doc['path'])  #文档目录，相对路径
    attachments_dir = os.path.join(notebook_dir,doc_dir, 'attachments') #附件目录
    if not os.path.exists(attachments_dir):
        os.makedirs(attachments_dir)
    img_name = 'wordcloud.png'
    img_path = os.path.join(attachments_dir, img_name)
    
    # 生成词云图
    wordcloud = WordCloud(width=800, height=400, background_color='white', font_path='msyh.ttc').generate(doc['content'])
    
    # 保存图片
    plt.figure(figsize=(10, 5))
    plt.imshow(wordcloud, interpolation='bilinear')
    plt.axis('off')
    plt.savefig(img_path, bbox_inches='tight', pad_inches=0)
    plt.close()
    
    # 返回 Markdown 图片链接，使用绝对文件名
    return f"![词云图]({img_path})"