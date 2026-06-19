<template>
  <div>
    <!--搜索栏-->
    <div class="search_head">
      <el-input class="item" type="text" v-model="x.searchItems.keyword" maxlength="20" clearable style="width: 260px; margin-right: 15px;">
        <template #prepend>关键字</template>
      </el-input>
      <el-button type="primary" icon="Search" @click="search">搜索</el-button>
      <el-button type="primary" icon="Plus" :disabled="!hasPermission('dept:add')" @click="addDialog">新增</el-button>
    </div>
    <!--表格数据-->
    <el-table :data="x.deptTree" :stripe="true" row-key="id" :tree-props="{children: 'children'}" :show-overflow-tooltip="true" :tooltip-options="{'popper-class': 'tooltip', 'enterable': false}" empty-text="暂无数据">
      <el-table-column label="名称" prop="name" header-align="center" align="center"></el-table-column>
      <el-table-column label="创建时间" prop="createTime" header-align="center" align="center"></el-table-column>
      <el-table-column fixed="right" label="操作" header-align="center" align="center" width="160px">
        <template #default="scope">
          <el-button type="warning" size="small" :disabled="!hasPermission('dept:update')" @click="updateDialog(scope.row)">编辑</el-button>
          <el-button type="danger" size="small" :disabled="!hasPermission('dept:delete')" @click="deleteDialog(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div style="height: 40px;"></div>
    <upsert-dialog v-model="x.showUpsertDialog" :mode="x.upsertMode" :data="x.deptInfo" :all-dept="x.allDept" @success="onUpsertSuccess"/>
    <!--删除弹框-->
    <el-dialog v-model="x.showDeleteDialog" title="操作提示" width="30%">
      <span>删除部门后不可恢复，是否确定删除 ？</span>
      <template #footer>
        <el-button @click="x.showDeleteDialog = false">取消</el-button>
        <el-button type="primary" :loading="x.btnState.isLoading" @click="doDeleteDept">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import {onMounted, reactive} from "vue"
import {hasPermission} from "@/utils/permissions"
import httpUtils from "@/utils/http-utils"
import uiUtils from "@/utils/ui-utils"
import moment from "moment"
import {serverPaths} from "@/settings"
import UpsertDialog from "./component/upsert-dialog.vue"

const defaultRowData = {
  parentId: 0,
  sortNum: 0
}
const x = reactive({
  btnState: uiUtils.buttonState(),
  searchItems: {
    keyword: ""
  },
  showUpsertDialog: false,
  upsertMode: "add",
  showDeleteDialog: false,
  deptInfo: JSON.parse(JSON.stringify(defaultRowData)),
  deptTree: [],
  allDept: [{
    id: 0,
    name: "顶级部门",
    children: []
  }]
})

onMounted(() => {
  loadDeptTree()
  search()
})

function loadDeptTree() {
  httpUtils.get(serverPaths.deptTree, null, function (data) {
    x.allDept[0].children = data
  })
}
function search() {
  let params = x.searchItems
  httpUtils.get(serverPaths.deptTree, params, function (data) {
    if (data && data.length > 0) {
      recursiveProcessData(data)
    }
      x.deptTree = data
  })
}

function recursiveProcessData(deptTree) {
  for (let dept of deptTree) {
    dept.createTime = moment(dept.createTime).format("YYYY-MM-DD HH:mm:ss")
    dept.updateTime = moment(dept.updateTime).format("YYYY-MM-DD HH:mm:ss")
    if (dept.children && dept.children.length > 0) {
      recursiveProcessData(dept.children)
    }
  }
}

function addDialog() {
  x.deptInfo = JSON.parse(JSON.stringify(defaultRowData))
  x.upsertMode = "add"
  x.showUpsertDialog = true
}

function updateDialog(dept) {
  x.deptInfo = JSON.parse(JSON.stringify(dept))
  x.upsertMode = "update"
  x.showUpsertDialog = true
}

function onUpsertSuccess() {
  loadDeptTree()
  search()
}

function deleteDialog(dept) {
  x.deptInfo = JSON.parse(JSON.stringify(dept))
  x.showDeleteDialog = true
}

function doDeleteDept() {
  x.btnState.loading()
  httpUtils.delete(serverPaths.deptDelete(x.deptInfo.id), null, function () {
    x.btnState.unLoading()
    x.showDeleteDialog = false
    uiUtils.showToast("success", "删除成功")
    loadDeptTree()
    search()
  }, () => {
    x.btnState.unLoading()
  })
}

</script>
<style scoped src="../../../assets/css/sys/dept.css">

</style>