<template>
  <div id="app">
    <router-link to="/"></router-link>
    <router-view></router-view>
  </div>
</template>

<script>
import {sessionKeys} from "./settings";

export default {
  beforeCreate() {
    let loginUser = sessionStorage.getItem(sessionKeys.loginUser)
    if (!loginUser) {
      this.$router.push("/login")
    }
  }
}
</script>