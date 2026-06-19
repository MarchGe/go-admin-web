<template>
  <el-dialog class="upsert" v-model="visible" :title="isEdit ? '修改部门' : '添加部门'" width="35%">
    <div class="row">
      <span class="label _required">部门名称</span>
      <el-input class="value" v-model="deptInfo.name" placeholder="填写部门名称" maxlength="20"></el-input>
    </div>
    <div class="row">
      <span class="label">父级部门</span>
      <el-tree-select class="value" placeholder="选择父级部门" v-model="deptInfo.parentId" value-key="id" check-strictly :data="allDept" :props="defaultProps" :default-expanded-keys="[0]" accordion :render-after-expand="false" :filterable="true"></el-tree-select>
    </div>
    <div class="row">
      <span class="label">排序</span>
      <el-input-number class="value sort" v-model="deptInfo.sortNum" :min="0"></el-input-number>
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
  allDept: {
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
const defaultProps = {
  label: "name",
  children: "children"
}

const defaultDeptInfo = {
  id: null,
  name: "",
  parentId: 0,
  sortNum: 0
}
const deptInfo = reactive({...defaultDeptInfo})

watch(() => props.modelValue, (val) => {
  if (val) {
    // 先清除所有属性，再赋值，避免编辑后切新增时残留旧字段
    Object.keys(deptInfo).forEach(key => delete deptInfo[key])
    if (isEdit.value && props.data) {
      const data = JSON.parse(JSON.stringify(props.data))
      Object.assign(deptInfo, {
        id: data.id,
        name: data.name || "",
        parentId: data.parentId ?? 0,
        sortNum: data.sortNum ?? 0
      })
    } else {
      Object.assign(deptInfo, defaultDeptInfo)
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
    const {children, createTime, updateTime, ...updateData} = deptInfo
    httpUtil.put(serverPaths.deptUpdate(deptInfo.id), updateData, callback, errorCallback)
  } else {
    httpUtil.post(serverPaths.deptAdd, deptInfo, callback, errorCallback)
  }
}
</script>
<style scoped src="../../../../assets/css/dialog_common.css">
</style>
