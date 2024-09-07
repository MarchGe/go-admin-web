<template>
  <div>
    <!--搜索栏-->
    <div class="search_head">
      <el-input class="item" type="text" v-model="x.searchItems.keyword" maxlength="20" clearable style="width: 260px; margin-right: 15px;">
        <template #prepend>关键字</template>
      </el-input>
      <el-button type="primary" icon="Search" @click="search">搜索</el-button>
      <el-button type="primary" icon="Plus" :disabled="!hasPermission('job:add')" @click="addDialog">新增</el-button>
    </div>
    <!--表格数据-->
    <el-table :data="x.tableData" :stripe="true" :show-overflow-tooltip="true" :tooltip-options="{'popper-class': 'tooltip', 'enterable': false}" empty-text="暂无数据">
      <el-table-column label="名称" prop="name" header-align="center" align="center" width="240px"></el-table-column>
      <el-table-column label="岗位描述" prop="description" header-align="center" align="center"></el-table-column>
      <el-table-column label="创建时间" prop="createTime" header-align="center" align="center" width="180px"></el-table-column>
      <el-table-column fixed="right" label="操作" header-align="center" align="center" width="160px">
        <template #default="scope">
          <el-button type="warning" size="small" :disabled="!hasPermission('job:update')" @click="updateDialog(scope.row)">编辑</el-button>
          <el-button type="danger" size="small" :disabled="!hasPermission('job:delete')" @click="deleteDialog(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination class="pagination" :default-page-size="x.defaultPageSize" v-model:current-page="x.currentPage" background :total="x.total" layout="prev, pager, next" @update:current-page="pageChanged"></el-pagination>
    <!--新增弹框-->
    <el-dialog v-model="x.showAddDialog" title="添加岗位" width="30%">
      <el-input v-model="x.jobInfo.name" placeholder="填写岗位名称" maxlength="20"></el-input>
      <el-input v-model="x.jobInfo.description" type="textarea" placeholder="填写岗位描述（可选）" maxlength="200" :rows="5" resize="none" show-word-limit style="margin-top: 20px;"></el-input>
      <div style="margin-top: 10px;">
        <span>排序：</span>
        <el-input-number v-model="x.jobInfo.sortNum" :min="0"></el-input-number>
      </div>
      <template #footer>
        <el-button @click="x.showAddDialog = false">取消</el-button>
        <el-button type="primary" :loading="x.btnState.isLoading" @click="doAddJob">确定</el-button>
      </template>
    </el-dialog>
    <!--编辑弹框-->
    <el-dialog v-model="x.showUpdateDialog" title="修改岗位" width="30%">
      <el-input v-model="x.jobInfo.name" placeholder="填写岗位名称" maxlength="20"></el-input>
      <el-input v-model="x.jobInfo.description" type="textarea" placeholder="填写岗位描述（可选）" maxlength="200" :rows="5" resize="none" show-word-limit style="margin-top: 20px;"></el-input>
      <div style="margin-top: 10px;">
        <span>排序：</span>
        <el-input-number v-model="x.jobInfo.sortNum" :min="0"></el-input-number>
      </div>
      <template #footer>
        <el-button @click="x.showUpdateDialog = false">取消</el-button>
        <el-button type="primary" :loading="x.btnState.isLoading" @click="doUpdateJob">确定</el-button>
      </template>
    </el-dialog>
    <!--删除弹框-->
    <el-dialog v-model="x.showDeleteDialog" title="操作提示" width="30%">
      <span>删除后不可恢复，是否确定删除 ？</span>
      <template #footer>
        <el-button @click="x.showDeleteDialog = false">取消</el-button>
        <el-button type="primary" :loading="x.btnState.isLoading" @click="doDeleteJob">确定</el-button>
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

const x = reactive({
  btnState: uiUtils.buttonState(),
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
  jobInfo: {},
})

onMounted(() => {
  search()
})

function pageChanged(page) {
  let params = x.searchItems
  params.page = page
  params.pageSize = x.defaultPageSize
  httpUtil.get(serverPaths.jobList, params, function (resData) {
    x.currentPage = page
    x.total = resData.total
    if (resData && resData.list) {
      let rows = []
      resData.list.forEach(function (item) {
        let row = {}
        row.id = item.id
        row.name = item.name
        row.description = item.description
        row.sortNum = item.sortNum
        row.createTime = moment(item.createTime).format("YYYY-MM-DD HH:mm:ss")
        row.updateTime = moment(item.updateTime).format("YYYY-MM-DD HH:mm:ss")
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
  x.jobInfo = {
    sortNum: 0
  }
  x.showAddDialog = true
}

function doAddJob() {
  x.btnState.loading()
  httpUtil.post(serverPaths.jobAdd, x.jobInfo, function () {
    x.btnState.unLoading()
    x.showAddDialog = false
    uiUtils.showToast("success", "添加成功")
    pageChanged(x.currentPage)
  }, () => {
    x.btnState.unLoading()
  })
}

function updateDialog(job) {
  x.jobInfo = JSON.parse(JSON.stringify(job))
  x.showUpdateDialog = true
}

function doUpdateJob() {
  x.btnState.loading()
  httpUtil.put(serverPaths.jobUpdate(x.jobInfo.id), x.jobInfo, function () {
    x.btnState.unLoading()
    x.showUpdateDialog = false
    uiUtils.showToast("success", "修改成功")
    pageChanged(x.currentPage)
  }, () => {
    x.btnState.unLoading()
  })
}

function deleteDialog(job) {
  x.jobInfo = JSON.parse(JSON.stringify(job))
  x.showDeleteDialog = true
}

function doDeleteJob() {
  x.btnState.loading()
  httpUtil.delete(serverPaths.jobDelete(x.jobInfo.id), null, function () {
    x.btnState.unLoading()
    x.showDeleteDialog = false
    uiUtils.showToast("success", "删除成功")
    pageChanged(x.currentPage)
  }, () => {
    x.btnState.unLoading()
  })
}
</script>
<style scoped src="../../../assets/css/sys/job.css">
</style>