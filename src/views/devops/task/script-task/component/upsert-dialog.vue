<template>
  <el-dialog class="upsert" v-model="visible" :title="isEdit ? '修改任务' : '添加任务'" width="35%">
    <div class="row">
      <span class="label _required">名称</span>
      <el-input class="value" v-model="taskInfo.name" placeholder="填写名称" maxlength="50"></el-input>
    </div>
    <div class="row" v-if="taskInfo.scriptIds.length > 0" v-for="(item, index) in taskInfo.scriptIds" :key="index">
      <span class="label" :class="index === 0 ? '_required' : ''">{{index === 0 ? '脚本' : ''}}</span>
      <div class="value">
        <el-select v-model="taskInfo.scriptIds[index]" placeholder="选择脚本" :filterable="true">
          <el-option v-for="s in props.scriptList" :key="s.id" :label="s.name + '/' + s.version" :value="s.id"></el-option>
        </el-select>
        <i v-if="index !== 0" :class="'iconfont icon-shanchu'" @click="removeScriptItem(index)"></i>
      </div>
    </div>
    <div class="row">
      <span class="label"></span>
      <div class="value">
        <el-button type="primary" @click="addScript">+</el-button><span style="font-size: 12px;">（多个脚本依次执行）</span>
      </div>
    </div>
    <div class="row">
      <span class="label">任务类型</span>
      <div class="value">
        <el-radio-group v-model="taskInfo.kind">
          <el-radio :value="0">本地任务</el-radio>
          <el-radio :value="1">远程任务</el-radio>
        </el-radio-group>
      </div>
    </div>
    <div class="row" v-if="taskInfo.kind === 1">
      <span class="label _required">服务器组</span>
      <div class="value">
        <el-select v-model="taskInfo.hostGroupId" placeholder="选择服务器组" :filterable="true">
          <el-option v-for="g in props.hostGroupList" :key="g.id" :label="g.name" :value="g.id"></el-option>
        </el-select>
      </div>
    </div>
    <div class="row">
      <span class="label">Cron</span>
      <el-input class="value" v-model="taskInfo.cron" placeholder="填写Cron表达式（秒 分 时 日期 月份 星期）" title="秒 分 时 日期 月份 星期" maxlength="50"></el-input>
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
  kind: 0,
  scriptIds: [],
  hostGroupId: null,
  cron: ""
})

watch(() => props.modelValue, (val) => {
  if (val) {
    if (isEdit.value && props.data) {
      Object.assign(taskInfo, JSON.parse(JSON.stringify(props.data)))
    } else {
      Object.assign(taskInfo, {id: null, name: "", kind: 0, scriptIds: [null], hostGroupId: null, cron: ""})
    }
  }
})

function addScript() {
  taskInfo.scriptIds.push(null)
}

function removeScriptItem(index) {
  taskInfo.scriptIds.splice(index, 1)
}

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
    httpUtil.put(serverPaths.scriptTaskUpdate(taskInfo.id), taskInfo, callback, errorCallback)
  } else {
    httpUtil.post(serverPaths.scriptTaskAdd, taskInfo, callback, errorCallback)
  }
}
</script>
<style scoped src="../../../../../assets/css/dialog_common.css">
</style>
<style>
.upsert .row .value:not(.sort) {
  position: relative;
}
.upsert .row .icon-shanchu {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  margin-left: 5px;
  cursor: pointer;
  font-size: 14px;
  color: #a8a8a8;
}
</style>
