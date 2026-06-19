<template>
  <el-dialog v-model="visible" width="60%">
    <div class="p_info">
      <div class="p_left">
        <el-image class="p_img" src="" fit="contain">
          <template #error>
            <svg class="p_img_err" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" data-v-ea893728="">
              <path fill="currentColor" d="M512 512a192 192 0 1 0 0-384 192 192 0 0 0 0 384zm0 64a256 256 0 1 1 0-512 256 256 0 0 1 0 512zm320 320v-96a96 96 0 0 0-96-96H288a96 96 0 0 0-96 96v96a32 32 0 1 1-64 0v-96a160 160 0 0 1 160-160h448a160 160 0 0 1 160 160v96a32 32 0 1 1-64 0z"></path>
            </svg>
          </template>
        </el-image>
        <span class="p_nickname">{{ userInfo.nickname }}</span>
      </div>
      <div class="h_line"></div>
      <div class="p_right">
        <div class="info">
          <div class="row">
            <div class="p_name">手机号</div>
            <div class="p_value">{{ userInfo.cellphone }}</div>
            <div class="p_name">性别</div>
            <div class="p_value">{{ userInfo.sexLabel }}</div>
          </div>
          <div class="row">
            <div class="p_name">邮箱</div>
            <div class="p_value">{{ userInfo.email }}</div>
            <div class="p_name">账号状态</div>
            <div class="p_value">
              <el-tag :type="userInfo.statusTagType" disable-transitions>{{ userInfo.statusLabel }}</el-tag>
            </div>
          </div>
          <div class="row">
            <div class="p_name">真实姓名</div>
            <div class="p_value">{{ userInfo.name }}</div>
            <div class="p_name">超级用户</div>
            <div class="p_value">
              <el-tag :type="userInfo.rootTagType" disable-transitions>{{ userInfo.rootLabel }}</el-tag>
            </div>
          </div>
          <div class="row">
            <div class="p_name">部门</div>
            <div class="p_value">
              <div style="width: 100%; flex-wrap: wrap; display: flex; align-items: center;">
                <el-tag v-if="userInfo.dept" type="primary" disable-transitions style="margin: 2px 10px 2px 0;">{{ userInfo.dept.name }}
                </el-tag>
              </div>
            </div>
            <div class="p_name">岗位</div>
            <div class="p_value">
              <div style="width: 100%; flex-wrap: wrap; display: flex; align-items: center;">
                <el-tag v-for="item in userInfo.jobList" :key="item.id" type="warning" disable-transitions style="margin: 2px 10px 2px 0;">{{ item.name }}
                </el-tag>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="p_name">角色</div>
            <div class="p_value">
              <div style="width: 100%; flex-wrap: wrap; display: flex; align-items: center;">
                <el-tag v-for="item in userInfo.roleList" :key="item.id" type="warning" disable-transitions style="margin: 2px 10px 2px 0;">{{ item.name }}
                </el-tag>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="p_name">注册时间</div>
            <div class="p_value">{{ userInfo.createTime }}</div>
            <div class="p_name">修改时间</div>
            <div class="p_value">{{ userInfo.updateTime }}</div>
          </div>
        </div>
        <div class="op_btn_v">
          <el-button class="op_btn" type="success" :disabled="!hasPermission('user:changePassword')" @click="emit('updatePassword')">修改密码</el-button>
          <el-button class="op_btn" type="warning" :disabled="!hasPermission('user:resetPassword')" @click="emit('resetPassword')">重置密码</el-button>
          <el-button class="op_btn" type="danger" :disabled="!hasPermission('user:delete')" @click="emit('delete')">删除用户</el-button>
          <el-button class="op_btn" type="primary" :disabled="!hasPermission('user:menus')" @click="emit('assignPermission')">分配权限</el-button>
        </div>
      </div>
    </div>
  </el-dialog>
</template>
<script setup>
import {computed, watch} from "vue"
import {hasPermission} from "@/utils/permissions"

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  data: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(["update:modelValue", "updatePassword", "resetPassword", "delete", "assignPermission"])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val)
})

const defaultUserInfo = {
  nickname: "",
  cellphone: "",
  sexLabel: "",
  email: "",
  statusLabel: "",
  statusTagType: "",
  name: "",
  rootLabel: "",
  rootTagType: "",
  dept: null,
  jobList: [],
  roleList: [],
  createTime: "",
  updateTime: ""
}

const userInfo = computed(() => ({...defaultUserInfo, ...props.data}))
</script>
<style scoped src="../../../../assets/css/sys/users.css">
</style>
