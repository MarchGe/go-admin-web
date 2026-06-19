<template>
  <el-dialog v-model="visible" title="分配权限" width="30%">
    <el-tree ref="permissionTree" :data="menuTree" node-key="id" :props="defaultProps" :default-checked-keys="targetInfo.menuIds" :render-after-expand="false" show-checkbox check-strictly @check-change="permissionsChange">
      <template #default="{node, data}">
        <div class="m-item">
          <span class="i-left">
            <span class="icon"><i :class="'iconfont icon-' + data.icon"></i></span>
            <span class="label">{{ node.label + (data.symbol ? '（' + data.symbol + '）' : '') }}</span>
          </span>
        </div>
      </template>
    </el-tree>
    <template #footer>
      <div class="foot">
        <span class="hint_v">
          <span class="txt">共选中</span>
          <span class="num">{{ permissionCount }}</span>
          <span class="txt">项</span>
        </span>
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" :loading="isLoading" @click="doAssignPermission">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script setup>
import {computed, nextTick, ref, watch} from "vue"
import httpUtil from "@/utils/http-utils"
import uiUtils from "@/utils/ui-utils"

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  menuTree: {
    type: Array,
    default: () => []
  },
  targetInfo: {
    type: Object,
    default: () => ({})
  },
  submitUrl: {
    type: String,
    default: ""
  }
})

const emit = defineEmits(["update:modelValue", "success"])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val)
})

const defaultProps = {
  label: "name",
  children: "children"
}

const isLoading = ref(false)
const permissionCount = ref(0)
const permissionTree = ref()

watch(() => props.modelValue, (val) => {
  if (val) {
    const menuIds = props.targetInfo.menuIds || []
    permissionCount.value = menuIds.length
    nextTick(() => {
      if (permissionTree.value) {
        permissionTree.value.setCheckedKeys(menuIds)
      }
    })
  }
})

function permissionsChange() {
  permissionCount.value = permissionTree.value.getCheckedKeys().length
}

function doAssignPermission() {
  isLoading.value = true
  const menuIds = permissionTree.value.getCheckedKeys()
  httpUtil.put(props.submitUrl, {ids: menuIds}, function () {
    isLoading.value = false
    visible.value = false
    uiUtils.showToast("success", "权限分配成功")
    emit("success", menuIds)
  }, () => {
    isLoading.value = false
  })
}
</script>
<style scoped src="../../../assets/css/sys/role.css">
</style>
