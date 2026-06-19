<template>
  <el-dialog class="upsert" v-model="visible" :title="isEdit ? '修改脚本' : '添加脚本'" width="50%">
    <div class="row">
      <span class="label _required">名称</span>
      <el-input class="value" v-model="scriptInfo.name" placeholder="填写名称" maxlength="50"></el-input>
    </div>
    <div class="row">
      <span class="label _required">版本</span>
      <el-input class="value" v-model="scriptInfo.version" placeholder="填写版本" maxlength="50"></el-input>
    </div>
    <div class="row code-row">
      <span class="label _required">脚本内容</span>
      <div class="value code-editor" ref="editorRef"></div>
    </div>
    <div class="row">
      <span class="label">使用说明</span>
      <el-input class="value" type="textarea" v-model="scriptInfo.description" :rows="3" placeholder="填写使用说明" maxlength="2000"></el-input>
    </div>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="isLoading" @click="doSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>
<script setup>
import {computed, nextTick, onBeforeUnmount, reactive, ref, watch} from "vue"
import httpUtil from "@/utils/http-utils"
import uiUtils from "@/utils/ui-utils"
import {serverPaths} from "@/settings"
import {EditorView, placeholder as cmPlaceholder} from "@codemirror/view"
import {EditorState} from "@codemirror/state"
import {buildEditExtensions} from "@/utils/codemirror-utils"

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  mode: {
    type: String,
    default: "add"
  },
  data: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(["update:modelValue", "success"])

const isEdit = computed(() => props.mode === "update")
const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val)
})

const isLoading = ref(false)
const editorRef = ref(null)
let editorView = null

function createEditor(content) {
  if (editorView) {
    editorView.destroy()
    editorView = null
  }
  if (!editorRef.value) return
  editorView = new EditorView({
    state: EditorState.create({
      doc: content || "",
      extensions: buildEditExtensions(
        (val) => { scriptInfo.content = val },
        cmPlaceholder("填写脚本")
      )
    }),
    parent: editorRef.value
  })
}

const scriptInfo = reactive({
  id: null,
  name: "",
  version: "",
  content: "",
  description: ""
})

watch(() => props.modelValue, (val) => {
  if (val) {
    if (isEdit.value && props.data) {
      Object.assign(scriptInfo, JSON.parse(JSON.stringify(props.data)))
    } else {
      Object.assign(scriptInfo, {id: null, name: "", version: "", content: "", description: ""})
    }
    nextTick(() => {
      createEditor(scriptInfo.content)
    })
  }
})

onBeforeUnmount(() => {
  if (editorView) {
    editorView.destroy()
    editorView = null
  }
})

function doSubmit() {
  isLoading.value = true
  const callback = () => {
    isLoading.value = false
    visible.value = false
    uiUtils.showToast("success", isEdit.value ? "修改成功" : "添加成功")
    emit("success")
  }
  const errorCallback = () => {
    isLoading.value = false
  }
  if (isEdit.value) {
    httpUtil.put(serverPaths.scriptUpdate(scriptInfo.id), scriptInfo, callback, errorCallback)
  } else {
    httpUtil.post(serverPaths.scriptAdd, scriptInfo, callback, errorCallback)
  }
}
</script>
<style scoped src="../../../../assets/css/dialog_common.css">
</style>
<style scoped>
.upsert .row.code-row {
  align-items: flex-start;
}

.upsert .code-editor {
  flex: 1;
  margin-right: 20px;
}
</style>
