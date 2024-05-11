<template>
  <div>
    <!--搜索栏-->
    <div class="search_head">
      <el-input class="item" type="text" v-model="x.searchItems.keyword" maxlength="20" clearable style="width: 260px; margin-right: 15px;">
        <template #prepend>关键字</template>
      </el-input>
      <el-button type="primary" icon="Search" @click="search">搜索</el-button>
      <el-select class="item" v-model="x.clearLogType" style="width: 110px; margin-left: 30px; margin-right: 15px;">
        <el-option label="全部" :value="1"></el-option>
        <el-option label="一周前" :value="2"></el-option>
        <el-option label="一个月前" :value="3"></el-option>
        <el-option label="三个月前" :value="4"></el-option>
        <el-option label="一年前" :value="5"></el-option>
      </el-select>
      <el-button type="primary" icon="Search" :disabled="!hasPermission('loginLog:delete')" @click="clearLog">清空</el-button>
    </div>
    <!--表格数据-->
    <el-table :data="x.tableData" :stripe="true" empty-text="暂无数据" :show-overflow-tooltip="true" :tooltip-options="{'popper-class': 'tooltip', 'enterable': false}">
      <el-table-column label="用户名" prop="nickname" header-align="center" align="center" width="140px"></el-table-column>
      <el-table-column label="真名" prop="realName" header-align="center" align="center" width="100px"></el-table-column>
      <el-table-column label="部门" prop="deptName" header-align="center" align="center" width="140px"></el-table-column>
      <el-table-column label="登录IP" prop="ip" header-align="center" align="center" width="140px"></el-table-column>
      <el-table-column label="登录UA" prop="userAgent" header-align="center" align="center"></el-table-column>
      <el-table-column label="登录时间" prop="createTime" header-align="center" align="center" width="200px"></el-table-column>
    </el-table>
    <el-pagination class="pagination" :default-page-size="x.defaultPageSize" v-model:current-page="x.currentPage" background :total="x.total" layout="prev, pager, next" @update:current-page="pageChanged"></el-pagination>
    <!--删除弹框-->
    <el-dialog v-model="x.showDeleteDialog" title="操作提示" width="30%">
      <span>确定清除<span style="color: #e6a23c;">{{x.clearLogHint}}</span>的日志？</span>
      <template #footer>
        <el-button @click="x.showDeleteDialog = false">取消</el-button>
        <el-button type="primary" :loading="x.btnState.isLoading" @click="doClearLog">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import {onMounted, reactive} from "vue"
import httpUtil from "@/utils/http-utils"
import {hasPermission} from "@/utils/permissions"
import uiUtils from "@/utils/ui-utils"
import moment from "moment"
import {serverPaths} from "@/settings"

let map = new Map()
map.set(1, "全部")
map.set(2, "一周前")
map.set(3, "一个月前")
map.set(4, "三个月前")
map.set(5, "一年前")
const x = reactive({
  btnState: uiUtils.buttonState(),
  searchItems: {
    keyword: ""
  },
  clearLogType: 2,
  clearLogHint: map.get(2),
  currentPage: 1,
  defaultPageSize: 10,
  total: 0,
  tableData: [],
  defaultProps: {
    label: "name",
    children: "children"
  },
  showAddDialog: false,
  showDeleteDialog: false,
  showUpdateDialog: false,
  logInfo: {},
})

onMounted(() => {
  search()
})

function pageChanged(page) {
  let params = x.searchItems
  params.page = page
  params.pageSize = x.defaultPageSize
  httpUtil.get(serverPaths.loginLog, params, function (resData) {
    x.currentPage = page
    x.total = resData.total
    if (resData && resData.list) {
      let rows = []
      resData.list.forEach(function (item) {
        let row = {}
        row.id = item.id
        row.userId = item.userId
        row.nickname = item.nickname
        row.realName = item.realName
        row.deptName = item.deptName
        row.ip = item.ip
        row.address = item.address
        row.userAgent = item.userAgent
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

function clearLog() {
  x.clearLogHint = map.get(x.clearLogType)
  x.showDeleteDialog = true
}

function doClearLog() {
  x.btnState.loading()
  let params = {
    type: x.clearLogType
  }
  httpUtil.delete(serverPaths.loginLogDelete, params, function () {
    x.btnState.unLoading()
    x.showDeleteDialog = false
    uiUtils.showToast("success", "清除成功")
    x.currentPage = 1
    pageChanged(x.currentPage)
  }, () => {
    x.btnState.unLoading()
  })
}
</script>
<style>
.tooltip {
  max-width: 50%;
}
</style>