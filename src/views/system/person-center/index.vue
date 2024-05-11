<template>
  <div>
    <div class="content">
      <div class="p_info">
        <div class="p_left">
          <div class="p_img_v">
            <el-upload class="p_img_v" :before-upload="uploadCheck">
              <el-image v-if="x.imageUrl" class="p_img" :src="x.imageUrl" fit="contain">
                <template #error>
                  <svg class="p_img_err" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" data-v-ea893728="">
                    <path fill="currentColor" d="M512 512a192 192 0 1 0 0-384 192 192 0 0 0 0 384zm0 64a256 256 0 1 1 0-512 256 256 0 0 1 0 512zm320 320v-96a96 96 0 0 0-96-96H288a96 96 0 0 0-96 96v96a32 32 0 1 1-64 0v-96a160 160 0 0 1 160-160h448a160 160 0 0 1 160 160v96a32 32 0 1 1-64 0z"></path>
                  </svg>
                </template>
              </el-image>
              <el-icon v-else class="p_img avatar-uploader-icon"><Plus /></el-icon>
            </el-upload>
          </div>
          <span class="p_nickname">{{ x.userInfo.nickname }}</span>
          <span class="update_btn" @click="x.showNicknameDialog = true">修改</span>
        </div>
        <div class="h_line"></div>
        <div class="p_right">
          <div class="info">
            <div class="row">
              <div class="p_name">手机号</div>
              <div class="p_value">{{ x.userInfo.cellphone }}<span class="update_btn" style="margin-left: 5px;" @click="x.showCellphoneDialog = true">修改</span></div>
              <div class="p_name">性别</div>
              <div class="p_value">{{ x.userInfo.sexLabel === 0 ? '男' : '女' }}</div>
            </div>
            <div class="row">
              <div class="p_name">邮箱</div>
              <div class="p_value">{{ x.userInfo.email }}</div>
              <div class="p_name">真实姓名</div>
              <div class="p_value">{{ x.userInfo.name }}</div>
            </div>
            <div class="row">
              <div class="p_name">部门</div>
              <div class="p_value">
                <div style="width: 100%; flex-wrap: wrap; display: flex; align-items: center;">
                  <el-tag v-if="x.userInfo.dept" type="primary" disable-transitions style="margin: 2px 10px 2px 0;">{{ x.userInfo.dept.name }}
                  </el-tag>
                </div>
              </div>
              <div class="p_name">岗位</div>
              <div class="p_value">
                <div style="width: 100%; flex-wrap: wrap; display: flex; align-items: center;">
                  <el-tag v-for="item in x.userInfo.jobList" :key="item.id" type="warning" disable-transitions style="margin: 2px 10px 2px 0;">{{ item.name }}
                  </el-tag>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="p_name">角色</div>
              <div class="p_value">
                <div style="width: 100%; flex-wrap: wrap; display: flex; align-items: center;">
                  <el-tag v-for="item in x.userInfo.roleList" :key="item.id" type="warning" disable-transitions style="margin: 2px 10px 2px 0;">{{ item.name }}
                  </el-tag>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="p_name">注册时间</div>
              <div class="p_value">{{ x.userInfo.createTime }}</div>
              <div class="p_name">修改时间</div>
              <div class="p_value">{{ x.userInfo.updateTime }}</div>
            </div>
            <div class="btns">
              <el-button type="warning" @click="openChangePasswd">修改密码</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!--修改昵称弹框-->
    <el-dialog v-model="x.showNicknameDialog" title="修改昵称" width="30%">
      <el-input v-model="x.newNickname" placeholder="填写新昵称" maxlength="20"></el-input>
      <template #footer>
        <el-button @click="x.showNicknameDialog = false">取消</el-button>
        <el-button type="primary" :loading="x.btnState.isLoading" @click="doUpdateNickname">确定</el-button>
      </template>
    </el-dialog>
    <!--修改手机号弹框-->
    <el-dialog v-model="x.showCellphoneDialog" title="修改手机号" width="30%">
      <el-input v-model="x.newCellphone" placeholder="填写新手机号" maxlength="11"></el-input>
      <template #footer>
        <el-button @click="x.showCellphoneDialog = false">取消</el-button>
        <el-button type="primary" :loading="x.btnState.isLoading" @click="doUpdateCellphone">确定</el-button>
      </template>
    </el-dialog>
    <!--修改密码-->
    <el-dialog class="ch-passwd" v-model="x.showChangePasswdDialog" title="修改密码" width="35%">
      <div class="row">
        <span class="label _required">旧密码</span>
        <el-input class="value" type="password" v-model="x.passwdInfo.oldPasswd" placeholder="填写旧密码" maxlength="30"></el-input>
      </div>
      <div class="row">
        <span class="label _required">新密码</span>
        <el-input class="value" type="password" v-model="x.passwdInfo.newPasswd" placeholder="填写新密码" maxlength="30"></el-input>
      </div>
      <div class="row">
        <span class="label _required">确认密码</span>
        <el-input class="value" type="password" v-model="x.passwdInfo.confirmPasswd" placeholder="填写确认密码" maxlength="30"></el-input>
      </div>
      <template #footer>
        <el-button @click="x.showChangePasswdDialog = false">取消</el-button>
        <el-button type="primary" :loading="x.btnState.isLoading" @click="doChangePasswd">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import {onMounted, reactive} from "vue"
import uiUtils from "@/utils/ui-utils"
import moment from "moment"
import {serverPaths} from "@/settings"
import httpUtils from "@/utils/http-utils"
import httpUtil from "@/utils/http-utils";

const x = reactive({
  imageUrl: "xxxx", // 暂时没有头像这个功能，后端未实现
  userInfo: {},
  showNicknameDialog: false,
  showCellphoneDialog: false,
  showChangePasswdDialog: false,
  btnState: uiUtils.buttonState(),
  newNickname: "",
  newCellphone: "",
  passwdInfo: {
    oldPasswd: "",
    newPasswd: "",
    confirmPasswd: ""
  }
})

onMounted(() => {
  loadMyInfo()
})

function loadMyInfo() {
  httpUtils.get(serverPaths.myInfo, null, function (resData) {
    x.userInfo = resData
    x.userInfo.createTime = moment(x.userInfo.createTime).format("YYYY-MM-DD HH:mm:ss")
    x.userInfo.updateTime = moment(x.userInfo.updateTime).format("YYYY-MM-DD HH:mm:ss")
    x.newNickname = x.userInfo.nickname
    x.newCellphone = x.userInfo.cellphone
  })
}

function uploadCheck(file) {
  // 后期如果需要实现，参考Element-Plus的el-upload组件
  uiUtils.showToast("success", "该功能暂未实现，后端尚不支持")
}

function doUpdateNickname() {
  x.btnState.loading()
  let params = {
    nickname: x.newNickname,
    cellphone: x.userInfo.cellphone
  }
  httpUtils.put(serverPaths.myInfoUpdate, params, function () {
    x.btnState.unLoading()
    loadMyInfo()
    x.showNicknameDialog = false
    uiUtils.showToast("success", "修改成功")
  }, () => {
    x.btnState.unLoading()
  })
}

function doUpdateCellphone() {
  x.btnState.loading()
  let params = {
    nickname: x.userInfo.nickname,
    cellphone: x.newCellphone
  }
  httpUtils.put(serverPaths.myInfoUpdate, params, function () {
    x.btnState.unLoading()
    loadMyInfo()
    x.showCellphoneDialog = false
    uiUtils.showToast("success", "修改成功")
  }, () => {
    x.btnState.unLoading()
  })
}

function openChangePasswd() {
  x.passwdInfo.oldPasswd = ""
  x.passwdInfo.newPasswd = ""
  x.passwdInfo.confirmPasswd = ""
  x.showChangePasswdDialog = true
}

function doChangePasswd() {
  if (x.passwdInfo.oldPasswd.trim() === "") {
    uiUtils.showToast("warning", "旧密码不能为空")
    return
  }
  if (x.passwdInfo.newPasswd.trim() === "" || x.passwdInfo.confirmPasswd.trim() === "") {
    uiUtils.showToast("warning", "新密码不能为空")
    return
  }
  if (x.passwdInfo.newPasswd !== x.passwdInfo.confirmPasswd) {
    uiUtils.showToast("warning", "两次输入的新密码不一致")
    return
  }
  x.btnState.loading()
  let params = {
    oldPassword: x.passwdInfo.oldPasswd,
    newPassword: x.passwdInfo.newPasswd
  }
  httpUtil.put(serverPaths.changeMyPasswd, params, function () {
    x.btnState.unLoading()
    x.showChangePasswdDialog = false
    uiUtils.showToast("success", "修改成功")
  }, () => {
    x.btnState.unLoading()
  })
}
</script>
<style scoped src="../../../assets/css/sys/person-center.css">
</style>