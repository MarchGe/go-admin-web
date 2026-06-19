<template>
  <el-dialog class="upsert" v-model="visible" :title="isEdit ? '修改应用' : '添加应用'" width="35%">
    <div class="row">
      <span class="label _required">名称</span>
      <el-input class="value" v-model="appInfo.name" placeholder="填写名称" maxlength="50"></el-input>
    </div>
    <div class="row">
      <span class="label _required">版本</span>
      <el-input class="value" v-model="appInfo.version" placeholder="填写版本" maxlength="50"></el-input>
    </div>
    <div class="row">
      <span class="label">端口</span>
      <el-input-number class="value sort" v-model="appInfo.port" :min="1" :max="65535"></el-input-number>
    </div>
    <div class="row">
      <span class="label _required">部署包</span>
      <el-upload ref="uploadRef" class="upload_v" :action="uploadUrl" name="file" method="post"
                 v-model:file-list="appPkgList" :data="formPostData" :auto-upload="false" :limit="1"
                 :on-exceed="handleExceed" :before-upload="beforeUpload"
                 :on-preview="isEdit ? handleDownload : undefined"
                 :on-remove="handleUploadRemove"
                 :on-success="handleUploadSuccess"
                 :on-error="handleUploadError">
        <el-button class="value upload_btn" :disabled="!hasPermission('app:upload')">选择</el-button>
      </el-upload>
    </div>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="isLoading" @click="doSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>
<script setup>
import {computed, reactive, ref, watch} from "vue"
import {hasPermission} from "@/utils/permissions"
import httpUtil from "@/utils/http-utils"
import uiUtils from "@/utils/ui-utils"
import {serverPaths, configSettings} from "@/settings"

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
const uploadRef = ref()
const fileUidRecord = ref(0)

const appInfo = reactive({
  id: null,
  name: "",
  version: "",
  port: 8080,
  key: "",
  fileName: ""
})

const uploadUrl = serverPaths.uploadPkg
const formPostData = reactive({oldPath: ""})
const appPkgList = ref([])

watch(() => props.modelValue, (val) => {
  if (val) {
    if (isEdit.value && props.data) {
      Object.assign(appInfo, JSON.parse(JSON.stringify(props.data)))
      appPkgList.value = [{uid: Date.now(), name: appInfo.fileName}]
      fileUidRecord.value = appPkgList.value[0].uid
    } else {
      Object.assign(appInfo, {id: null, name: "", version: "", port: 8080, key: "", fileName: ""})
      appPkgList.value = []
      fileUidRecord.value = 0
    }
  }
})

function doSubmit() {
  if (!appInfo.name || appInfo.name.trim() === "") {
    uiUtils.showToast("warning", "请填写名称")
    return
  }
  if (!appInfo.version || appInfo.version.trim() === "") {
    uiUtils.showToast("warning", "请填写版本")
    return
  }
  if (appPkgList.value.length === 0) {
    uiUtils.showToast("warning", "请选择部署包")
    return
  }
  isLoading.value = true
  if (fileUidRecord.value === appPkgList.value[0].uid) {
    doSave()
    return
  }
  uploadRef.value.submit()
  fileUidRecord.value = appPkgList.value[0].uid
}

function doSave() {
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
    httpUtil.put(serverPaths.appUpdate(appInfo.id), appInfo, callback, errorCallback)
  } else {
    httpUtil.post(serverPaths.appAdd, appInfo, callback, errorCallback)
  }
}

function handleUploadSuccess(res) {
  if (res.code === 200) {
    appInfo.key = res.value.tmpKey
    appInfo.fileName = res.value.fileName
    doSave()
  } else {
    isLoading.value = false
    uiUtils.showToast("error", res.message)
  }
}

function handleExceed(files) {
  uploadRef.value.clearFiles()
  uploadRef.value.handleStart(files[0])
}

function handleUploadRemove() {
  appInfo.fileName = ""
  appInfo.key = ""
}

function beforeUpload(file) {
  if (file.size > configSettings.uploadAppPkgSizeLimit * 1024 * 1024) {
    uiUtils.showToast("warning", "文件大小不能超过" + configSettings.uploadAppPkgSizeLimit + "M")
    isLoading.value = false
    return false
  }
  return true
}

function handleUploadError(err) {
  isLoading.value = false
  console.error(err)
  uiUtils.showToast("error", err.toString())
}

function handleDownload() {
  if (appPkgList.value[0].uid !== fileUidRecord.value) {
    return
  }
  const link = document.createElement("a")
  link.href = serverPaths.downloadPkg + "?key=" + appInfo.key + "&fileName=" + appInfo.fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>
<style scoped src="../../../../assets/css/dialog_common.css">
</style>
