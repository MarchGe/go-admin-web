<template>
  <div class="root">
    <div class="main">
      <div class="login_block">
        <div style="font-size: 22px;">欢迎使用</div>
        <div class="content">
          <el-input class="input" v-model="username" size="large" placeholder="邮箱" maxlength="50" style="margin-top: 40px;">
            <template #prefix>
              <el-icon style="padding-right: 5px;"><i class="iconfont icon-yonghuguanli" style="font-size: 16px; color: #a8a8a8;"></i></el-icon>
            </template>
          </el-input>
          <el-input class="input" type="password" v-model="password" size="large" placeholder="密码" maxlength="50" show-password style="margin-top: 20px;">
            <template #prefix>
              <el-icon style="padding-right: 5px;"><i class="iconfont icon-suoding" style="font-size: 16px; color: #a8a8a8;"></i></el-icon>
            </template>
          </el-input>
          <div class="err_hint" style="align-self: flex-start;">&nbsp;{{ failHint }}</div>
          <el-button class="input" type="primary" size="large" :loading="btnState.isLoading" @click="login" style="margin-top: 20px;">登录</el-button>
        </div>
      </div>
      <div style="height: 20px;"></div>
    </div>
  </div>
</template>
<script>
import {ref} from "vue";
import axios from "axios";
import {serverPaths, sessionKeys} from "@/settings";
import uiUtils from "@/utils/ui-utils";

export default {
  setup() { // vue3使用setup()代替vue2中的data()
    return {
      username: ref(""),
      password: ref(""),
      failHint: ref(""),
      btnState: ref(uiUtils.buttonState())
    }
  },
  mounted() {
    let self = this
    document.addEventListener("keydown", function(event) {
      if (event.key === "Enter") {
        self.login()
      }
    });
  },
  methods: {
    login() {
      let self = this
      let params = {
        email: self.username,
        password: self.password
      }
      if (!self._verify(params.email, params.password)) {
        return
      }
      self.btnState.loading()
      axios.post(serverPaths.login, params, {headers: {"Content-Type": "application/json"}}).then(function (res) {
        self.btnState.unLoading()
        if (res.data.code === 200) {
          sessionStorage.setItem(sessionKeys.loginUser, JSON.stringify(res.data.value))
          location.assign("/")
        } else {
          self.failHint = res.data.message
        }
      }).catch(function (err) {
        console.error(err)
      })
    },
    _verify(email, password) {
      let self = this
      if (email.trim() === "" || password.trim() === "") {
        self.failHint = "账号和密码不能为空"
        return false
      }
      return true
    }
  }
}
</script>
<style scoped src="../../assets/css/login.css">
</style>