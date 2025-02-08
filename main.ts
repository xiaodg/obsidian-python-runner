import { App, Editor, MarkdownView, Plugin, PluginSettingTab, Setting, Notice } from 'obsidian';
import { spawn } from 'child_process';
import * as path from 'path';

interface PythonRunnerSettings {
    pythonPath: string;
    triggerSymbol: string;
}

const DEFAULT_SETTINGS: PythonRunnerSettings = {
    pythonPath: 'python',
    triggerSymbol: '@py'
}

export default class PythonRunnerPlugin extends Plugin {
    settings: PythonRunnerSettings;

    async onload() {
        await this.loadSettings();

        // 监听键盘事件
        this.registerDomEvent(document, 'keydown', (evt: KeyboardEvent) => {
            // 检查是否按下回车键
            if (evt.key === 'Enter' || evt.keyCode === 13) {
                const view = this.app.workspace.getActiveViewOfType(MarkdownView);
                if (!view) return;

                const cursor = view.editor.getCursor();
                const currentLine = view.editor.getLine(cursor.line);
                const line = currentLine.trim() === '' ? view.editor.getLine(cursor.line - 1) : currentLine;

                if (line.trim().startsWith(this.settings.triggerSymbol)) {
                    evt.preventDefault();
                    setTimeout(() => {
                        this.handlePythonCode(line, cursor.line - 1, view);
                    }, 10);
                }
            }
        });

        // 添加设置选项卡
        this.addSettingTab(new PythonRunnerSettingTab(this.app, this));
    }

    async handlePythonCode(line: string, lineNumber: number, view: MarkdownView) {
        try {
            const result = await this.executePythonCode(line, view);
            if (!result) return;
            view.editor.replaceRange(
                `\n${result}\n`,
                { line: lineNumber, ch: line.length },
                { line: lineNumber, ch: line.length }
            );
        } catch (error) {
            new Notice(`Error: ${error.message}`);
        }
    }

    async executePythonCode(code: string, view: MarkdownView): Promise<string> {
        return new Promise((resolve, reject) => {
            try {
                const vaultPath = (this.app.vault.adapter as any).basePath;
                const pluginDir = path.join(vaultPath, '.obsidian', 'plugins', 'obsidian-python-runner');
                const scriptsDir = path.join(pluginDir, 'pyscripts');

                // 获取当前文档信息
                if (!view || !view.file) {
                    throw new Error('No active document view');
                }

                const file = view.file;
                const editor = view.editor;
                const fileCache = this.app.metadataCache.getFileCache(file);
                
                // 准备文档信息
                const docInfo = {
                    title: file.basename,
                    path: file.path,
                    created: file.stat.ctime,
                    modified: file.stat.mtime,
                    content: editor.getValue(),
                    frontmatter: fileCache?.frontmatter || {},
                    cursor: {
                        line: editor.getCursor().line,
                        ch: editor.getCursor().ch
                    },
                    selection: editor.getSelection()
                };

                // 转义特殊字符
                const jsonStr = JSON.stringify(docInfo)
                    .replace(/\\/g, '\\\\')
                    .replace(/'/g, "\\'")
                    .replace(/\n/g, '\\n');
                
                const setupCode = `
# -*- coding: utf-8 -*-
import sys
import os
import glob
import json

# 设置默认编码为 UTF-8
import sys
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

# 添加脚本目录到 Python 路径
scripts_dir = r'${scriptsDir.replace(/\\/g, '\\\\')}'
sys.path.append(scripts_dir)

# 设置文档信息和修改接口
doc = json.loads('${jsonStr}')

def set_content(new_content):
    """替换整个文档内容"""
    print('__SET_CONTENT__' + new_content)
    return None

# 将set_content添加到builtins中，使其在所有模块中可用
import builtins
setattr(builtins, 'set_content', set_content)
setattr(builtins, 'doc', doc)

# 导入所有 .py 文件中的非下划线开头函数
for file in glob.glob(os.path.join(scripts_dir, "*.py")):
    module_name = os.path.splitext(os.path.basename(file))[0]
    try:
        # 导入模块
        module = __import__(module_name)
        # 获取所有非下划线开头的函数
        funcs = [name for name, obj in module.__dict__.items() 
                if callable(obj) and not name.startswith('_')]
        # 只导入非下划线开头的函数
        for func in funcs:
            exec(f"from {module_name} import {func}")
    except Exception as e:
        print(f"Error importing {module_name}: {str(e)}")

# 执行用户代码
try:
    code = """${code.replace(this.settings.triggerSymbol, '').trim()}"""
    if '(' in code and ')' in code:
        # 提取函数名和参数
        func_name = code.split('(')[0].strip()
        args_str = code[len(func_name)+1:-1].strip()
        
        # 执行函数调用
        if args_str:
            result = eval(f"{func_name}({args_str})")
        else:
            result = eval(f"{func_name}()")
    else:
        result = eval(code)
    
    if result is not None:
        print(result)
except Exception as e:
    print(f"Error: {str(e)}")
`;
                
                const pythonProcess = spawn(this.settings.pythonPath, ['-c', setupCode], {
                    cwd: scriptsDir
                });
                
                let output = '';
                let error = '';

                pythonProcess.stdout.on('data', (data) => {
                    output += data.toString();
                });

                pythonProcess.stderr.on('data', (data) => {
                    error += data.toString();
                });

                pythonProcess.on('close', (code) => {
                    if (code === 0) {
                        const set_content_prefix = '__SET_CONTENT__';
                        if (output.startsWith(set_content_prefix)) {
                            // 替换文档内容
                            const newContent = output.substring(set_content_prefix.length);
                            view.editor.setValue(newContent);
                            resolve('');  // 不显示输出
                        } else {
                            resolve(output.trim());
                        }
                    } else {
                        reject(new Error(error || 'Unknown error'));
                    }
                });
            } catch (e) {
                reject(e);
            }
        });
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}

class PythonRunnerSettingTab extends PluginSettingTab {
    plugin: PythonRunnerPlugin;

    constructor(app: App, plugin: PythonRunnerPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        new Setting(containerEl)
            .setName('Python Path')
            .setDesc('Path to Python executable')
            .addText(text => text
                .setPlaceholder('python')
                .setValue(this.plugin.settings.pythonPath)
                .onChange(async (value) => {
                    this.plugin.settings.pythonPath = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Trigger Symbol')
            .setDesc('Symbol to trigger Python code execution')
            .addText(text => text
                .setPlaceholder('@py')
                .setValue(this.plugin.settings.triggerSymbol)
                .onChange(async (value) => {
                    this.plugin.settings.triggerSymbol = value;
                    await this.plugin.saveSettings();
                }));
    }
}
