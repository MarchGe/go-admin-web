<template>
  <div>
    <!--搜索栏-->
    <div class="search_head">
      <el-input class="item" type="text" v-model="x.searchItems.keyword" maxlength="20" clearable style="width: 260px; margin-right: 15px;">
        <template #prepend>关键字</template>
      </el-input>
      <el-button type="primary" icon="Search" @click="search">搜索</el-button>
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
    <el-pagination class="pagination" :default-page-size="x.defaultPageSize" v-model:current-page="x.currentPage" background :total="x.total" layout="prev, pager, next" @update:current-page="pageChanged"></el-pagination>
    <!--新增弹框-->
    <el-dialog class="upsert" v-model="x.showAddDialog" title="添加服务器" width="35%">
      <div class="row">
        <span class="label _required">名称</span>
        <el-input class="value" v-model="x.hostInfo.name" placeholder="填写名称" maxlength="30"></el-input>
      </div>
      <div class="row">
        <span class="label _required">IP地址</span>
        <el-input class="value" v-model="x.hostInfo.ip" placeholder="填写IP地址" maxlength="30"></el-input>
      </div>
      <div class="row">
        <span class="label _required">端口</span>
        <el-input-number class="value sort" v-model="x.hostInfo.port" :min="1" :max="65535"></el-input-number>
        <el-button class="conn-test" type="primary" :loading="x.connectBtnState.isLoading" :disabled="!hasPermission('host:connectTest')" @click="connectTest">连接测试</el-button>
      </div>
      <div class="row">
        <span class="label _required">账号</span>
        <el-input class="value" v-model="x.hostInfo.user" placeholder="填写账号" maxlength="30"></el-input>
      </div>
      <div class="row">
        <span class="label _required">密码</span>
        <el-input class="value" type="password" v-model="x.hostInfo.password" placeholder="填写密码" maxlength="50"></el-input>
      </div>
      <div class="row">
        <span class="label">排序</span>
        <el-input-number class="value sort" v-model="x.hostInfo.sortNum" :min="0"></el-input-number>
      </div>
      <template #footer>
        <el-button @click="x.showAddDialog = false">取消</el-button>
        <el-button type="primary" :loading="x.btnState.isLoading" @click="doAddHost">确定</el-button>
      </template>
    </el-dialog>
    <!--编辑弹框-->
    <el-dialog class="upsert" v-model="x.showUpdateDialog" title="修改服务器" width="35%">
      <div class="row">
        <span class="label _required">名称</span>
        <el-input class="value" v-model="x.hostInfo.name" placeholder="填写名称" maxlength="30"></el-input>
      </div>
      <div class="row">
        <span class="label _required">IP地址</span>
        <el-input class="value" v-model="x.hostInfo.ip" placeholder="填写IP地址" maxlength="30"></el-input>
      </div>
      <div class="row">
        <span class="label _required">端口</span>
        <el-input-number class="value sort" v-model="x.hostInfo.port" :min="1" :max="65535"></el-input-number>
        <el-button class="conn-test" type="primary" :loading="x.connectBtnState.isLoading" :disabled="!hasPermission('host:connectTest')" @click="connectTest">连接测试</el-button>
      </div>
      <div class="row">
        <span class="label _required">账号</span>
        <el-input class="value" v-model="x.hostInfo.user" placeholder="填写账号" maxlength="30"></el-input>
      </div>
      <div class="row">
        <span class="label _required">密码</span>
        <el-input class="value" type="password" v-model="x.hostInfo.password" placeholder="填写密码" maxlength="50"></el-input>
      </div>
      <div class="row">
        <span class="label">排序</span>
        <el-input-number class="value sort" v-model="x.hostInfo.sortNum" :min="0"></el-input-number>
      </div>
      <template #footer>
        <el-button @click="x.showUpdateDialog = false">取消</el-button>
        <el-button type="primary" :loading="x.btnState.isLoading" @click="doUpdateHost">确定</el-button>
      </template>
    </el-dialog>
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
import {serverPaths} from "@/settings"
import {useRouter} from "vue-router";

const router = useRouter()
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
  hostInfo: {},
  passwordRecord: "",
  mode: 0  // 0: 新增模式, 1: 编辑模式
})

onMounted(() => {
  search()
})

function pageChanged(page) {
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

function search() {
  if (x.currentPage === 1) {
    pageChanged(1)
  } else {
    x.currentPage = 1
  }
}

function addDialog() {
  x.hostInfo = {
    port: 22,
    sortNum: 0
  }
  x.mode = 0
  x.showAddDialog = true
}

function doAddHost() {
  x.btnState.loading()
  httpUtil.post(serverPaths.hostAdd, x.hostInfo, function () {
    x.btnState.unLoading()
    x.showAddDialog = false
    uiUtils.showToast("success", "添加成功")
    pageChanged(x.currentPage)
  }, () => {
    x.btnState.unLoading()
  })
}

function updateDialog(host) {
  x.hostInfo = JSON.parse(JSON.stringify(host))
  x.passwordRecord = host.password
  x.mode = 1
  x.showUpdateDialog = true
}

function doUpdateHost() {
  x.btnState.loading()
  if (x.hostInfo.password !== x.passwordRecord) {
    x.hostInfo.passwordChanged = true
  }
  httpUtil.put(serverPaths.hostUpdate(x.hostInfo.id), x.hostInfo, function () {
    x.btnState.unLoading()
    x.showUpdateDialog = false
    uiUtils.showToast("success", "修改成功")
    pageChanged(x.currentPage)
  }, () => {
    x.btnState.unLoading()
  })
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
    pageChanged(x.currentPage)
  }, () => {
    x.btnState.unLoading()
  })
}

function connectTest() {
  x.connectBtnState.loading()
  let params = {
    ip: x.hostInfo.ip,
    port: x.hostInfo.port,
    user: x.hostInfo.user,
    password: x.hostInfo.password,
    mode: x.mode,
    passwordChanged: false
  }
  if (x.mode === 1 && x.hostInfo.password !== x.passwordRecord) {
    params.passwordChanged = true
  }
  httpUtil.get(serverPaths.hostConnectTest, params, function (data) {
    x.connectBtnState.unLoading()
    if (data.result) {
      uiUtils.showToast("success", "连接成功")
    } else {
      uiUtils.showToast("warning", "连接失败")
    }
  }, () => {
    x.connectBtnState.unLoading()
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