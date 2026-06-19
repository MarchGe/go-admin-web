<template>
  <div>
    <!--搜索栏-->
    <div class="search_head">
      <el-input class="item" type="text" v-model="x.searchItems.keyword" maxlength="20" clearable style="width: 260px; margin-right: 15px;">
        <template #prepend>关键字</template>
      </el-input>
      <el-button type="primary" icon="Search" @click="search(1)">搜索</el-button>
      <el-button type="primary" icon="Plus" :disabled="!hasPermission('role:add')" @click="addDialog">新增</el-button>
    </div>
    <!--表格数据-->
    <el-table :data="x.tableData" :stripe="true" :show-overflow-tooltip="true" :tooltip-options="{'popper-class': 'tooltip', 'enterable': false}" empty-text="暂无数据">
      <el-table-column label="名称" prop="name" header-align="center" align="center"></el-table-column>
      <el-table-column label="创建时间" prop="createTime" header-align="center" align="center"></el-table-column>
      <el-table-column fixed="right" label="操作" header-align="center" align="center" width="240px">
        <template #default="scope">
          <el-button type="warning" size="small" :disabled="!hasPermission('role:update')" @click="updateDialog(scope.row)">编辑</el-button>
          <el-button type="danger" size="small" :disabled="!hasPermission('role:delete')" @click="deleteDialog(scope.row)">删除</el-button>
          <el-button type="primary" size="small" :disabled="!hasPermission('role:menus')" @click="assignPermissionDialog(scope.row)">分配权限</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination class="pagination" :default-page-size="x.defaultPageSize" v-model:current-page="x.currentPage" background :total="x.total" layout="prev, pager, next" @update:current-page="search"></el-pagination>
    <!--新增/编辑弹框-->
    <upsert-dialog v-model="x.showUpsertDialog" :mode="x.upsertMode" :data="x.roleInfo" @success="search(x.currentPage)"></upsert-dialog>
    <!--删除弹框-->
    <el-dialog v-model="x.showDeleteDialog" title="操作提示" width="30%">
      <span>删除角色后，与该角色关联的权限关系也会被清除，是否确定删除 ？</span>
      <template #footer>
        <el-button @click="x.showDeleteDialog = false">取消</el-button>
        <el-button type="primary" :loading="x.btnState.isLoading" @click="doDeleteRole">确定</el-button>
      </template>
    </el-dialog>
    <!--分配权限弹框-->
    <distribute-privileges v-model="x.showAssignPermissionDialog" :menu-tree="x.menuTree" :target-info="x.roleInfo" :submit-url="serverPaths.roleMenu(x.roleInfo.id)" @success="onAssignPermissionSuccess"></distribute-privileges>
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
import DistributePrivileges from "../component/distribute-privileges.vue"
import httpUtils from "@/utils/http-utils"

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
  upsertMode: "add",
  showDeleteDialog: false,
  roleInfo: {},
  showAssignPermissionDialog: false,
  menuTree: []
})

onMounted(() => {
  search(1)
  loadMenuTree()
})

function loadMenuTree() {
  httpUtils.get(serverPaths.menuTree, null, function (data) {
    x.menuTree = data
  })
}

function search(page) {
  let params = x.searchItems
  params.page = page
  params.pageSize = x.defaultPageSize
  httpUtil.get(serverPaths.roleList, params, function (resData) {
    x.currentPage = page
    x.total = resData.total
    if (resData && resData.list) {
      let rows = []
      resData.list.forEach(function (item) {
        let row = {}
        row.id = item.id
        row.name = item.name
        row.sortNum = item.sortNum
        let menuIds = []
        for (let menu of item.menuList) {
          menuIds.push(menu.id)
        }
        row.menuIds = menuIds
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

function addDialog() {
  x.roleInfo = {
    sortNum: 0
  }
  x.upsertMode = "add"
  x.showUpsertDialog = true
}

function updateDialog(role) {
  x.roleInfo = JSON.parse(JSON.stringify(role))
  x.upsertMode = "update"
  x.showUpsertDialog = true
}

function deleteDialog(role) {
  x.roleInfo = JSON.parse(JSON.stringify(role))
  x.showDeleteDialog = true
}

function doDeleteRole() {
  x.btnState.loading()
  httpUtil.delete(serverPaths.roleDelete(x.roleInfo.id), null, function () {
    x.btnState.unLoading()
    x.showDeleteDialog = false
    uiUtils.showToast("success", "删除成功")
    search(x.currentPage)
  }, () => {
    x.btnState.unLoading()
  })
}

function assignPermissionDialog(role) {
  x.roleInfo = JSON.parse(JSON.stringify(role))
  x.showAssignPermissionDialog = true
}

function onAssignPermissionSuccess(menuIds) {
  x.roleInfo.menuIds = menuIds
  search(x.currentPage)
}
</script>
<style scoped src="../../../assets/css/sys/role.css">

</style>