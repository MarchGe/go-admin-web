<template>
  <el-dialog v-model="visible" :title="isEdit ? '编辑用户' : '新增用户'" width="60%">
    <div class="p_info">
      <div class="p_left">
        <el-image class="p_img" src="" fit="contain">
          <template #error>
            <svg class="p_img_err" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" data-v-ea893728="">
              <path fill="currentColor" d="M512 512a192 192 0 1 0 0-384 192 192 0 0 0 0 384zm0 64a256 256 0 1 1 0-512 256 256 0 0 1 0 512zm320 320v-96a96 96 0 0 0-96-96H288a96 96 0 0 0-96 96v96a32 32 0 1 1-64 0v-96a160 160 0 0 1 160-160h448a160 160 0 0 1 160 160v96a32 32 0 1 1-64 0z"></path>
            </svg>
          </template>
        </el-image>
        <span class="p_nickname">
          <el-input class="_required" v-model="userInfo.nickname" maxlength="20" placeholder="用户昵称"></el-input>
        </span>
      </div>
      <div class="h_line"></div>
      <div class="p_right">
        <div class="info">
          <div class="row">
            <div class="p_name">手机号</div>
            <div class="p_value">
              <el-input v-model="userInfo.cellphone" maxlength="11"></el-input>
            </div>
            <div class="p_name">性别</div>
            <div class="p_value">
              <el-select v-model="userInfo.sex">
                <el-option label="男" :value="0"></el-option>
                <el-option label="女" :value="1"></el-option>
              </el-select>
            </div>
          </div>
          <div class="row">
            <div class="p_name _required">邮箱</div>
            <div class="p_value">
              <el-input v-model="userInfo.email" maxlength="50"></el-input>
            </div>
            <div class="p_name">真实姓名</div>
            <div class="p_value">
              <el-input v-model="userInfo.name" maxlength="20"></el-input>
            </div>
          </div>
          <div class="row">
            <div class="p_name _required">部门</div>
            <div class="p_value">
              <el-tree-select class="v" placeholder="选择部门" v-model="userInfo.deptId" value-key="id" check-strictly :data="deptTree" :props="defaultProps" accordion :render-after-expand="false" :filterable="true"></el-tree-select>
            </div>
            <div class="p_name _required">岗位</div>
            <div class="p_value">
              <el-select v-model="userInfo.jobIds" placeholder="选择岗位" :filterable="true" multiple>
                <el-option v-for="item in jobList" :key="item.id" :label="item.name" :value="item.id"></el-option>
              </el-select>
            </div>
          </div>
          <div class="row">
            <div class="p_name _required">角色</div>
            <div class="p_value">
              <el-select v-model="userInfo.roleIds" placeholder="选择角色" :filterable="true" multiple style="width: 100%;">
                <el-option v-for="item in roleList" :key="item.id" :label="item.name" :value="item.id"></el-option>
              </el-select>
            </div>
          </div>
          <div class="row" v-if="!isEdit">
            <div class="p_name">发送密码</div>
            <el-radio-group v-model="userInfo.shouldSendPassword" style="padding-left: 10px;">
              <el-radio :value="true">是</el-radio>
              <el-radio :value="false">否</el-radio>
            </el-radio-group>
            <span style="padding-left: 20px; color: #b4b4b4;">（是否通过邮件发送初始登录密码）</span>
          </div>
        </div>
        <div class="op_btn_v">
          <el-button class="op_btn" :type="isEdit ? 'warning' : 'primary'" :loading="isLoading" @click="doSubmit">保存</el-button>
        </div>
      </div>
    </div>
  </el-dialog>
</template>
<script setup>
import {computed, reactive, ref, watch} from "vue"
import httpUtils from "@/utils/http-utils"
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
  roleList: {
    type: Array,
    default: () => []
  },
  deptTree: {
    type: Array,
    default: () => []
  },
  jobList: {
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

const defaultUserInfo = {
  nickname: "",
  cellphone: "",
  sex: 0,
  email: "",
  name: "",
  deptId: null,
  jobIds: [],
  roleIds: [],
  shouldSendPassword: false
}

const userInfo = reactive({...defaultUserInfo})

watch(() => props.modelValue, (val) => {
  if (val) {
    if (isEdit.value && props.data) {
      const data = JSON.parse(JSON.stringify(props.data))
      Object.assign(userInfo, {
        id: data.id,
        nickname: data.nickname || "",
        cellphone: data.cellphone || "",
        sex: data.sex ?? 0,
        email: data.email || "",
        name: data.name || "",
        deptId: data.deptId || null,
        jobIds: data.jobIds || [],
        roleIds: data.roleIds || [],
        shouldSendPassword: false
      })
    } else {
      Object.assign(userInfo, defaultUserInfo)
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
    const {
      roleList,
      menuIds,
      sexLabel,
      statusLabel,
      statusTagType,
      rootLabel,
      rootTagType,
      dept,
      jobList,
      ...updateUserInfo
    } = userInfo
    httpUtils.put(serverPaths.userUpdate(userInfo.id), updateUserInfo, callback, errorCallback)
  } else {
    httpUtils.post(serverPaths.userAdd, userInfo, callback, errorCallback)
  }
}
</script>
<style scoped src="../../../../assets/css/sys/users.css">
</style>
