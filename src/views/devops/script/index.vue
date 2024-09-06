<template>
  <div>
    <!--搜索栏-->
    <div class="search_head">
      <el-input class="item" type="text" v-model="x.searchItems.keyword" maxlength="20" clearable style="width: 260px; margin-right: 15px;">
        <template #prepend>关键字</template>
      </el-input>
      <el-button type="primary" icon="Search" @click="search">搜索</el-button>
      <el-button type="primary" icon="Plus" :disabled="!hasPermission('script:add')" @click="addDialog">新增</el-button>
    </div>
    <!--表格数据-->
    <el-table class="table_content" :data="x.tableData" :stripe="true" :show-overflow-tooltip="true" :tooltip-options="{'popper-class': 'tooltip', 'enterable': false}" empty-text="暂无数据">
      <el-table-column type="expand" width="40px">
        <template #default="props">
          <div class="inner_content">
            <div class="label">脚本内容：</div>
            <pre class="script-code"><code>{{props.row.content}}</code></pre>
            <div class="label">使用说明：</div>
            <pre class="script-code"><code>{{props.row.description ? props.row.description : "无"}}</code></pre>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="名称" prop="name" header-align="center" align="left"></el-table-column>
      <el-table-column label="版本" prop="version" header-align="center" align="center"></el-table-column>
      <el-table-column label="创建时间" prop="createTime" header-align="center" align="center" width="180px"></el-table-column>
      <el-table-column fixed="right" label="操作" header-align="center" align="center" width="160px">
        <template #default="scope">
          <el-button type="warning" size="small" :disabled="!hasPermission('script:update')" @click="updateDialog(scope.row)">编辑</el-button>
          <el-button type="danger" size="small" :disabled="!hasPermission('script:delete')" @click="deleteDialog(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination class="pagination" :default-page-size="x.defaultPageSize" v-model:current-page="x.currentPage" background :total="x.total" layout="prev, pager, next" @update:current-page="pageChanged"></el-pagination>
    <!--新增弹框-->
    <el-dialog class="upsert" v-model="x.showAddDialog" title="添加脚本" width="50%">
      <div class="row">
        <span class="label _required">名称</span>
        <el-input class="value" v-model="x.scriptInfo.name" placeholder="填写名称" maxlength="50"></el-input>
      </div>
      <div class="row">
        <span class="label _required">版本</span>
        <el-input class="value" v-model="x.scriptInfo.version" placeholder="填写版本" maxlength="50"></el-input>
      </div>
      <div class="row">
        <span class="label _required">脚本内容</span>
        <el-input class="value" type="textarea" v-model="x.scriptInfo.content" :rows="8" placeholder="填写脚本" maxlength="10000"></el-input>
      </div>
      <div class="row">
        <span class="label">使用说明</span>
        <el-input class="value" type="textarea" v-model="x.scriptInfo.description" :rows="3" placeholder="填写使用说明" maxlength="2000"></el-input>
      </div>
      <template #footer>
        <el-button @click="x.showAddDialog = false">取消</el-button>
        <el-button type="primary" :loading="x.btnState.isLoading" @click="doAddScript">确定</el-button>
      </template>
    </el-dialog>
    <!--编辑弹框-->
    <el-dialog class="upsert" v-model="x.showUpdateDialog" title="修改脚本" width="50%">
      <div class="row">
        <span class="label _required">名称</span>
        <el-input class="value" v-model="x.scriptInfo.name" placeholder="填写名称" maxlength="50"></el-input>
      </div>
      <div class="row">
        <span class="label _required">版本</span>
        <el-input class="value" v-model="x.scriptInfo.version" placeholder="填写版本" maxlength="50"></el-input>
      </div>
      <div class="row">
        <span class="label _required">脚本内容</span>
        <el-input class="value" type="textarea" v-model="x.scriptInfo.content" :rows="8" placeholder="填写脚本" maxlength="10000"></el-input>
      </div>
      <div class="row">
        <span class="label">使用说明</span>
        <el-input class="value" type="textarea" v-model="x.scriptInfo.description" :rows="3" placeholder="填写使用说明" maxlength="2000"></el-input>
      </div>
      <template #footer>
        <el-button @click="x.showUpdateDialog = false">取消</el-button>
        <el-button type="primary" :loading="x.btnState.isLoading" @click="doUpdateScript">确定</el-button>
      </template>
    </el-dialog>
    <!--删除弹框-->
    <el-dialog v-model="x.showDeleteDialog" title="操作提示" width="30%">
      <span>删除后不可恢复，是否确定删除 ？</span>
      <template #footer>
        <el-button @click="x.showDeleteDialog = false">取消</el-button>
        <el-button type="primary" :loading="x.btnState.isLoading" @click="doDeleteScript">确定</el-button>
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
  scriptInfo: {},
})

onMounted(() => {
  search()
})

function pageChanged(page) {
  let params = x.searchItems
  params.page = page
  params.pageSize = x.defaultPageSize
  httpUtil.get(serverPaths.scriptList, params, function (resData) {
    x.currentPage = page
    x.total = resData.total
    if (resData && resData.list) {
      let rows = []
      resData.list.forEach(function (item) {
        let row = {}
        row.id = item.id
        row.name = item.name
        row.version = item.version
        row.content = item.content
        row.description = item.description
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
  x.scriptInfo = {}
  x.showAddDialog = true
}

function doAddScript() {
  x.btnState.loading()
  httpUtil.post(serverPaths.scriptAdd, x.scriptInfo, function () {
    x.btnState.unLoading()
    x.showAddDialog = false
    uiUtils.showToast("success", "添加成功")
    pageChanged(x.currentPage)
  }, () => {
    x.btnState.unLoading()
  })
}

function updateDialog(script) {
  x.scriptInfo = JSON.parse(JSON.stringify(script))
  x.showUpdateDialog = true
}

function doUpdateScript() {
  x.btnState.loading()
  httpUtil.put(serverPaths.scriptUpdate(x.scriptInfo.id), x.scriptInfo, function () {
    x.btnState.unLoading()
    x.showUpdateDialog = false
    uiUtils.showToast("success", "修改成功")
    pageChanged(x.currentPage)
  }, () => {
    x.btnState.unLoading()
  })
}

function deleteDialog(script) {
  x.scriptInfo = JSON.parse(JSON.stringify(script))
  x.showDeleteDialog = true
}

function doDeleteScript() {
  x.btnState.loading()
  httpUtil.delete(serverPaths.scriptDelete(x.scriptInfo.id), null, function () {
    x.btnState.unLoading()
    x.showDeleteDialog = false
    uiUtils.showToast("success", "删除成功")
    pageChanged(x.currentPage)
  }, () => {
    x.btnState.unLoading()
  })
}
</script>
<style scoped src="../../../assets/css/devops/script.css">
</style>