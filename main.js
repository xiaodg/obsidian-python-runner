/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
*/

var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => PythonRunnerPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");
var import_child_process = require("child_process");
var path = __toESM(require("path"));
var DEFAULT_SETTINGS = {
  pythonPath: "python",
  triggerSymbol: "@py"
};
var PythonRunnerPlugin = class extends import_obsidian.Plugin {
  onload() {
    return __async(this, null, function* () {
      yield this.loadSettings();
      this.registerDomEvent(document, "keydown", (evt) => {
        if (evt.key === "Enter" || evt.keyCode === 13) {
          const view = this.app.workspace.getActiveViewOfType(import_obsidian.MarkdownView);
          if (!view)
            return;
          const cursor = view.editor.getCursor();
          const currentLine = view.editor.getLine(cursor.line);
          const line = currentLine.trim() === "" ? view.editor.getLine(cursor.line - 1) : currentLine;
          if (line.trim().startsWith(this.settings.triggerSymbol)) {
            evt.preventDefault();
            setTimeout(() => {
              this.handlePythonCode(line, cursor.line - 1, view);
            }, 10);
          }
        }
      });
      this.addSettingTab(new PythonRunnerSettingTab(this.app, this));
    });
  }
  handlePythonCode(line, lineNumber, view) {
    return __async(this, null, function* () {
      try {
        const result = yield this.executePythonCode(line, view);
        if (!result)
          return;
        view.editor.replaceRange(
          `
${result}
`,
          { line: lineNumber, ch: line.length },
          { line: lineNumber, ch: line.length }
        );
      } catch (error) {
        new import_obsidian.Notice(`Error: ${error.message}`);
      }
    });
  }
  executePythonCode(code, view) {
    return __async(this, null, function* () {
      return new Promise((resolve, reject) => {
        try {
          const vaultPath = this.app.vault.adapter.basePath;
          const pluginDir = path.join(vaultPath, ".obsidian", "plugins", "obsidian-python-runner");
          const scriptsDir = path.join(pluginDir, "pyscripts");
          if (!view || !view.file) {
            throw new Error("No active document view");
          }
          const file = view.file;
          const editor = view.editor;
          const fileCache = this.app.metadataCache.getFileCache(file);
          const docInfo = {
            title: file.basename,
            path: file.path,
            created: file.stat.ctime,
            modified: file.stat.mtime,
            content: editor.getValue(),
            frontmatter: (fileCache == null ? void 0 : fileCache.frontmatter) || {},
            cursor: {
              line: editor.getCursor().line,
              ch: editor.getCursor().ch
            },
            selection: editor.getSelection()
          };
          const jsonStr = JSON.stringify(docInfo).replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/\n/g, "\\n");
          const setupCode = `
# -*- coding: utf-8 -*-
import sys
import os
import glob
import json

# \u8BBE\u7F6E\u9ED8\u8BA4\u7F16\u7801\u4E3A UTF-8
import sys
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

# \u6DFB\u52A0\u811A\u672C\u76EE\u5F55\u5230 Python \u8DEF\u5F84
scripts_dir = r'${scriptsDir.replace(/\\/g, "\\\\")}'
sys.path.append(scripts_dir)

# \u8BBE\u7F6E\u6587\u6863\u4FE1\u606F\u548C\u4FEE\u6539\u63A5\u53E3
doc = json.loads('${jsonStr}')

def set_content(new_content):
    """\u66FF\u6362\u6574\u4E2A\u6587\u6863\u5185\u5BB9"""
    print('__SET_CONTENT__' + new_content)
    return None

# \u5C06set_content\u6DFB\u52A0\u5230builtins\u4E2D\uFF0C\u4F7F\u5176\u5728\u6240\u6709\u6A21\u5757\u4E2D\u53EF\u7528
import builtins
setattr(builtins, 'set_content', set_content)
setattr(builtins, 'doc', doc)

# \u5BFC\u5165\u6240\u6709 .py \u6587\u4EF6\u4E2D\u7684\u975E\u4E0B\u5212\u7EBF\u5F00\u5934\u51FD\u6570
for file in glob.glob(os.path.join(scripts_dir, "*.py")):
    module_name = os.path.splitext(os.path.basename(file))[0]
    try:
        # \u5BFC\u5165\u6A21\u5757
        module = __import__(module_name)
        # \u83B7\u53D6\u6240\u6709\u975E\u4E0B\u5212\u7EBF\u5F00\u5934\u7684\u51FD\u6570
        funcs = [name for name, obj in module.__dict__.items() 
                if callable(obj) and not name.startswith('_')]
        # \u53EA\u5BFC\u5165\u975E\u4E0B\u5212\u7EBF\u5F00\u5934\u7684\u51FD\u6570
        for func in funcs:
            exec(f"from {module_name} import {func}")
    except Exception as e:
        print(f"Error importing {module_name}: {str(e)}")

# \u6267\u884C\u7528\u6237\u4EE3\u7801
try:
    code = """${code.replace(this.settings.triggerSymbol, "").trim()}"""
    if '(' in code and ')' in code:
        # \u63D0\u53D6\u51FD\u6570\u540D\u548C\u53C2\u6570
        func_name = code.split('(')[0].strip()
        args_str = code[len(func_name)+1:-1].strip()
        
        # \u6267\u884C\u51FD\u6570\u8C03\u7528
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
          const pythonProcess = (0, import_child_process.spawn)(this.settings.pythonPath, ["-c", setupCode], {
            cwd: scriptsDir
          });
          let output = "";
          let error = "";
          pythonProcess.stdout.on("data", (data) => {
            output += data.toString();
          });
          pythonProcess.stderr.on("data", (data) => {
            error += data.toString();
          });
          pythonProcess.on("close", (code2) => {
            if (code2 === 0) {
              const set_content_prefix = "__SET_CONTENT__";
              if (output.startsWith(set_content_prefix)) {
                const newContent = output.substring(set_content_prefix.length);
                view.editor.setValue(newContent);
                resolve("");
              } else {
                resolve(output.trim());
              }
            } else {
              reject(new Error(error || "Unknown error"));
            }
          });
        } catch (e) {
          reject(e);
        }
      });
    });
  }
  loadSettings() {
    return __async(this, null, function* () {
      this.settings = Object.assign({}, DEFAULT_SETTINGS, yield this.loadData());
    });
  }
  saveSettings() {
    return __async(this, null, function* () {
      yield this.saveData(this.settings);
    });
  }
};
var PythonRunnerSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    new import_obsidian.Setting(containerEl).setName("Python Path").setDesc("Path to Python executable").addText((text) => text.setPlaceholder("python").setValue(this.plugin.settings.pythonPath).onChange((value) => __async(this, null, function* () {
      this.plugin.settings.pythonPath = value;
      yield this.plugin.saveSettings();
    })));
    new import_obsidian.Setting(containerEl).setName("Trigger Symbol").setDesc("Symbol to trigger Python code execution").addText((text) => text.setPlaceholder("@py").setValue(this.plugin.settings.triggerSymbol).onChange((value) => __async(this, null, function* () {
      this.plugin.settings.triggerSymbol = value;
      yield this.plugin.saveSettings();
    })));
  }
};
