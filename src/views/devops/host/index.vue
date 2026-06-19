<template>
  <div>
    <!--搜索栏-->
    <div class="search_head">
      <el-input class="item" type="text" v-model="x.searchItems.keyword" maxlength="20" clearable style="width: 260px; margin-right: 15px;">
        <template #prepend>关键字</template>
      </el-input>
      <el-button type="primary" icon="Search" @click="search(1)">搜索</el-button>
      <el-button type="primary" icon="Plus" :disabled="!hasPermission('host:add')" @click="addDialog">新增</el-button>
    </div>
    <!--表格数据-->
    <el-table :data="x.tableData" :stripe="true" :show-overflow-tooltip="true" :tooltip-options="{'popper-class': 'tooltip', 'enterable': false}" empty-text="暂无数据">
      <el-table-column label="名称" prop="name" header-align="center" align="center" min-width="200px"></el-table-column>
      <el-table-column label="IP" prop="ip" header-align="center" align="center" width="180px"></el-table-column>
      <el-table-column label="端口" prop="port" header-align="center" align="center"></el-table-column>
      <el-table-column label="账号" prop="user" header-align="center" align="center"></el-table-column>
      <el-table-column label="创建时间" prop="createTime" header-align="center" align="center" width="180px"></el-table-column>
      <el-table-column fixed="right" label="操作" header-align="center" align="center" width="280px">
        <template #default="scope">
          <el-button type="warning" size="small" :disabled="!hasPermission('host:update')" @click="updateDialog(scope.row)">编辑</el-button>
          <el-button type="danger" size="small" :disabled="!hasPermission('host:delete')" @click="deleteDialog(scope.row)">删除</el-button>
          <el-button type="success" size="small" :disabled="!hasPermission('host:connect')" @click="openShell(scope.row)">Shell</el-button>
          <el-button size="small" style="color: #ffffff;" color="#D5B170" :disabled="!hasPermission('explorer_sftp:entries')" @click="openExplorer(scope.row)">SFTP</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination class="pagination" :default-page-size="x.defaultPageSize" v-model:current-page="x.currentPage" background :total="x.total" layout="prev, pager, next" @update:current-page="search"></el-pagination>
    <!--新增/编辑弹框-->
    <upsert-dialog v-model="x.showUpsertDialog" :mode="x.mode" :data="x.hostInfo" @success="search(x.currentPage)"></upsert-dialog>
    <!--删除弹框-->
    <el-dialog v-model="x.showDeleteDialog" title="操作提示" width="30%">
      <span>删除后不可恢复，是否确定删除 ？</span>
      <template #footer>
        <el-button @click="x.showDeleteDialog = false">取消</el-button>
        <el-button type="primary" :loading="x.btnState.isLoading" @click="doDeleteHost">确定</el-button>
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
import UpsertDialog from "./component/upsert-dialog.vue"
import {serverPaths} from "@/settings"
import {useRouter} from "vue-router";

const router = useRouter()
const x = reactive({
  btnState: uiUtils.buttonState(),
  searchItems: {
    keyword: ""
  },
  currentPage: 1,
  defaultPageSize: 10,
  total: 0,
  tableData: [],
  showUpsertDialog: false,
  showDeleteDialog: false,
  hostInfo: {},
  mode: "add"  // 'add' 或 'update'
})

onMounted(() => {
  search(1)
})

function search(page) {
  let params = x.searchItems
  params.page = page
  params.pageSize = x.defaultPageSize
  httpUtil.get(serverPaths.hostList, params, function (resData) {
    x.currentPage = page
    x.total = resData.total
    if (resData && resData.list) {
      let rows = []
      resData.list.forEach(function (item) {
        let row = {}
        row.id = item.id
        row.name = item.name
        row.ip = item.ip
        row.port = item.port
        row.user = item.user
        row.password = item.password
        row.sortNum = item.sortNum
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
  x.hostInfo = {
    port: 22,
    sortNum: 0
  }
  x.mode = "add"
  x.showUpsertDialog = true
}

function updateDialog(host) {
  x.hostInfo = JSON.parse(JSON.stringify(host))
  x.mode = "update"
  x.showUpsertDialog = true
}

function deleteDialog(host) {
  x.hostInfo = JSON.parse(JSON.stringify(host))
  x.showDeleteDialog = true
}

function doDeleteHost() {
  x.btnState.loading()
  httpUtil.delete(serverPaths.hostDelete(x.hostInfo.id), null, function () {
    x.btnState.unLoading()
    x.showDeleteDialog = false
    uiUtils.showToast("success", "删除成功")
    search(x.currentPage)
  }, () => {
    x.btnState.unLoading()
  })
}

function openShell(host) {
  router.push("/devops/host/terminal?id=" + host.id)
}

function openExplorer(host) {
  router.push("/devops/host/explorer?id=" + host.id + "&user=" + host.user + "&ip=" + host.ip)
}
</script>
<style scoped src="../../../assets/css/devops/host.css">
</style>