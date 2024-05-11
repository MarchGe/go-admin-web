<template>
  <div>
    <!--搜索栏-->
    <div class="search_head">
      <el-input class="item" type="text" v-model="x.searchItems.keyword" maxlength="20" clearable style="width: 260px; margin-right: 15px;">
        <template #prepend>IP地址</template>
      </el-input>
      <el-button type="primary" icon="Search" @click="search">搜索</el-button>
    </div>
    <!--表格数据-->
    <el-table :data="x.tableData" :stripe="true" empty-text="暂无数据">
      <el-table-column label="IP地址" prop="ip" header-align="center" align="center" width="180px"></el-table-column>
      <el-table-column label="CPU使用率(%)" prop="cpu.usedPercent" header-align="center" align="center"></el-table-column>
      <el-table-column label="内存使用率(%)" prop="virtualMemory.usedPercent" header-align="center" align="center"></el-table-column>
      <el-table-column label="交换区使用率(%)" prop="swapMemory.usedPercent" header-align="center" align="center"></el-table-column>
      <el-table-column label="磁盘使用率(%)" prop="disk.usedPercent" header-align="center" align="center"></el-table-column>
      <el-table-column label="最新上报时间" prop="reportTime" header-align="center" align="center" width="180px"></el-table-column>
      <el-table-column fixed="right" label="操作" header-align="center" align="center" width="180px">
        <template #default="scope">
          <el-button type="primary" size="small" :disabled="!hasPermission('monitor:list')" @click="gotoDetail(scope.row)">实时状况</el-button>
          <el-button type="danger" size="small" :disabled="!hasPermission('monitor:delete')" @click="deleteDialog(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination class="pagination" :default-page-size="x.defaultPageSize" v-model:current-page="x.currentPage" background :total="x.total" layout="prev, pager, next" @update:current-page="pageChanged"></el-pagination>
    <!--删除弹框-->
    <el-dialog v-model="x.showDeleteDialog" title="操作提示" width="30%">
      <span>运行中的主机，删除后会被再次上报到列表中，要想彻底删除，请停止所在主机上的【admin-agent】程序</span>
      <template #footer>
        <el-button @click="x.showDeleteDialog = false">取消</el-button>
        <el-button type="primary" :loading="x.btnState.isLoading" @click="doDeleteHost">确定</el-button>
      </template>
    </el-dialog>
    <router-view class="rv" v-slot="{ Component, route }">
      <transition name="scale" mode="out-in">
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>
  </div>
</template>
<script setup>
import {onMounted, reactive} from "vue"
import {hasPermission} from "@/utils/permissions"
import httpUtil from "@/utils/http-utils"
import uiUtils from "@/utils/ui-utils"
import moment from "moment"
import {serverPaths} from "@/settings"
import { useRouter } from "vue-router"

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
  defaultProps: {
    label: "name",
    children: "children"
  },
  showAddDialog: false,
  showDeleteDialog: false,
  showUpdateDialog: false,
  hostItem: {},
})

onMounted(() => {
  search()
})

function pageChanged(page) {
  let params = x.searchItems
  params.page = page
  params.pageSize = x.defaultPageSize
  httpUtil.get(serverPaths.monitorList, params, function (resData) {
    x.currentPage = page
    x.total = resData.total
    if (resData && resData.list) {
      let rows = []
      resData.list.forEach(function (item) {
        let row = {}
        row.ip = item.ip
        row.cpu = item.cpu
        row.virtualMemory = item.virtualMemory
        row.swapMemory = item.swapMemory
        row.disk = item.disk
        row.reportTime = moment(item.time).format("YYYY-MM-DD HH:mm:ss")
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

function gotoDetail(row) {
  router.push("/devops/monitor/performance/detail?ip=" + row.ip)
}

function deleteDialog(row) {
  x.hostItem = JSON.parse(JSON.stringify(row))
  x.showDeleteDialog = true
}

function doDeleteHost() {
  x.btnState.loading()
  let params = {
    ip: x.hostItem.ip
  }
  httpUtil.delete(serverPaths.monitorHostDelete, params, function () {
    x.btnState.unLoading()
    x.showDeleteDialog = false
    uiUtils.showToast("success", "删除成功")
    pageChanged(x.currentPage)
  }, () => {
    x.btnState.unLoading()
  })
}
</script>
<style scoped src="../../../../assets/css/devops/monitor/performance.css">

</style>