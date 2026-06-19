<template>
  <el-dialog class="upsert" v-model="visible" :title="isEdit ? '修改服务器组' : '添加服务器组'" width="35%">
    <div class="row">
      <span class="label _required">名称</span>
      <el-input class="value" v-model="groupInfo.name" placeholder="填写名称" maxlength="30"></el-input>
    </div>
    <div class="row">
      <span class="label _required">选择服务器</span>
      <div class="value">
        <el-select v-model="groupInfo.hostIds" :filterable="true" placeholder="选择服务器" multiple>
          <el-option v-for="item in hostList" :key="item.id" :label="item.name + '/' + item.ip" :value="item.id"></el-option>
        </el-select>
      </div>
    </div>
    <div class="row">
      <span class="label">排序</span>
      <el-input-number class="value sort" v-model="groupInfo.sortNum" :min="0"></el-input-number>
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
  hostList: {
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
const groupInfo = reactive({
  id: null,
  name: "",
  hostIds: [],
  sortNum: 0
})

watch(() => props.modelValue, (val) => {
  if (val) {
    if (isEdit.value && props.data) {
      Object.assign(groupInfo, JSON.parse(JSON.stringify(props.data)))
    } else {
      Object.assign(groupInfo, {id: null, name: "", hostIds: [], sortNum: 0})
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
    httpUtil.put(serverPaths.groupUpdate(groupInfo.id), groupInfo, callback, errorCallback)
  } else {
    httpUtil.post(serverPaths.groupAdd, groupInfo, callback, errorCallback)
  }
}
</script>
<style scoped src="../../../../assets/css/dialog_common.css">
</style>
