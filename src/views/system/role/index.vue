<template>
  <div>
    <!--搜索栏-->
    <div class="search_head">
      <el-input class="item" type="text" v-model="x.searchItems.keyword" maxlength="20" clearable style="width: 260px; margin-right: 15px;">
        <template #prepend>关键字</template>
      </el-input>
      <el-button type="primary" icon="Search" @click="search">搜索</el-button>
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
    <el-pagination class="pagination" :default-page-size="x.defaultPageSize" v-model:current-page="x.currentPage" background :total="x.total" layout="prev, pager, next" @update:current-page="pageChanged"></el-pagination>
    <!--新增弹框-->
    <el-dialog class="upsert" v-model="x.showAddDialog" title="添加角色" width="35%">
      <div class="row">
        <span class="label _required">角色名称</span>
        <el-input class="value" v-model="x.roleInfo.name" placeholder="填写角色名称" maxlength="20"></el-input>
      </div>
      <div class="row">
        <span class="label">排序</span>
        <el-input-number v-model="x.roleInfo.sortNum" :min="0"></el-input-number>
      </div>
      <template #footer>
        <el-button @click="x.showAddDialog = false">取消</el-button>
        <el-button type="primary" :loading="x.btnState.isLoading" @click="doAddRole">确定</el-button>
      </template>
    </el-dialog>
    <!--编辑弹框-->
    <el-dialog class="upsert" v-model="x.showUpdateDialog" title="修改角色" width="35%">
      <div class="row">
        <span class="label _required">角色名称</span>
        <el-input class="value" v-model="x.roleInfo.name" placeholder="填写角色名称" maxlength="20"></el-input>
      </div>
      <div class="row">
        <span class="label">排序</span>
        <el-input-number v-model="x.roleInfo.sortNum" :min="0"></el-input-number>
      </div>
      <template #footer>
        <el-button @click="x.showUpdateDialog = false">取消</el-button>
        <el-button type="primary" :loading="x.btnState.isLoading" @click="doUpdateRole">确定</el-button>
      </template>
    </el-dialog>
    <!--删除弹框-->
    <el-dialog v-model="x.showDeleteDialog" title="操作提示" width="30%">
      <span>删除角色后，与该角色关联的权限关系也会被清除，是否确定删除 ？</span>
      <template #footer>
        <el-button @click="x.showDeleteDialog = false">取消</el-button>
        <el-button type="primary" :loading="x.btnState.isLoading" @click="doDeleteRole">确定</el-button>
      </template>
    </el-dialog>
    <!--分配权限弹框-->
    <el-dialog v-model="x.showAssignPermissionDialog" title="分配权限" width="30%">
      <el-tree ref="permissionTree" :data="x.menuTree" node-key="id" :props="x.defaultProps" :default-checked-keys="x.roleInfo.menuIds" :render-after-expand="false" show-checkbox check-strictly @check-change="permissionsChange">
        <template #default="{node, data}">
          <div class="m-item">
            <span class="i-left">
              <span class="icon"><i :class="'iconfont icon-' + data.icon"></i></span>
              <span class="label">{{ node.label + (data.symbol ? '（' + data.symbol + '）' : '') }}</span>
            </span>
          </div>
        </template>
      </el-tree>
      <template #footer>
        <div class="foot">
          <span class="hint_v">
            <span class="txt">共选中</span>
            <span class="num">{{ x.permissionCount }}</span>
            <span class="txt">项</span>
          </span>
          <el-button @click="x.showAssignPermissionDialog = false">取消</el-button>
          <el-button type="primary" :loading="x.btnState.isLoading" @click="doAssignPermission">确定</el-button>
        </div>
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
import {serverPaths} from "@/settings"
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
  defaultProps: {
    label: "name",
    children: "children"
  },
  showAddDialog: false,
  showDeleteDialog: false,
  showUpdateDialog: false,
  roleInfo: {},
  showAssignPermissionDialog: false,
  menuTree: [],
  permissionCount: 0
})
const permissionTree = ref()

onMounted(() => {
  search()
  loadMenuTree()
})

function loadMenuTree() {
  httpUtils.get(serverPaths.menuTree, null, function (data) {
    x.menuTree = data
  })
}

function pageChanged(page) {
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

function search() {
  if (x.currentPage === 1) {
    pageChanged(1)
  } else {
    x.currentPage = 1
  }
}

function addDialog() {
  x.roleInfo = {
    sortNum: 0
  }
  x.showAddDialog = true
}

function doAddRole() {
  x.btnState.loading()
  httpUtil.post(serverPaths.roleAdd, x.roleInfo, function () {
    x.btnState.unLoading()
    x.showAddDialog = false
    uiUtils.showToast("success", "添加成功")
    pageChanged(x.currentPage)
  }, () => {
    x.btnState.unLoading()
  })
}

function updateDialog(role) {
  x.roleInfo = JSON.parse(JSON.stringify(role))
  x.showUpdateDialog = true
}

function doUpdateRole() {
  x.btnState.loading()
  httpUtil.put(serverPaths.roleUpdate(x.roleInfo.id), x.roleInfo, function () {
    x.btnState.unLoading()
    x.showUpdateDialog = false
    uiUtils.showToast("success", "修改成功")
    pageChanged(x.currentPage)
  }, () => {
    x.btnState.unLoading()
  })
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
    pageChanged(x.currentPage)
  }, () => {
    x.btnState.unLoading()
  })
}

function assignPermissionDialog(role) {
  if (permissionTree.value) {
    permissionTree.value.setCheckedKeys([])
  }
  x.roleInfo = JSON.parse(JSON.stringify(role))
  x.permissionCount = x.roleInfo.menuIds.length
  x.showAssignPermissionDialog = true
}

function doAssignPermission() {
  x.btnState.loading()
  x.roleInfo.menuIds = permissionTree.value.getCheckedKeys()
  httpUtil.put(serverPaths.roleMenu(x.roleInfo.id), {ids: x.roleInfo.menuIds}, function () {
    x.btnState.unLoading()
    x.showAssignPermissionDialog = false
    uiUtils.showToast("success", "权限分配成功")
    pageChanged(x.currentPage)
  }, () => {
    x.btnState.unLoading()
  })
}

function permissionsChange() {
  x.permissionCount = permissionTree.value.getCheckedKeys().length
}
</script>
<style scoped src="../../../assets/css/sys/role.css">

</style>