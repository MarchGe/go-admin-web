<template>
  <el-dialog class="upsert" v-model="visible" :title="isEdit ? '修改任务' : '添加任务'" width="35%">
    <div class="row">
      <span class="label _required">名称</span>
      <el-input class="value" v-model="taskInfo.name" placeholder="填写名称" maxlength="50"></el-input>
    </div>
    <div class="row">
      <span class="label _required">上传路径</span>
      <el-input class="value" v-model="taskInfo.concrete.uploadPath" placeholder="填写上传路径（部署包会上传到该目录）" maxlength="100"></el-input>
    </div>
    <div class="row">
      <span class="label _required">应用</span>
      <div class="value">
        <el-select v-model="taskInfo.concrete.appId" placeholder="选择应用" :filterable="true">
          <el-option v-for="item in props.appList" :key="item.id" :label="item.name + '/' + item.version" :value="item.id"></el-option>
        </el-select>
      </div>
    </div>
    <div class="row">
      <span class="label _required">部署脚本</span>
      <div class="value">
        <el-select v-model="taskInfo.concrete.scriptId" placeholder="选择部署脚本" :filterable="true">
          <el-option v-for="item in props.scriptList" :key="item.id" :label="item.name + '/' + item.version" :value="item.id"></el-option>
        </el-select>
      </div>
    </div>
    <div class="row">
      <span class="label _required">服务器组</span>
      <div class="value">
        <el-select v-model="taskInfo.concrete.hostGroupId" placeholder="选择服务器组" :filterable="true">
          <el-option v-for="item in props.hostGroupList" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </div>
    </div>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="isLoading" @click="doSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>
<script setup>
import {computed, reactive, ref, watch} from "vue"
import httpUtil from "@/utils/http-utils"
import uiUtils from "@/utils/ui-utils"
import {serverPaths} from "@/settings"

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
  },
  appList: {
    type: Array,
    default: () => []
  },
  scriptList: {
    type: Array,
    default: () => []
  },
  hostGroupList: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(["update:modelValue", "success"])

const isEdit = computed(() => props.mode === "update")
const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val)
})

const isLoading = ref(false)
const taskInfo = reactive({
  id: null,
  name: "",
  type: 1,
  concrete: {
    uploadPath: "",
    appId: null,
    scriptId: null,
    hostGroupId: null
  }
})

watch(() => props.modelValue, (val) => {
  if (val) {
    if (isEdit.value && props.data) {
      Object.assign(taskInfo, JSON.parse(JSON.stringify(props.data)))
    } else {
      Object.assign(taskInfo, {
        id: null,
        name: "",
        type: 1,
        concrete: {
          uploadPath: "",
          appId: null,
          scriptId: null,
          hostGroupId: null
        }
      })
    }
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
    httpUtil.put(serverPaths.taskUpdate(taskInfo.id), taskInfo, callback, errorCallback)
  } else {
    httpUtil.post(serverPaths.taskAdd, taskInfo, callback, errorCallback)
  }
}
</script>
<style scoped src="../../../../../assets/css/dialog_common.css">
</style>
