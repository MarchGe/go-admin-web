<template>
  <div class="xterm_container" ref="xterm">
    <el-button class="back_btn" type="primary" color="#dcdcdc" size="small" @click="goBack">返回</el-button>
  </div>
</template>
<script setup>
import {onBeforeUnmount, onMounted, ref} from "vue";
import {Terminal} from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css"
import {FitAddon} from "@xterm/addon-fit";
import {CanvasAddon} from "@xterm/addon-canvas";
import {AttachAddon} from '@xterm/addon-attach';
import {serverPaths, config} from "@/settings";
import httpUtils from "@/utils/http-utils";
import {useRoute, useRouter} from "vue-router";

const xterm = ref()
const route = useRoute()
const router = useRouter()
let term, socket, heartbeatInterval
onMounted(() => {
  term = new Terminal({
    cursorInactiveStyle: "none",
    fontSize: 14
  })
  let fitAddon = new FitAddon()
  let canvasAddon = new CanvasAddon()
  term.loadAddon(canvasAddon)
  term.loadAddon(fitAddon)

  getWebShellToken().then(token => {
    term.open(xterm.value)
    term.element.style.padding = "8px"
    fitAddon.fit()
    term.write("Start connecting to server...\r\n")
    socket = new WebSocket(config.ws.host + config.serverContextPath + "/terminal/ws/ssh/" + route.query.id + "?rows=" + term.rows + "&cols=" + term.cols + "&token=" + token)
    const attachAddon = new AttachAddon(socket)
    term.loadAddon(attachAddon)
    term.focus()
  })
})

onBeforeUnmount(() => {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval)
  }
  if (socket) {
    socket.close(1000, "")  // normal closure
  }
  setTimeout(function () {
    if (term != null) {
      term.dispose()
    }
  }, 1000)
})

function getWebShellToken() {
  return new Promise(resolve => {
    httpUtils.get(serverPaths.webShellToken, null, function (data) {
      resolve(data.token)
    })
  })
}
function goBack() {
  router.back()
}
</script>
<style scoped src="../../../assets/css/devops/host-xterm.css">

</style>