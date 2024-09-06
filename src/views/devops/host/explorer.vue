<template>
  <div id="container" class="container">
    <div class="head" style="padding-top: 0; padding-bottom: 0;">
      <el-icon class="arrow-icon" size="24" @click="goBack" style="margin-left: 10px;"><i class="iconfont icon-arrow-left arrow" :class="x.pathStack.length === 0 ? 'disable': ''"></i></el-icon>
      <span class="path"><el-tag type="info" style="border-radius: 0; border: none; font-size: 14px; padding-top: 22px; padding-bottom: 22px;">{{x.hostStr}}</el-tag>{{x.crumbs}}</span>
      <span style="flex: auto;"></span>
      <div class="refresh" @click="refresh">
        <el-icon :class="x.isRefreshing ? 'is-loading' : ''" color="#8a8a8a" size="18">
          <Refresh/>
        </el-icon>
      </div>
      <el-button class="op_btn" type="primary" size="small" @click="uploadDialog" :disabled="!hasPermission('explorer_sftp:upload')">上传</el-button>
      <el-button class="op_btn" color="#EFCB61" type="warning" size="small" style="color: #ffffff;" @click="createDialog" :disabled="!hasPermission('explorer_sftp:upload')">创建目录</el-button>
      <el-button class="op_btn" color="#dcdcdc" size="small" style="margin-right: 20px; color: #666666;" @click="routeBack">返回</el-button>
    </div>
    <div class="list" v-if="x.entries.length > 0">
      <div class="item_v" v-for="item in x.entries" :key="item.name">
        <div class="item" v-if="item.type === 'd'">
          <el-dropdown trigger="contextmenu" @command="handleCommand">
            <el-icon size="60" @dblclick="openDir(item.name)"><i class="iconfont icon-ex-dir dir"></i></el-icon>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item :command="'OPEN:'+item.name">打开</el-dropdown-item>
                <el-dropdown-item :command="'DELETE:'+item.name" :disabled="!hasPermission('explorer_sftp:delete')">删除</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <span :title="item.name" class="name">{{item.name}}</span>
        </div>
        <div class="item" v-else>
          <el-dropdown trigger="contextmenu" @command="handleCommand">
            <el-icon size="60"><i class="iconfont icon-ex-file file"></i></el-icon>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item :command="'DELETE:'+item.name" :disabled="!hasPermission('explorer_sftp:delete')">删除</el-dropdown-item>
                <el-dropdown-item :command="'DOWNLOAD:'+item.name" :disabled="!hasPermission('explorer_sftp:download')">下载</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <span :title="item.name" class="name">{{item.name}}</span>
        </div>
      </div>
    </div>
    <div class="empty-dir" v-else>空目录</div>
    <!--删除弹框-->
    <el-dialog v-model="x.showDeleteDialog" title="操作提示" width="30%">
      <span>删除后不可恢复，是否确定删除 ？</span>
      <template #footer>
        <el-button @click="x.showDeleteDialog = false">取消</el-button>
        <el-button type="primary" :loading="x.btnState.isLoading" @click="doDelete">确定</el-button>
      </template>
    </el-dialog>
    <!--上传弹框-->
    <el-dialog v-model="x.showUploadDialog" title="上传提示" width="30%">
      <el-upload ref="upload" drag :action="x.uploadUrl" name="file" method="post" v-model:file-list="x.uploadFileList" :data="x.formUploadData" :auto-upload="true" :limit="1" :on-exceed="handleExceed" :before-upload="beforeUpload" :on-success="handleUploadSuccess" :on-error="handleUploadError">
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          拖拽上传或 <em>点击上传</em>
          <div style="margin-top: 10px; color: #e6a23c; font-size: 12px;">注意：上传重名文件会自动覆盖</div>
        </div>
      </el-upload>
    </el-dialog>
    <!--创建目录弹框-->
    <el-dialog class="upsert" v-model="x.showCreateDialog" title="创建目录" width="35%">
      <div class="row">
        <span class="label _required">名称</span>
        <el-input class="value" v-model="x.inputDirName" placeholder="填写目录名称" maxlength="30"></el-input>
      </div>
      <template #footer>
        <el-button @click="x.showCreateDialog = false">取消</el-button>
        <el-button type="primary" :loading="x.btnState.isLoading" @click="doCreateDir">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import {onMounted, reactive, ref} from "vue"
import {hasPermission} from "@/utils/permissions"
import {serverPaths} from "@/settings"
import uiUtils from "@/utils/ui-utils"
import httpUtils from "@/utils/http-utils"
import {ElLoading} from "element-plus"
import {useRoute, useRouter} from "vue-router";

const loadingConfig = {
  background: "rgba(255,255,255,0.3)",
  target: "#container"
}
const route = useRoute()
const router = useRouter()
const x = reactive({
  btnState: uiUtils.buttonState(),
  root: "/",
  hostStr: "",
  crumbs: "",
  uploadUrl: serverPaths.hostExplorerUpload,
  formUploadData: {
    dir: ""
  },
  uploadFileList: [],
  pathStack: [],
  searchItems: {
    dir: "",
    keyword: ""
  },
  entries: [],
  showDeleteDialog: false,
  showUploadDialog: false,
  opFileName: "",
  isRefreshing: false,
  showCreateDialog: false,
  inputDirName: ""
})
const upload = ref()

onMounted(() => {
  x.hostStr = route.query.user + "@" + route.query.ip
  let parentDir = getParentDir()
  search(parentDir, () => {
    showCrumbs()
  })
})

function showCrumbs() {
  x.crumbs = getParentDir().replaceAll("/", " / ")
}

function search(parentDir, successCallback) {
  x.searchItems.dir = parentDir
  let params = x.searchItems
  params.hostId = route.query.id
  const loadingInstance = ElLoading.service(loadingConfig)
  httpUtils.get(serverPaths.hostExplorerEntries, params, function (resList) {
    if (resList) {
      x.entries = resList
    } else {
      x.entries = []
    }
    loadingInstance.close()
    if (typeof successCallback === "function") {
      successCallback()
    }
  }, () => {
    loadingInstance.close()
  })
}

function refresh() {
  if (x.isRefreshing) {
    return
  }
  x.isRefreshing = true
  let parentDir = getParentDir();
  search(parentDir, () => {
    showCrumbs()
    x.isRefreshing = false
    uiUtils.showToast("success", "刷新成功")
  })
}

function handleCommand(command) {
  let parts = command.split(":");
  let op = parts[0]
  x.opFileName = parts[1]
  if (op === "OPEN") {
    openDir(x.opFileName)
    return
  }
  if (op === "DELETE") {
    x.showDeleteDialog = true
    return
  }
  if (op === "DOWNLOAD") {
    downloadFile(x.opFileName)
  }
}

function openDir(dirName) {
  let parentDir = getParentDir();
  if (parentDir === x.root) {
    search(parentDir + dirName, () => {
      x.pathStack.push({
        index: x.pathStack.length + 1,
        name: dirName
      })
      showCrumbs()
    })
  } else {
    search(parentDir + "/" + dirName, () => {
      x.pathStack.push({
        index: x.pathStack.length + 1,
        name: dirName
      })
      showCrumbs()
    })
  }
}

function downloadFile(fileName) {
  let parentDir = getParentDir();
  let filePath
  if (parentDir === x.root) {
    filePath = parentDir + fileName
  } else {
    filePath = parentDir + "/" + fileName
  }
  const link = document.createElement("a")
  link.href = serverPaths.hostExplorerDownload + "?path=" + filePath + "&hostId=" + route.query.id
  document.body.appendChild(link);
  link.click()
  document.body.removeChild(link);
}

function getParentDir() {
  if (x.pathStack.length === 0) {
    return x.root
  }
  let names = []
  for (const item of x.pathStack) {
    names.push(item.name)
  }
  return x.root + names.join("/")
}

function doDelete() {
  let parentDir = getParentDir();
  let filePath
  if (parentDir === x.root) {
    filePath = parentDir + x.opFileName
  } else {
    filePath = parentDir + "/" + x.opFileName
  }
  let params = {
    path: filePath,
    hostId: route.query.id
  }
  httpUtils.delete(serverPaths.hostExplorerDelete, params, function () {
    x.showDeleteDialog = false
    uiUtils.showToast("success", "删除成功")
    search(parentDir)
  })
}

function goBack() {
  if (x.pathStack.length > 0) {
    let parentDir = getParentDir();
    let backDir = parentDir.substring(0, parentDir.lastIndexOf("/"))
    if (backDir + "/" === x.root) {
      backDir = x.root
    }
    search(backDir, () => {
      x.pathStack.pop()
      showCrumbs()
    })
  }
}

function uploadDialog() {
  if (upload.value) {
    upload.value.clearFiles()
  }
  x.showUploadDialog = true
}

function createDialog() {
  x.showCreateDialog = true
}

function doCreateDir() {
  x.btnState.loading()
  const parentDir = getParentDir()
  let params = {
    hostId: parseInt(route.query.id),
    dir: parentDir,
    name: x.inputDirName
  }
  httpUtils.post(serverPaths.hostExplorerCreate, params, function () {
    x.btnState.unLoading()
    x.showCreateDialog = false
    x.inputDirName = ""
    uiUtils.showToast("success", "创建成功")
    search(parentDir)
  }, () => {
    x.btnState.unLoading()
  })
}

function beforeUpload () {
  x.formUploadData.dir = getParentDir()
  x.formUploadData.hostId = route.query.id
  return true
}

function handleExceed(files) {
  upload.value.clearFiles()
  upload.value.handleStart(files[0])
  upload.value.submit()
}

function handleUploadSuccess(res) {
  if (res.code === 200) {
    x.showUploadDialog = false
    uiUtils.showToast("success", "上传成功")
    search(getParentDir())
  } else {
    uiUtils.showToast("error", res.message)
  }
}

function handleUploadError(err) {
  console.error(err)
  uiUtils.showToast("error", err.toString())
}

function routeBack() {
  router.back()
}

</script>
<style scoped src="../../../assets/css/devops/explorer.css">

</style>