<template>
  <div>
    <!--搜索栏-->
    <div class="search_head">
      <el-input class="item" type="text" v-model="x.searchItems.keyword" maxlength="20" clearable style="width: 260px; margin-right: 15px;">
        <template #prepend>关键字</template>
      </el-input>
      <el-button type="primary" icon="Search" @click="search">搜索</el-button>
      <el-button type="primary" icon="Plus" :disabled="!hasPermission('group:add')" @click="addDialog">新增</el-button>
    </div>
    <!--表格数据-->
    <el-table :data="x.tableData" :stripe="true" :show-overflow-tooltip="true" :tooltip-options="{'popper-class': 'tooltip', 'enterable': false}" empty-text="暂无数据">
      <el-table-column label="名称" prop="name" header-align="center" align="center"></el-table-column>
      <el-table-column label="主机数量" prop="count" header-align="center" align="center"></el-table-column>
      <el-table-column label="创建时间" prop="createTime" header-align="center" align="center" width="180px"></el-table-column>
      <el-table-column fixed="right" label="操作" header-align="center" align="center" width="160px">
        <template #default="scope">
          <el-button type="warning" size="small" :disabled="!hasPermission('group:update')" @click="updateDialog(scope.row)">编辑</el-button>
          <el-button type="danger" size="small" :disabled="!hasPermission('group:delete')" @click="deleteDialog(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination class="pagination" :default-page-size="x.defaultPageSize" v-model:current-page="x.currentPage" background :total="x.total" layout="prev, pager, next" @update:current-page="pageChanged"></el-pagination>
    <!--新增弹框-->
    <el-dialog class="upsert" v-model="x.showAddDialog" title="添加服务器组" width="35%">
      <div class="row">
        <span class="label _required">名称</span>
        <el-input class="value" v-model="x.groupInfo.name" placeholder="填写名称" maxlength="30"></el-input>
      </div>
      <div class="row">
        <span class="label _required">选择服务器</span>
        <div class="value">
          <el-select v-model="x.groupInfo.hostIds" :filterable="true" placeholder="选择服务器" multiple>
            <el-option v-for="item in x.hostList" :key="item.id" :label="item.name + '/' + item.ip" :value="item.id"></el-option>
          </el-select>
        </div>
      </div>
      <div class="row">
        <span class="label">排序</span>
        <el-input-number class="value sort" v-model="x.groupInfo.sortNum" :min="0"></el-input-number>
      </div>
      <template #footer>
        <el-button @click="x.showAddDialog = false">取消</el-button>
        <el-button type="primary" :loading="x.btnState.isLoading" @click="doAddGroup">确定</el-button>
      </template>
    </el-dialog>
    <!--编辑弹框-->
    <el-dialog class="upsert" v-model="x.showUpdateDialog" title="修改服务器组" width="35%">
      <div class="row">
        <span class="label _required">名称</span>
        <el-input class="value" v-model="x.groupInfo.name" placeholder="填写名称" maxlength="30"></el-input>
      </div>
      <div class="row">
        <span class="label _required">选择服务器</span>
        <div class="value">
          <el-select v-model="x.groupInfo.hostIds" :filterable="true" placeholder="选择服务器" multiple>
            <el-option v-for="item in x.hostList" :key="item.id" :label="item.name + '/' + item.ip" :value="item.id"></el-option>
          </el-select>
        </div>
      </div>
      <div class="row">
        <span class="label">排序</span>
        <el-input-number class="value sort" v-model="x.groupInfo.sortNum" :min="0"></el-input-number>
      </div>
      <template #footer>
        <el-button @click="x.showUpdateDialog = false">取消</el-button>
        <el-button type="primary" :loading="x.btnState.isLoading" @click="doUpdateGroup">确定</el-button>
      </template>
    </el-dialog>
    <!--删除弹框-->
    <el-dialog v-model="x.showDeleteDialog" title="操作提示" width="30%">
      <span>删除后不可恢复，是否确定删除 ？</span>
      <template #footer>
        <el-button @click="x.showDeleteDialog = false">取消</el-button>
        <el-button type="primary" :loading="x.btnState.isLoading" @click="doDeleteGroup">确定</el-button>
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
  groupInfo: {},
  hostList: []
})

onMounted(() => {
  search()
  loadHostList()
})

function loadHostList() {
  httpUtil.get(serverPaths.hostAll, null, function (data) {
    x.hostList = data
  })
}

function pageChanged(page) {
  let params = x.searchItems
  params.page = page
  params.pageSize = x.defaultPageSize
  httpUtil.get(serverPaths.groupList, params, function (resData) {
    x.currentPage = page
    x.total = resData.total
    if (resData && resData.list) {
      let rows = []
      resData.list.forEach(function (item) {
        let row = {}
        row.id = item.id
        row.name = item.name
        row.count = item.hostList ? item.hostList.length : 0
        row.hostIds = []
        if (item.hostList) {
          let ids = []
          for (const h of item.hostList) {
            ids.push(h.id)
          }
          row.hostIds = ids
        }
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
  x.groupInfo = {
    port: 0,
    sortNum: 0
  }
  x.showAddDialog = true
}

function doAddGroup() {
  x.btnState.loading()
  httpUtil.post(serverPaths.groupAdd, x.groupInfo, function () {
    x.btnState.unLoading()
    x.showAddDialog = false
    uiUtils.showToast("success", "添加成功")
    pageChanged(x.currentPage)
  }, () => {
    x.btnState.unLoading()
  })
}

function updateDialog(group) {
  x.groupInfo = JSON.parse(JSON.stringify(group))
  x.showUpdateDialog = true
}

function doUpdateGroup() {
  x.btnState.loading()
  httpUtil.put(serverPaths.groupUpdate(x.groupInfo.id), x.groupInfo, function () {
    x.btnState.unLoading()
    x.showUpdateDialog = false
    uiUtils.showToast("success", "修改成功")
    pageChanged(x.currentPage)
  }, () => {
    x.btnState.unLoading()
  })
}

function deleteDialog(group) {
  x.groupInfo = JSON.parse(JSON.stringify(group))
  x.showDeleteDialog = true
}

function doDeleteGroup() {
  x.btnState.loading()
  httpUtil.delete(serverPaths.groupDelete(x.groupInfo.id), null, function () {
    x.btnState.unLoading()
    x.showDeleteDialog = false
    uiUtils.showToast("success", "删除成功")
    pageChanged(x.currentPage)
  }, () => {
    x.btnState.unLoading()
  })
}

</script>
<style scoped src="../../../assets/css/devops/group.css">

</style>