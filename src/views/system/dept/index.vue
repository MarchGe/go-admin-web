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
    <el-table :data="x.deptTree" :stripe="true" row-key="id" :tree-props="{children: 'children'}" empty-text="暂无数据">
      <el-table-column label="名称" prop="name" header-align="center" align="center" width="240px"></el-table-column>
      <el-table-column label="创建时间" prop="createTime" header-align="center" align="center"></el-table-column>
      <el-table-column fixed="right" label="操作" header-align="center" align="center" width="160px">
        <template #default="scope">
          <el-button type="warning" size="small" :disabled="!hasPermission('dept:update')" @click="updateDialog(scope.row)">编辑</el-button>
          <el-button type="danger" size="small" :disabled="!hasPermission('dept:delete')" @click="deleteDialog(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div style="height: 40px;"></div>
    <!--新增弹框-->
    <el-dialog class="upsert" v-model="x.showAddDialog" title="添加部门" width="35%">
      <div class="row">
        <span class="label _required">部门名称</span>
        <el-input class="value" v-model="x.deptInfo.name" placeholder="填写部门名称" maxlength="20"></el-input>
      </div>
      <div class="row">
        <span class="label">父级部门</span>
        <el-tree-select class="value" placeholder="选择父级部门" v-model="x.deptInfo.parentId" value-key="id" check-strictly :data="x.allDept" :props="x.defaultProps" :default-expanded-keys="[0]" accordion :render-after-expand="false" :filterable="true"></el-tree-select>
      </div>
      <div class="row">
        <span class="label">排序</span>
        <el-input-number class="value sort" v-model="x.deptInfo.sortNum" :min="0"></el-input-number>
      </div>
      <template #footer>
        <el-button @click="x.showAddDialog = false">取消</el-button>
        <el-button type="primary" :loading="x.btnState.isLoading" @click="doAddDept">确定</el-button>
      </template>
    </el-dialog>
    <!--编辑弹框-->
    <el-dialog class="upsert" v-model="x.showUpdateDialog" title="修改部门" width="35%">
      <div class="row">
        <span class="label _required">部门名称</span>
        <el-input class="value" v-model="x.deptInfo.name" placeholder="填写部门名称" maxlength="20"></el-input>
      </div>
      <div class="row">
        <span class="label">父级部门</span>
        <el-tree-select class="value" placeholder="选择父级部门" v-model="x.deptInfo.parentId" value-key="id" check-strictly :data="x.allDept" :props="x.defaultProps" :default-expanded-keys="[0]" accordion :render-after-expand="false" :filterable="true"></el-tree-select>
      </div>
      <div class="row">
        <span class="label">排序</span>
        <el-input-number class="value sort" v-model="x.deptInfo.sortNum" :min="0"></el-input-number>
      </div>
      <template #footer>
        <el-button @click="x.showUpdateDialog = false">取消</el-button>
        <el-button type="primary" :loading="x.btnState.isLoading" @click="doUpdateDept">确定</el-button>
      </template>
    </el-dialog>
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
import httpUtil from "@/utils/http-utils"
import uiUtils from "@/utils/ui-utils"
import moment from "moment"
import {serverPaths} from "@/settings"
import httpUtils from "@/utils/http-utils"

const defaultRowData = {
  parentId: 0,
  sortNum: 0
}
const x = reactive({
  btnState: uiUtils.buttonState(),
  searchItems: {
    keyword: ""
  },
  defaultProps: {
    label: "name",
    children: "children"
  },
  showAddDialog: false,
  showDeleteDialog: false,
  showUpdateDialog: false,
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
  x.showAddDialog = true
}

function doAddDept() {
  x.btnState.loading()
  httpUtil.post(serverPaths.deptAdd, x.deptInfo, function () {
    x.btnState.unLoading()
    x.showAddDialog = false
    uiUtils.showToast("success", "添加成功")
    loadDeptTree()
    search()
  }, () => {
    x.btnState.unLoading()
  })
}

function updateDialog(dept) {
  x.deptInfo = JSON.parse(JSON.stringify(dept))
  x.showUpdateDialog = true
}

function doUpdateDept() {
  x.btnState.loading()
  delete x.deptInfo.children
  httpUtil.put(serverPaths.deptUpdate(x.deptInfo.id), x.deptInfo, function () {
    x.btnState.unLoading()
    x.showUpdateDialog = false
    uiUtils.showToast("success", "修改成功")
    loadDeptTree()
    search()
  }, () => {
    x.btnState.unLoading()
  })
}

function deleteDialog(dept) {
  x.deptInfo = JSON.parse(JSON.stringify(dept))
  x.showDeleteDialog = true
}

function doDeleteDept() {
  x.btnState.loading()
  httpUtil.delete(serverPaths.deptDelete(x.deptInfo.id), null, function () {
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