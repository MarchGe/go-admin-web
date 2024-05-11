<template>
  <div class="xterm_container" ref="xterm"></div>
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

const xterm = ref()

let term, socket
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
    socket = new WebSocket(config.ws.host + config.serverContextPath + "/terminal/ws?rows=" + term.rows + "&cols=" + term.cols + "&token=" + token)
    const attachAddon = new AttachAddon(socket)
    term.loadAddon(attachAddon)
    term.focus()
  })
})

onBeforeUnmount(() => {
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
</script>
<style scoped src="../../../assets/css/devops/xterm.css">

</style>