<template>
  <el-dialog class="upsert" v-model="visible" :title="isEdit ? '修改服务器' : '添加服务器'" width="35%">
    <div class="row">
      <span class="label _required">名称</span>
      <el-input class="value" v-model="hostInfo.name" placeholder="填写名称" maxlength="30"></el-input>
    </div>
    <div class="row">
      <span class="label _required">IP地址</span>
      <el-input class="value" v-model="hostInfo.ip" placeholder="填写IP地址" maxlength="30"></el-input>
    </div>
    <div class="row">
      <span class="label _required">端口</span>
      <el-input-number class="value sort" v-model="hostInfo.port" :min="1" :max="65535"></el-input-number>
      <el-button class="conn-test" type="primary" :loading="isConnectLoading" :disabled="!hasPermission('host:connectTest')" @click="connectTest">连接测试</el-button>
    </div>
    <div class="row">
      <span class="label _required">账号</span>
      <el-input class="value" v-model="hostInfo.user" placeholder="填写账号" maxlength="30"></el-input>
    </div>
    <div class="row">
      <span class="label _required">密码</span>
      <el-input class="value" type="password" v-model="hostInfo.password" placeholder="填写密码" maxlength="50"></el-input>
    </div>
    <div class="row">
      <span class="label">排序</span>
      <el-input-number class="value sort" v-model="hostInfo.sortNum" :min="0"></el-input-number>
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
  }
})

const emit = defineEmits(["update:modelValue", "success"])

const isEdit = computed(() => props.mode === "update")
const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val)
})

const isLoading = ref(false)
const isConnectLoading = ref(false)
const passwordRecord = ref("")

const hostInfo = reactive({
  id: null,
  name: "",
  ip: "",
  port: 22,
  user: "",
  password: "",
  sortNum: 0
})

watch(() => props.modelValue, (val) => {
  if (val) {
    if (isEdit.value && props.data) {
      const data = JSON.parse(JSON.stringify(props.data))
      Object.assign(hostInfo, data)
      passwordRecord.value = data.password
    } else {
      Object.assign(hostInfo, {id: null, name: "", ip: "", port: 22, user: "", password: "", sortNum: 0})
      passwordRecord.value = ""
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
    const params = JSON.parse(JSON.stringify(hostInfo))
    if (params.password !== passwordRecord.value) {
      params.passwordChanged = true
    }
    httpUtil.put(serverPaths.hostUpdate(params.id), params, callback, errorCallback)
  } else {
    httpUtil.post(serverPaths.hostAdd, hostInfo, callback, errorCallback)
  }
}

function connectTest() {
  isConnectLoading.value = true
  let params = {
    ip: hostInfo.ip,
    port: hostInfo.port,
    user: hostInfo.user,
    password: hostInfo.password,
    mode: isEdit.value ? 1 : 0,
    passwordChanged: false
  }
  if (isEdit.value && hostInfo.password !== passwordRecord.value) {
    params.passwordChanged = true
  }
  httpUtil.get(serverPaths.hostConnectTest, params, function (data) {
    isConnectLoading.value = false
    if (data.result) {
      uiUtils.showToast("success", "连接成功")
    } else {
      uiUtils.showToast("warning", "连接失败")
    }
  }, () => {
    isConnectLoading.value = false
  })
}
</script>
<style scoped src="../../../../assets/css/dialog_common.css">
</style>
