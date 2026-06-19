<template>
  <el-dialog class="upsert" v-model="visible" :title="isEdit ? '修改岗位' : '添加岗位'" width="30%">
    <div class="row">
      <span class="label _required">岗位名称</span>
      <el-input class="value" v-model="jobInfo.name" placeholder="填写岗位名称" maxlength="20"></el-input>
    </div>
    <div class="row">
      <span class="label">岗位描述</span>
      <el-input class="value" v-model="jobInfo.description" type="textarea" placeholder="填写岗位描述（可选）" maxlength="200" :rows="5" resize="none" show-word-limit></el-input>
    </div>
    <div class="row">
      <span class="label">排序</span>
      <el-input-number class="value sort" v-model="jobInfo.sortNum" :min="0"></el-input-number>
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

const defaultJobInfo = {
  id: null,
  name: "",
  description: "",
  sortNum: 0
}
const jobInfo = reactive({...defaultJobInfo})

watch(() => props.modelValue, (val) => {
  if (val) {
    // 先清除所有属性，再赋值，避免编辑后切新增时残留旧字段
    Object.keys(jobInfo).forEach(key => delete jobInfo[key])
    if (isEdit.value && props.data) {
      const data = JSON.parse(JSON.stringify(props.data))
      Object.assign(jobInfo, {
        id: data.id,
        name: data.name || "",
        description: data.description || "",
        sortNum: data.sortNum ?? 0
      })
    } else {
      Object.assign(jobInfo, defaultJobInfo)
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
    httpUtil.put(serverPaths.jobUpdate(jobInfo.id), jobInfo, callback, errorCallback)
  } else {
    httpUtil.post(serverPaths.jobAdd, jobInfo, callback, errorCallback)
  }
}
</script>
<style scoped src="../../../../assets/css/dialog_common.css">
</style>
