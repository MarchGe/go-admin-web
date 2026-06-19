import {basicSetup} from "codemirror"
import {EditorView} from "@codemirror/view"
import {EditorState} from "@codemirror/state"
import {StreamLanguage} from "@codemirror/language"
import {shell} from "@codemirror/legacy-modes/mode/shell"

/**
 * bash/shell 语言支持
 */
export const shellLanguage = StreamLanguage.define(shell)

/**
 * 可编辑模式主题（用于新增/编辑弹框）
 * 白色背景，聚焦时边框变蓝，与 Element Plus 风格一致
 */
export const editTheme = EditorView.theme({
  "&": {
    height: "280px",
    fontSize: "13px",
    fontFamily: "'Courier New', Courier, monospace",
    border: "1px solid #dcdfe6",
    borderRadius: "4px",
    backgroundColor: "#ffffff"
  },
  ".cm-scroller": {overflow: "auto"},
  ".cm-content": {caretColor: "#333"},
  "&.cm-focused": {outline: "none", borderColor: "#409eff"},
  "&.cm-focused .cm-cursor": {borderLeftColor: "#333"},
  ".cm-activeLine": {backgroundColor: "#f0f4ff"},
  ".cm-gutters": {
    backgroundColor: "#f8f8f8",
    color: "#999",
    border: "none",
    borderRight: "1px solid #e4e7ed"
  },
  ".cm-activeLineGutter": {backgroundColor: "#e8eef8"}
}, {dark: false})

/**
 * 只读模式主题（用于列表展开行预览）
 * 浅灰背景，无光标，最大高度 300px 可滚动
 */
export const readonlyTheme = EditorView.theme({
  "&": {
    fontSize: "13px",
    fontFamily: "'Courier New', Courier, monospace",
    border: "1px solid #dcdfe6",
    borderRadius: "4px",
    backgroundColor: "#fafafa"
  },
  ".cm-scroller": {overflow: "auto", maxHeight: "300px"},
  ".cm-content": {caretColor: "transparent"},
  ".cm-gutters": {
    backgroundColor: "#f5f5f5",
    color: "#aaa",
    border: "none",
    borderRight: "1px solid #e4e7ed"
  },
  ".cm-cursor": {display: "none"}
}, {dark: false})

/**
 * 构建可编辑编辑器的 extensions
 * @param {Function} onChange - 内容变化回调，参数为最新文本
 * @param {import('@codemirror/view').Placeholder} [placeholderExt] - 可选的 placeholder 扩展
 */
export function buildEditExtensions(onChange, placeholderExt) {
  const exts = [
    basicSetup,
    shellLanguage,
    editTheme,
    EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        onChange(update.state.doc.toString())
      }
    })
  ]
  if (placeholderExt) exts.push(placeholderExt)
  return exts
}

/**
 * 构建只读编辑器的 extensions
 */
export function buildReadonlyExtensions() {
  return [
    basicSetup,
    shellLanguage,
    readonlyTheme,
    EditorState.readOnly.of(true),
    EditorView.editable.of(false)
  ]
}
