<template>
  <div>
    <!--搜索栏-->
    <div class="search_head">
      <el-input class="item" type="text" v-model="x.searchItems.keyword" maxlength="20" clearable style="width: 260px; margin-right: 15px;">
        <template #prepend>关键字</template>
      </el-input>
      <el-button type="primary" icon="Search" @click="search">搜索</el-button>
      <el-button type="primary" icon="Plus" :disabled="!hasPermission('app:add')" @click="addDialog">新增</el-button>
    </div>
    <!--表格数据-->
    <el-table :data="x.tableData" :stripe="true" :show-overflow-tooltip="true" :tooltip-options="{'popper-class': 'tooltip', 'enterable': false}" empty-text="暂无数据">
      <el-table-column label="名称" prop="name" header-align="center" align="center" min-width="200px"></el-table-column>
      <el-table-column label="版本" prop="version" header-align="center" align="center" width="140px"></el-table-column>
      <el-table-column label="端口" prop="port" header-align="center" align="center" width="80px"></el-table-column>
      <el-table-column label="文件名" prop="fileName" header-align="center" align="center" min-width="200px"></el-table-column>
      <el-table-column label="Key" prop="key" header-align="center" align="center" min-width="300px"></el-table-column>
      <el-table-column label="创建时间" prop="createTime" header-align="center" align="center" width="180px"></el-table-column>
      <el-table-column fixed="right" label="操作" header-align="center" align="center" width="160px">
        <template #default="scope">
          <el-button type="warning" size="small" :disabled="!hasPermission('app:update')" @click="updateDialog(scope.row)">编辑</el-button>
          <el-button type="danger" size="small" :disabled="!hasPermission('app:delete')" @click="deleteDialog(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination class="pagination" :default-page-size="x.defaultPageSize" v-model:current-page="x.currentPage" background :total="x.total" layout="prev, pager, next" @update:current-page="pageChanged"></el-pagination>
    <!--新增弹框-->
    <el-dialog class="upsert" v-model="x.showAddDialog" title="添加应用" width="35%">
      <div class="row">
        <span class="label _required">名称</span>
        <el-input class="value" v-model="x.appInfo.name" placeholder="填写名称" maxlength="50"></el-input>
      </div>
      <div class="row">
        <span class="label _required">版本</span>
        <el-input class="value" v-model="x.appInfo.version" placeholder="填写版本" maxlength="50"></el-input>
      </div>
      <div class="row">
        <span class="label">端口</span>
        <el-input-number class="value sort" v-model="x.appInfo.port" :min="1" :max="65535"></el-input-number>
      </div>
      <div class="row">
        <span class="label _required">部署包</span>
        <el-upload ref="insertUpload" class="upload_v" :action="x.uploadUrl" name="file" method="post" v-model:file-list="x.appPkgList" :data="x.formPostData" :auto-upload="false" :limit="1" :on-exceed="handleInsertExceed" :before-upload="beforeUpload" :on-remove="handleUploadRemove" :on-success="handleUploadSuccess" :on-error="handleUploadError">
          <el-button class="value upload_btn" :disabled="!hasPermission('app:upload')">选择</el-button>
        </el-upload>
      </div>
      <template #footer>
        <el-button @click="x.showAddDialog = false">取消</el-button>
        <el-button type="primary" :loading="x.btnState.isLoading" @click="saveWithUpload(1)">确定</el-button>
      </template>
    </el-dialog>
    <!--编辑弹框-->
    <el-dialog class="upsert" v-model="x.showUpdateDialog" title="修改应用" width="35%">
      <div class="row">
        <span class="label _required">名称</span>
        <el-input class="value" v-model="x.appInfo.name" placeholder="填写名称" maxlength="50"></el-input>
      </div>
      <div class="row">
        <span class="label _required">版本</span>
        <el-input class="value" v-model="x.appInfo.version" placeholder="填写版本" maxlength="50"></el-input>
      </div>
      <div class="row">
        <span class="label">端口</span>
        <el-input-number class="value sort" v-model="x.appInfo.port" :min="1" :max="65535"></el-input-number>
      </div>
      <div class="row">
        <span class="label _required">部署包</span>
        <el-upload ref="updateUpload" class="upload_v" :action="x.uploadUrl" name="file" method="post" v-model:file-list="x.appPkgList" :data="x.formPostData" :auto-upload="false" :limit="1" :on-exceed="handleUpdateExceed" :before-upload="beforeUpload" :on-preview="handleDownload" :on-remove="handleUploadRemove" :on-success="handleUploadSuccess" :on-error="handleUploadError">
          <el-button class="value upload_btn" :disabled="!hasPermission('app:upload')">选择</el-button>
        </el-upload>
      </div>
      <template #footer>
        <el-button @click="x.showUpdateDialog = false">取消</el-button>
        <el-button type="primary" :loading="x.btnState.isLoading" @click="saveWithUpload(2)">确定</el-button>
      </template>
    </el-dialog>
    <!--删除弹框-->
    <el-dialog v-model="x.showDeleteDialog" title="操作提示" width="30%">
      <span>删除后不可恢复，是否确定删除 ？</span>
      <template #footer>
        <el-button @click="x.showDeleteDialog = false">取消</el-button>
        <el-button type="primary" :loading="x.btnState.isLoading" @click="doDeleteApp">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import {onMounted, reactive, ref} from "vue"
import {hasPermission} from "@/utils/permissions"
import httpUtil from "@/utils/http-utils"
import uiUtils from "@/utils/ui-utils"
import moment from "moment"
import {serverPaths, configSettings} from "@/settings"

import {useRouter} from "vue-router";

const router = useRouter()
const INSERT_MODE = 1
const x = reactive({
  btnState: uiUtils.buttonState(),
  connectBtnState: uiUtils.buttonState(),
  searchItems: {
    keyword: ""
  },
  currentPage: 1,
  defaultPageSize: 10,
  total: 0,
  tableData: [],
  showAddDialog: false,
  showDeleteDialog: false,
  showUpdateDialog: false,
  appInfo: {
    port: 8080
  },
  uploadUrl: serverPaths.uploadPkg,
  formPostData: {
    oldPath: "" // 非自动提交时，不需要这个参数
  },
  appPkgList: [],
  mode: INSERT_MODE,
  fileUidRecord: 0
})
const insertUpload = ref()
const updateUpload = ref()

onMounted(() => {
  search()
})

function pageChanged(page) {
  let params = x.searchItems
  params.page = page
  params.pageSize = x.defaultPageSize
  httpUtil.get(serverPaths.appList, params, function (resData) {
    x.currentPage = page
    x.total = resData.total
    if (resData && resData.list) {
      let rows = []
      resData.list.forEach(function (item) {
        let row = {}
        row.id = item.id
        row.name = item.name
        row.version = item.version
        row.port = item.port
        row.key = item.key
        row.fileName = item.fileName
        row.createTime = moment(item.createTime).format("YYYY-MM-DD HH:mm:ss")
        rows.push(row)
      })
      x.tableData = rows
    } else {
      x.tableData = []
    }
  })
}

function search() {
  if (x.currentPage === 1) {
    pageChanged(1)
  } else {
    x.currentPage = 1
  }
}

function addDialog() {
  x.appInfo = {
    port: 8080
  }
  x.appPkgList = []
  x.showAddDialog = true
}

function doAddApp() {
  httpUtil.post(serverPaths.appAdd, x.appInfo, function () {
    x.btnState.unLoading()
    x.showAddDialog = false
    insertUpload.value.clearFiles()
    uiUtils.showToast("success", "添加成功")
    pageChanged(x.currentPage)
  }, () => {
    x.btnState.unLoading()
  })
}

function updateDialog(app) {
  x.appInfo = JSON.parse(JSON.stringify(app))
  x.appPkgList = [
    {
      uid: Date.now(),
      name: x.appInfo.fileName
    }
  ]
  x.fileUidRecord = x.appPkgList[0].uid
  x.showUpdateDialog = true
}

function doUpdateApp() {
  httpUtil.put(serverPaths.appUpdate(x.appInfo.id), x.appInfo, function () {
    x.btnState.unLoading()
    x.showUpdateDialog = false
    uiUtils.showToast("success", "修改成功")
    pageChanged(x.currentPage)
  }, () => {
    x.btnState.unLoading()
  })
}

function deleteDialog(app) {
  x.appInfo = JSON.parse(JSON.stringify(app))
  x.showDeleteDialog = true
}

function doDeleteApp() {
  x.btnState.loading()
  httpUtil.delete(serverPaths.appDelete(x.appInfo.id), null, function () {
    x.btnState.unLoading()
    x.showDeleteDialog = false
    uiUtils.showToast("success", "删除成功")
    pageChanged(x.currentPage)
  }, () => {
    x.btnState.unLoading()
  })
}

function saveWithUpload(mode) {
  x.btnState.loading()
  x.mode = mode
  if (!x.appInfo.name || x.appInfo.name.trim() === "") {
    uiUtils.showToast("warning", "请填写名称")
    x.btnState.unLoading()
    return
  }
  if (!x.appInfo.version || x.appInfo.version.trim() === "") {
    uiUtils.showToast("warning", "请填写版本")
    x.btnState.unLoading()
    return
  }
  if (x.appPkgList.length === 0) {
    uiUtils.showToast("warning", "请选择部署包")
    x.btnState.unLoading()
    return
  }
  if (x.fileUidRecord === x.appPkgList[0].uid) {
    if (mode === INSERT_MODE) {
      doAddApp()
    } else {
      doUpdateApp()
    }
    return
  }
  if (mode === INSERT_MODE) {
    insertUpload.value.submit()
  } else {
    updateUpload.value.submit()
  }
  x.fileUidRecord = x.appPkgList[0].uid
}

function handleUploadSuccess(res) {
  if (res.code === 200) {
    x.appInfo.key = res.value.tmpKey
    x.appInfo.fileName = res.value.fileName
    if (x.mode === INSERT_MODE) {
      doAddApp()
    } else {
      doUpdateApp()
    }
  } else {
    uiUtils.showToast("error", res.message)
  }
}

function handleInsertExceed(files) {
  insertUpload.value.clearFiles()
  insertUpload.value.handleStart(files[0])
}
function handleUpdateExceed(files) {
  updateUpload.value.clearFiles()
  updateUpload.value.handleStart(files[0])
}

function handleUploadRemove() {
  x.appInfo.fileName = ""
  x.appInfo.key = ""
}

function beforeUpload (file) {
  if (file.size > configSettings.uploadAppPkgSizeLimit * 1024 * 1024) {
    uiUtils.showToast("warning", "文件大小不能超过" + configSettings.uploadAppPkgSizeLimit + "M")
    x.btnState.unLoading()
    return false
  }
  return true
}

function handleUploadError(err) {
  console.error(err)
  uiUtils.showToast("error", err.toString())
}

function handleDownload() {
  if (x.appPkgList[0].uid !== x.fileUidRecord) {
    return
  }
  const link = document.createElement("a")
  link.href = serverPaths.downloadPkg + "?key=" + x.appInfo.key + "&fileName=" + x.appInfo.fileName
  document.body.appendChild(link);
  link.click()
  document.body.removeChild(link);
}
</script>
<style scoped src="../../../assets/css/devops/app.css">
</style>