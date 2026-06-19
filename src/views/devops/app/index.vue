<template>
  <div>
    <!--搜索栏-->
    <div class="search_head">
      <el-input class="item" type="text" v-model="x.searchItems.keyword" maxlength="20" clearable style="width: 260px; margin-right: 15px;">
        <template #prepend>关键字</template>
      </el-input>
      <el-button type="primary" icon="Search" @click="search(1)">搜索</el-button>
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
    <el-pagination class="pagination" :default-page-size="x.defaultPageSize" v-model:current-page="x.currentPage" background :total="x.total" layout="prev, pager, next" @update:current-page="search"></el-pagination>
    <!--新增/编辑弹框-->
    <upsert-dialog v-model="x.showUpsertDialog" :mode="x.upsertMode" :data="x.appInfo" @success="search(x.currentPage)"></upsert-dialog>
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
import {onMounted, reactive} from "vue"
import {hasPermission} from "@/utils/permissions"
import httpUtil from "@/utils/http-utils"
import uiUtils from "@/utils/ui-utils"
import moment from "moment"
import {serverPaths} from "@/settings"
import UpsertDialog from "./component/upsert-dialog.vue"

import {useRouter} from "vue-router";

const router = useRouter()
const x = reactive({
  searchItems: {
    keyword: ""
  },
  currentPage: 1,
  defaultPageSize: 10,
  total: 0,
  tableData: [],
  showUpsertDialog: false,
  upsertMode: "add",
  showDeleteDialog: false,
  appInfo: {},
  btnState: uiUtils.buttonState()
})

onMounted(() => {
  search(1)
})

function search(page) {
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

function addDialog() {
  x.appInfo = {}
  x.upsertMode = "add"
  x.showUpsertDialog = true
}

function updateDialog(app) {
  x.appInfo = JSON.parse(JSON.stringify(app))
  x.upsertMode = "update"
  x.showUpsertDialog = true
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
    search(x.currentPage)
  }, () => {
    x.btnState.unLoading()
  })
}
</script>
<style scoped src="../../../assets/css/devops/app.css">
</style>