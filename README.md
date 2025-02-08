# Obsidian Python Runner Plugin

一个强大的 Obsidian 插件，允许你在笔记中直接运行 Python 代码，实现文档分析、数据处理和图表生成等功能。

**本人完全不懂TypeScript，插件部分源码全部由Windsurf生成，如果有更好的写法，请自行修改。**

**如果有什么有趣的应用，欢迎分享**

## 功能特点

- 🚀 在笔记中直接执行 Python 代码
- 📊 生成词云图和词频统计图
- 📝 分析文档结构和内容
- 🔍 智能文本处理
- 🎨 自动生成并插入图片
- ⚡ 快速访问文档元数据

## 功能
该插件允许用户在Obsidian编辑器中直接运行Python脚本。用户可以访问各种功能，例如显示文档信息、替换文本以及生成可视化图表，如词云和频率统计图。

## 示例
### 来自 `example.py` 的示例
- **函数**: `docinfos(doc)`  
  显示当前文档的详细信息，包括可用字段、标题、文件路径、创建时间、修改时间、内容长度和光标位置。
- **函数**: `replace_text(doc, old_text, new_text)`  
  替换文档内容中的指定文本。

### 来自 `deepseek.py` 的示例
- **函数**: `deepseek_r1(query)`  
  利用OpenAI API处理查询，并根据提供的上下文生成响应。


## 安装要求

1. Obsidian 最新版本
2. Python 3.6 或更高版本
3. 必需的 Python 包：
   运行插件本身不需要安装任何模块，但是如果你想使用示例词云图和词频统计图功能，你需要安装以下包：
   - matplotlib==3.7.1
   - wordcloud==1.9.2
   - jieba==0.42.1
   如果要运行Deepseek API，你需要安装以下包：
   - openai==1.5.7

## 使用方法

### 基本语法

在笔记中使用 `@py` 触发符号后跟随 Python 函数调用：


按下回车键执行代码，结果将自动插入到笔记中。

### 内置函数
    内置了set_content函数，可以用于重写当前文档内容。
    使用方法可查看example.py中的replace_text和add_title函数。

#### 文档信息

```python
# 显示当前文档的详细信息
@py docinfos(doc)
```
#### 图表生成

```python
# 生成词云图，注意img_path选项设置，我的图片文件是放在笔记所在目录的attachments文件夹下
# 如有不同，请更改example.py中的相关代码
@py generate_word_cloud(doc)

```

### 文档对象

每个 Python 函数都可以访问 `doc` 对象，它包含以下信息：

```python
doc = {
    'title': '文档标题',
    'path': '文件路径',
    'created': '创建时间戳',
    'modified': '修改时间戳',
    'content': '完整文档内容',
    'frontmatter': '前置元数据',
    'cursor': {
        'line': '当前行号',
        'ch': '当前列号'
    },
    'selection': '选中的文本'
}
```

## 扩展功能

### 添加自定义函数

1. 在 `pyscripts` 目录中创建新的 Python 文件
2. 定义接受 `doc` 参数的函数
3. 使用 `@py` 调用新函数
4. py文件中以_开头的函数不会被载入，无法从外部调用。

例如：

```python
# pyscripts/custom.py
def analyze_sentiment(doc):
    """分析文档情感倾向"""
    # 你的代码
    return result
```

然后在笔记中使用：
```markdown
@py analyze_sentiment(doc)
```



## 设置选项

在 Obsidian 设置中可以配置：

1. Python 路径：指定 Python 解释器的位置
2. 触发符号：默认为 `@py`，可以自定义

## 常见问题

1. **Python 路径错误**
   - 确保 Python 已正确安装
   - 在设置中指定正确的 Python 路径

2. **包导入错误**
   - 检查是否已安装所有必需的包
   - 运行 `pip install -r requirements.txt`

3. **图片生成失败**
   - 确保当前目录有写入权限
   - 检查 matplotlib 和 wordcloud 是否正确安装

## 贡献指南

欢迎提交 Pull Requests 和 Issues！

1. Fork 本仓库
2. 创建你的特性分支
3. 提交你的改动
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License

## 致谢

- Obsidian 团队
- Python 社区


