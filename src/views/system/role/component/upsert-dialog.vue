<template>
  <el-dialog class="upsert" v-model="visible" :title="isEdit ? '修改角色' : '添加角色'" width="35%">
    <div class="row">
      <span class="label _required">角色名称</span>
      <el-input class="value" v-model="roleInfo.name" placeholder="填写角色名称" maxlength="20"></el-input>
    </div>
    <div class="row">
      <span class="label">排序</span>
      <el-input-number v-model="roleInfo.sortNum" :min="0"></el-input-number>
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
  }
})

const emit = defineEmits(["update:modelValue", "success"])

const isEdit = computed(() => props.mode === "update")
const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val)
})

const isLoading = ref(false)
const defaultRoleInfo = {
  id: null,
  name: "",
  sortNum: 0
}
const roleInfo = reactive({...defaultRoleInfo})

watch(() => props.modelValue, (val) => {
  if (val) {
    if (isEdit.value && props.data) {
      Object.assign(roleInfo, JSON.parse(JSON.stringify(props.data)))
    } else {
      Object.assign(roleInfo, defaultRoleInfo)
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
    httpUtil.put(serverPaths.roleUpdate(roleInfo.id), roleInfo, callback, errorCallback)
  } else {
    httpUtil.post(serverPaths.roleAdd, roleInfo, callback, errorCallback)
  }
}
</script>
<style scoped src="../../../../assets/css/dialog_common.css">
</style>
