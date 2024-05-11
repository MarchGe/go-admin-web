<template>
  <div class="container">
    <div class="left">
      <div class="l_header">
        <div class="btns">
          <el-button type="primary" size="small" icon="Plus" :disabled="!hasPermission('menu:add')" @click="addMenu">新增</el-button>
          <span v-if="x.alreadyAddStatus" class="add_hint">已经处于新增模式 →</span>
        </div>
        <div class="ops">
          <div class="icon refresh" @click="refresh">
            <el-icon :class="x.isRefreshing ? 'is-loading' : ''" color="#8a8a8a" size="medium">
              <Refresh/>
            </el-icon>
          </div>
        </div>
      </div>
      <el-tree :data="x.menuTree" :props="x.defaultProps" node-key="id" :default-expanded-keys="x.expandedKeys" :render-after-expand="false" @nodeExpand="menuExpand" @nodeCollapse="menuCollapse" @nodeClick="treeItemClick">
        <template #default="{node, data}">
          <div class="m-item">
            <span class="i-left">
              <span class="icon"><i :class="'iconfont icon-' + data.icon"></i></span>
              <span class="label">{{ node.label }}</span>
            </span>
            <span v-if="hasPermission('menu:delete')" @click.stop="openDeleteMenuDialog(data)">
              <i :class="'iconfont icon-shanchu'" style="font-size: 12px; color: #a8a8a8;"></i>
            </span>
          </div>
        </template>
      </el-tree>
    </div>
    <div style="width: 10px;"></div>
    <div class="right">
      <div class="status_v" :class="x.isAddState ? 'add_mode' : 'update_mode'">
        <span class="cur_txt">模式：</span>
        <span v-if="x.isAddState" class="add">新增</span>
        <span v-else class="update">编辑</span>
        <span v-if="!x.isAddState" class="update_hint">（提示：修改 "权限标识" 后，需要重新分配权限才能生效）</span>
      </div>
      <div class="row">
        <div class="label _required">父级菜单</div>
        <div class="value">
          <el-tree-select class="v" placeholder="选择父菜单" v-model="x.rowData.parentId" value-key="id" check-strictly :data="x.rootedMenuTree" :props="x.defaultProps" :default-expanded-keys="[0]" accordion :render-after-expand="false"></el-tree-select>
        </div>
      </div>
      <div class="row">
        <div class="label _required">菜单名称</div>
        <div class="value">
          <el-input class="v" v-model="x.rowData.name" placeholder="输入菜单名称" maxlength="20"></el-input>
        </div>
      </div>
      <div class="row">
        <div class="label">菜单图标</div>
        <div class="value" @click="showIconsDialog">
          <el-input class="v" v-model="x.rowData.icon" placeholder="选择图标" maxlength="50">
            <template #prepend>
              <i :class="'iconfont icon-' + (x.rowData.icon ? x.rowData.icon : 'search')"></i>
            </template>
          </el-input>
        </div>
      </div>
      <div class="row" v-if="x.rowData.external !== 1">
        <div class="label">权限标识</div>
        <div class="value">
          <el-input class="v" v-model="x.rowData.symbol" placeholder="示例：menu:read" maxlength="50"></el-input>
        </div>
      </div>
      <div class="row" v-if="x.rowData.external === 1">
        <div class="label">打开方式</div>
        <div class="value">
          <el-radio-group v-model="x.rowData.externalWay">
            <el-radio :value="1">内嵌</el-radio>
            <el-radio :value="0">外联</el-radio>
          </el-radio-group>
        </div>
      </div>
      <div class="row">
        <div class="label">访问路径</div>
        <div class="value">
          <el-input class="v" v-model="x.rowData.url" placeholder="示例：/sys/user 或 http(s)://www.example.com..." maxlength="50"></el-input>
        </div>
      </div>
      <div class="row">
        <div class="label">菜单排序</div>
        <div class="value">
          <el-input-number class="v v-sort" v-model="x.rowData.sortNum" :min="0"></el-input-number>
        </div>
      </div>
      <div class="row">
        <div class="label">是否可见</div>
        <div class="value">
          <el-radio-group v-model="x.rowData.display">
            <el-radio :value="1">是</el-radio>
            <el-radio :value="0">否</el-radio>
          </el-radio-group>
        </div>
        <div class="label">是否外链</div>
        <div class="value">
          <el-radio-group v-model="x.rowData.external">
            <el-radio :value="1">是</el-radio>
            <el-radio :value="0">否</el-radio>
          </el-radio-group>
        </div>
      </div>
      <div class="row btn_row">
        <div class="blank"></div>
        <div v-if="x.isAddState" class="btn_v">
          <el-button class="btn" type="primary" :disabled="!hasPermission('menu:add')" :loading="x.btnState.isLoading" @click="doAddMenu">新增</el-button>
        </div>
        <div v-else class="btn_v">
          <el-button class="btn" type="warning" :disabled="!hasPermission('menu:update')" :loading="x.btnState.isLoading" @click="doUpdateMenu">保存</el-button>
        </div>
        <div class="blank"></div>
      </div>
    </div>
    <!--图标列表-->
    <el-dialog v-model="x.showIcons" width="60%">
      <div class="icons_dialog">
        <div :class="'icon ' + (icon.value===x.iconSelected ? 'icon-selected' : '')" v-for="icon in x.icons" :key="icon.id" @click="selectIcon(icon)">
          <i :class="'iconfont icon-' + icon.value"></i></div>
      </div>
    </el-dialog>
    <!--删除弹框-->
    <el-dialog v-model="x.showDeleteMenuDialog" title="操作提示" width="30%">
      <span>确定删除菜单【{{ x.deletingMenu.name }}】吗？</span>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="x.showDeleteMenuDialog = false">取消</el-button>
          <el-button type="primary" :loading="x.btnState.isLoading" @click="doDeleteMenu">确认</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import {onMounted, reactive} from "vue";
import {hasPermission} from "@/utils/permissions"
import httpUtils from "@/utils/http-utils";
import {serverPaths} from "@/settings";
import uiUtils from "@/utils/ui-utils";

const defaultRowData = {
  parentId: 0,
  display: 0,
  sortNum: 0,
  external: 0,
  externalWay: 0
}
const x = reactive({
  defaultProps: {
    label: "name",
    children: "children"
  },
  expandedKeys: [],
  isAddState: true,
  alreadyAddStatus: false,
  isRefreshing: false,
  showIcons: false,
  showDeleteMenuDialog: false,
  deletingMenu: {},
  iconSelected: "",
  menuTree: [],
  rootedMenuTree: [],
  icons: [],
  rowData: JSON.parse(JSON.stringify(defaultRowData)),
  btnState: uiUtils.buttonState()
})
onMounted(() => {
  loadMenuTree()
  loadIcons()
})

function loadMenuTree(completeCallback) {
  httpUtils.get(serverPaths.menuTree, null, function (data) {
    x.menuTree = data
    x.rootedMenuTree = [{
      id: 0,
      name: "顶层菜单",
      children: x.menuTree
    }]
    if (completeCallback) {
      completeCallback()
    }
  })
}

function menuExpand(rowData) {
  x.expandedKeys.push(rowData.id)
}

function menuCollapse(rowData) {
  for (let i = 0; i < x.expandedKeys.length; i++) {
    if (x.expandedKeys[i] === rowData.id) {
      x.expandedKeys.splice(i, 1)
      return
    }
  }
}

function refresh() {
  if (x.isRefreshing) {
    return
  }
  x.isRefreshing = true
  loadMenuTree(function () {
    x.isRefreshing = false
    uiUtils.showToast("success", "刷新成功")
  })
}

function treeItemClick(rowData) {
  if (x.rowData.id === rowData.id) {
    return
  }
  x.rowData = JSON.parse(JSON.stringify(rowData))
  delete x.rowData.children
  x.iconSelected = x.rowData.icon
  x.isAddState = false
  x.alreadyAddStatus = false
}

function loadIcons() {
  httpUtils.get(serverPaths.iconAll, null, function (data) {
    x.icons = data
  })
}

function showIconsDialog() {
  if (!x.showIcons) {
    x.showIcons = true
  }
}

function selectIcon(icon) {
  x.iconSelected = icon.value
  x.rowData.icon = icon.value
  x.showIcons = false
}

function addMenu() {
  if (x.isAddState) {
    x.alreadyAddStatus = true
  }
  x.isAddState = true
  x.rowData = JSON.parse(JSON.stringify(defaultRowData))
}

function doAddMenu() {
  x.btnState.loading()
  httpUtils.post(serverPaths.menuAdd, x.rowData, function () {
    x.btnState.unLoading()
    uiUtils.showToast("success", "添加成功")
    loadMenuTree()
    x.rowData = JSON.parse(JSON.stringify(defaultRowData))
  }, () => {
    x.btnState.unLoading()
  })
}

function doUpdateMenu() {
  x.btnState.loading()
  httpUtils.put(serverPaths.menuUpdate(x.rowData.id), x.rowData, function () {
    x.btnState.unLoading()
    uiUtils.showToast("success", "修改成功")
    loadMenuTree()
  }, () => {
    x.btnState.unLoading()
  })
}

function openDeleteMenuDialog(data) {
  x.showDeleteMenuDialog = true
  x.deletingMenu = data
}

function doDeleteMenu() {
  x.btnState.loading()
  httpUtils.delete(serverPaths.menuDelete(x.deletingMenu.id), null, function () {
    x.btnState.unLoading()
    x.showDeleteMenuDialog = false
    uiUtils.showToast("success", "删除成功")
    loadMenuTree()
  }, () => {
    x.btnState.unLoading()
  })
}
</script>

<style scoped src="../../../assets/css/sys/menu.css">

</style>