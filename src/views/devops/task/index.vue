<template>
  <div>
    <!--搜索栏-->
    <div class="search_head">
      <el-input class="item" type="text" v-model="x.searchItems.keyword" maxlength="20" clearable style="width: 260px; margin-right: 15px;">
        <template #prepend>关键字</template>
      </el-input>
      <el-button type="primary" icon="Search" @click="search">搜索</el-button>
      <el-button type="primary" icon="Plus" :disabled="!hasPermission('task:add')" @click="addDialog">新增</el-button>
    </div>
    <!--表格数据-->
    <el-table :data="x.tableData" :stripe="true" :show-overflow-tooltip="true" :tooltip-options="{'popper-class': 'tooltip', 'enterable': false}" empty-text="暂无数据">
      <el-table-column label="名称" prop="name" header-align="center" align="center" min-width="200px"></el-table-column>
      <el-table-column label="任务类型" prop="typeText" header-align="center" align="center"></el-table-column>
      <el-table-column label="状态" prop="statusText" header-align="center" align="center"></el-table-column>
      <el-table-column label="创建时间" prop="createTime" header-align="center" align="center" width="180px"></el-table-column>
      <el-table-column fixed="right" label="操作" header-align="center" align="center" width="280px">
        <template #default="scope">
          <el-button v-if="scope.row.status !== 1" type="primary" size="small" :disabled="!hasPermission('task:start')" @click="startTaskDialog(scope.row)">启动</el-button>
          <el-button v-else type="danger" size="small" :disabled="!hasPermission('task:stop')" @click="stopTaskDialog(scope.row)">停止</el-button>
          <el-button type="warning" size="small" :disabled="!hasPermission('task:update')" @click="updateDialog(scope.row)">编辑</el-button>
          <el-button type="danger" size="small" :disabled="!hasPermission('task:delete')" @click="deleteDialog(scope.row)">删除</el-button>
          <el-button type="info" size="small" :disabled="!hasPermission('task:log')" @click="manifestEntriesDialog(scope.row)">日志</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination class="pagination" :default-page-size="x.defaultPageSize" v-model:current-page="x.currentPage" background :total="x.total" layout="prev, pager, next" @update:current-page="pageChanged"></el-pagination>
    <!--新增弹框-->
    <el-dialog class="upsert" v-model="x.showAddDialog" title="添加任务" width="35%">
      <div class="row">
        <span class="label _required">名称</span>
        <el-input class="value" v-model="x.taskInfo.name" placeholder="填写名称" maxlength="50"></el-input>
      </div>
      <div class="row">
        <span class="label _required">任务类型</span>
        <div class="value">
          <el-select v-model="x.taskInfo.type" placeholder="选择任务类型" @change="onTaskTypeChange">
            <el-option v-for="item in x.taskTypeList" :key="item.value" :label="item.name" :value="item.value"></el-option>
          </el-select>
        </div>
      </div>
      <div class="row" v-if="x.selectedTaskType !== 1">
        <span class="label">Cron</span>
        <el-input class="value" v-model="x.taskInfo.cron" placeholder="填写Cron表达式" maxlength="50"></el-input>
      </div>
      <div class="row" v-if="x.selectedTaskType === 1">
        <span class="label _required">上传路径</span>
        <el-input class="value" v-model="x.taskInfo.concrete.uploadPath" placeholder="填写上传路径（部署包会上传到该目录）" maxlength="100"></el-input>
      </div>
      <div class="row" v-if="x.selectedTaskType === 1">
        <span class="label _required">应用</span>
        <div class="value">
          <el-select v-model="x.taskInfo.concrete.appId" placeholder="选择应用" :filterable="true">
            <el-option v-for="item in x.appList" :key="item.id" :label="item.name + '/' + item.version" :value="item.id"></el-option>
          </el-select>
        </div>
      </div>
      <div class="row" v-if="x.selectedTaskType === 1">
        <span class="label _required">部署脚本</span>
        <div class="value">
          <el-select v-model="x.taskInfo.concrete.scriptId" placeholder="选择部署脚本" :filterable="true">
            <el-option v-for="item in x.scriptList" :key="item.id" :label="item.name + '/' + item.version" :value="item.id"></el-option>
          </el-select>
        </div>
      </div>
      <div class="row" v-if="x.selectedTaskType === 1">
        <span class="label _required">服务器组</span>
        <div class="value">
          <el-select v-model="x.taskInfo.concrete.hostGroupId" placeholder="选择服务器组" :filterable="true">
            <el-option v-for="item in x.hostGroupList" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </div>
      </div>
      <template #footer>
        <el-button @click="x.showAddDialog = false">取消</el-button>
        <el-button type="primary" :loading="x.btnState.isLoading" @click="doAddTask">确定</el-button>
      </template>
    </el-dialog>
    <!--编辑弹框-->
    <el-dialog class="upsert" v-model="x.showUpdateDialog" title="修改任务" width="35%">
      <div class="row">
        <span class="label _required">名称</span>
        <el-input class="value" v-model="x.taskInfo.name" placeholder="填写名称" maxlength="50"></el-input>
      </div>
      <div class="row">
        <span class="label _required">任务类型</span>
        <div class="value">
          <el-select v-model="x.taskInfo.type" placeholder="选择任务类型" @change="onTaskTypeChange">
            <el-option v-for="item in x.taskTypeList" :key="item.value" :label="item.name" :value="item.value"></el-option>
          </el-select>
        </div>
      </div>
      <div class="row" v-if="x.selectedTaskType !== 1">
        <span class="label">Cron</span>
        <el-input class="value" v-model="x.taskInfo.cron" placeholder="填写Cron表达式" maxlength="50"></el-input>
      </div>
      <div class="row" v-if="x.selectedTaskType === 1">
        <span class="label _required">上传路径</span>
        <el-input class="value" v-model="x.taskInfo.concrete.uploadPath" placeholder="填写上传路径（部署包会上传到该目录）" maxlength="100"></el-input>
      </div>
      <div class="row" v-if="x.selectedTaskType === 1">
        <span class="label _required">应用</span>
        <div class="value">
          <el-select v-model="x.taskInfo.concrete.appId" placeholder="选择应用" :filterable="true">
            <el-option v-for="item in x.appList" :key="item.id" :label="item.name + '/' + item.version" :value="item.id"></el-option>
          </el-select>
        </div>
      </div>
      <div class="row" v-if="x.selectedTaskType === 1">
        <span class="label _required">部署脚本</span>
        <div class="value">
          <el-select v-model="x.taskInfo.concrete.scriptId" placeholder="选择部署脚本" :filterable="true">
            <el-option v-for="item in x.scriptList" :key="item.id" :label="item.name + '/' + item.version" :value="item.id"></el-option>
          </el-select>
        </div>
      </div>
      <div class="row" v-if="x.selectedTaskType === 1">
        <span class="label _required">服务器组</span>
        <div class="value">
          <el-select v-model="x.taskInfo.concrete.hostGroupId" placeholder="选择服务器组" :filterable="true">
            <el-option v-for="item in x.hostGroupList" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </div>
      </div>
      <template #footer>
        <el-button @click="x.showUpdateDialog = false">取消</el-button>
        <el-button type="primary" :loading="x.btnState.isLoading" @click="doUpdateTask">确定</el-button>
      </template>
    </el-dialog>
    <!--删除弹框-->
    <el-dialog v-model="x.showDeleteDialog" title="操作提示" width="30%">
      <span>删除后不可恢复，是否确定删除 ？</span>
      <template #footer>
        <el-button @click="x.showDeleteDialog = false">取消</el-button>
        <el-button type="primary" :loading="x.btnState.isLoading" @click="doDeleteTask">确定</el-button>
      </template>
    </el-dialog>
    <!--启动任务弹框-->
    <el-dialog v-model="x.showStartTaskDialog" title="启动任务" width="30%">
      <span>确定启动任务吗 ？</span>
      <template #footer>
        <el-button @click="x.showStartTaskDialog = false">取消</el-button>
        <el-button type="primary" :loading="x.btnState.isLoading" @click="doStartTask">确定</el-button>
      </template>
    </el-dialog>
    <!--停止任务弹框-->
    <el-dialog v-model="x.showStopTaskDialog" title="停止任务" width="30%">
      <span>确定停止任务吗 ？</span>
      <template #footer>
        <el-button @click="x.showStopTaskDialog = false">取消</el-button>
        <el-button type="primary" :loading="x.btnState.isLoading" @click="doStopTask">确定</el-button>
      </template>
    </el-dialog>
    <!--任务日志清单条目弹框-->
    <el-dialog v-model="x.showManifestEntriesDialog" title="任务日志" :close-on-click-modal="false" :close-on-press-escape="false" @close="closeManifestConn" width="60%">
      <el-table :data="x.manifestEntries" :stripe="true" empty-text="正在处理，请稍等...">
        <el-table-column label="序号" prop="index" header-align="center" align="center" width="70px"></el-table-column>
        <el-table-column label="主机" prop="host" header-align="center" align="center" width="180px"></el-table-column>
        <el-table-column label="状态" prop="status" header-align="center" align="center"></el-table-column>
        <el-table-column label="时间" prop="time" header-align="center" align="center" width="180px"></el-table-column>
        <el-table-column fixed="right" label="操作" header-align="center" align="center" width="140px">
          <template #default="scope">
            <el-button type="primary" size="small" @click="logDialog(scope.row)">查看日志</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination class="pagination" :default-page-size="x.defaultPageSize" v-model:current-page="x.currentPage" background :total="x.total" layout="prev, pager, next" @update:current-page="pageChanged"></el-pagination>
      <template #footer></template>
    </el-dialog>
    <!--任务主机日志弹框-->
    <el-dialog v-model="x.showLogDialog" title="日志记录" top="5vh" :close-on-click-modal="false" :close-on-press-escape="false" width="60%">
      <div>
        <pre style="white-space: pre-wrap;">{{x.hostLog.join("\r\n")}}</pre>
      </div>
      <template #footer></template>
    </el-dialog>
  </div>
</template>
<script setup>
import {onBeforeUnmount, onMounted, reactive} from "vue"
import {hasPermission} from "@/utils/permissions"
import httpUtil from "@/utils/http-utils"
import uiUtils from "@/utils/ui-utils"
import moment from "moment"
import {serverPaths, configSettings} from "@/settings"
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
  showStartTaskDialog: false,
  showStopTaskDialog: false,
  showManifestEntriesDialog: false,
  showLogDialog: false,
  taskInfo: {
    concrete: {}
  },
  taskTypeList: [
    {
      name: "部署任务",
      value: 1
    }
  ],
  selectedTaskType: 0,
  appList: [],
  scriptList: [],
  hostGroupList: [],
  manifestEntries: [],
  hostLog: []
})

onMounted(() => {
  search()
  loadAppList()
  loadScriptList()
  loadHostGroupList()
  sseConnect()
})

function loadAppList() {
  if (x.appList.length !== 0) {
    return
  }
  let params = {
    page: 1,
    pageSize: configSettings.appListMaxPageSize
  }
  httpUtil.get(serverPaths.appList, params, function (data) {
    x.appList = data.list
  })
}

function loadScriptList() {
  if (x.scriptList.length !== 0) {
    return
  }
  let params = {
    page: 1,
    pageSize: configSettings.scriptListMaxPageSize
  }
  httpUtil.get(serverPaths.scriptList, params, function (data) {
    x.scriptList = data.list
  })
}

function loadHostGroupList() {
  if (x.hostGroupList.length !== 0) {
    return
  }
  let params = {
    page: 1,
    pageSize: configSettings.hostGroupListMaxPageSize
  }
  httpUtil.get(serverPaths.groupList, params, function (data) {
    x.hostGroupList = data.list
  })
}

let eventSource
function sseConnect() {
  eventSource = new EventSource(serverPaths.ssePush)
  eventSource.addEventListener("ERROR", function (e) {
    uiUtils.showToast("error", e.data)
  })
  eventSource.addEventListener("TASK_EXECUTE_END", function (e) {
    uiUtils.showToast("success", e.data)
    search()
  })
  eventSource.addEventListener("TASK_EXECUTE_FAIL", function (e) {
    uiUtils.showToast("error", e.data)
    search()
  })
  eventSource.onerror = function (e) {
    console.error(e, "SSE连接断开")
    uiUtils.showToast("error", "SSE连接断开")
    eventSource.close()
  }
}

function closeEventSourceConn() {
  if (eventSource) {
    eventSource.close()
  }
}

onBeforeUnmount(() => {
  closeEventSourceConn()
  closeManifestConn()
  closeHostLogConn()
})

function pageChanged(page) {
  let params = x.searchItems
  params.page = page
  params.pageSize = x.defaultPageSize
  httpUtil.get(serverPaths.taskList, params, function (resData) {
    x.currentPage = page
    x.total = resData.total
    if (resData && resData.list) {
      let rows = []
      resData.list.forEach(function (item) {
        let row = {}
        row.id = item.id
        row.name = item.name
        row.type = item.type
        row.cron = item.cron
        row.concrete = {}
        if (item.type === 1) {
          row.typeText = "部署任务"
          row.concrete.uploadPath = item.concrete.uploadPath
          row.concrete.appId = item.concrete.appId
          row.concrete.scriptId = item.concrete.scriptId
          row.concrete.hostGroupId = item.concrete.hostGroupId
        }
        row.status = item.status
        if (item.status === 0) {
          row.statusText = "未运行"
        } else if (item.status === 1) {
          row.statusText = "运行中"
        } else  if (item.status === 2) {
          row.statusText = "已完成"
        } else  if (item.status === 3) {
          row.statusText = "已停止"
        }
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
  x.taskInfo = {
    concrete: {}
  }
  x.selectedTaskType = 0
  x.showAddDialog = true
}

function doAddTask() {
  x.btnState.loading()
  httpUtil.post(serverPaths.taskAdd, x.taskInfo, function () {
    x.btnState.unLoading()
    x.showAddDialog = false
    uiUtils.showToast("success", "添加成功")
    pageChanged(x.currentPage)
  }, () => {
    x.btnState.unLoading()
  })
}

function updateDialog(task) {
  x.taskInfo = JSON.parse(JSON.stringify(task))
  x.selectedTaskType = x.taskInfo.type
  x.showUpdateDialog = true
}

function doUpdateTask() {
  x.btnState.loading()
  httpUtil.put(serverPaths.taskUpdate(x.taskInfo.id), x.taskInfo, function () {
    x.btnState.unLoading()
    x.showUpdateDialog = false
    uiUtils.showToast("success", "修改成功")
    pageChanged(x.currentPage)
  }, () => {
    x.btnState.unLoading()
  })
}

function deleteDialog(task) {
  x.taskInfo = JSON.parse(JSON.stringify(task))
  x.showDeleteDialog = true
}

function doDeleteTask() {
  x.btnState.loading()
  httpUtil.delete(serverPaths.taskDelete(x.taskInfo.id), null, function () {
    x.btnState.unLoading()
    x.showDeleteDialog = false
    uiUtils.showToast("success", "删除成功")
    pageChanged(x.currentPage)
  }, () => {
    x.btnState.unLoading()
  })
}

function onTaskTypeChange(value) {
  x.selectedTaskType = value
}

function startTaskDialog(task) {
  x.taskInfo = JSON.parse(JSON.stringify(task))
  x.selectedTaskType = x.taskInfo.type
  x.showStartTaskDialog = true
}

function doStartTask() {
  x.btnState.loading()
  x.manifestEntries = []
  httpUtil.post(serverPaths.taskStart(x.taskInfo.id), null, function () {
    x.btnState.unLoading()
    x.showStartTaskDialog = false
    uiUtils.showToast("success", "启动成功")
    pageChanged(x.currentPage)
  }, () => {
    x.btnState.unLoading()
  })
}

function stopTaskDialog(task) {
  x.taskInfo = JSON.parse(JSON.stringify(task))
  x.selectedTaskType = x.taskInfo.type
  x.showStopTaskDialog = true
}

function doStopTask() {
  x.btnState.loading()
  httpUtil.post(serverPaths.taskStop(x.taskInfo.id), null, function () {
    x.btnState.unLoading()
    x.showStopTaskDialog = false
    uiUtils.showToast("success", "停止成功")
    pageChanged(x.currentPage)
  }, () => {
    x.btnState.unLoading()
  })
}

let manifestEs
function manifestEntriesDialog(task) {
  x.taskInfo = JSON.parse(JSON.stringify(task))
  x.selectedTaskType = x.taskInfo.type
  x.showManifestEntriesDialog = true
  x.manifestEntries = []
  manifestEs = new EventSource(serverPaths.taskManifestLog(x.taskInfo.id))
  manifestEs.addEventListener("CLOSE", function () {
    manifestEs.close()
  })
  manifestEs.addEventListener("ERROR", function (e) {
    uiUtils.showToast("error", e.data)
  })
  manifestEs.addEventListener("MANIFEST_ENTRY", function (e) {
    let res = JSON.parse(e.data);
    if (x.manifestEntries.length === 0) {
      x.manifestEntries.push(res)
    } else {
      let length = x.manifestEntries.length;
      if (x.manifestEntries[length - 1].index === res.index) {
        x.manifestEntries[length - 1] = res
      } else {
        x.manifestEntries.push(res)
      }
    }
  })
  manifestEs.onerror = function (e) {
    console.error(e, "SSE连接断开")
    manifestEs.close()
  }
}

function closeManifestConn() {
  if (manifestEs) {
    manifestEs.close()
  }
}

let hostEs
function logDialog(manifestEntry) {
  x.showLogDialog = true
  x.hostLog = []
  hostEs = new EventSource(serverPaths.taskHostLog(x.taskInfo.id) + "?host=" + manifestEntry.host + "&hostLogName=" + manifestEntry.hostLogName)
  hostEs.addEventListener("CLOSE", function () {
    hostEs.close()
  })
  hostEs.addEventListener("ERROR", function (e) {
    uiUtils.showToast("error", e.data)
  })
  hostEs.addEventListener("HOST_LOG", function (e) {
    x.hostLog.push(e.data)
  })
  manifestEs.onerror = function (e) {
    console.error(e, "SSE连接断开")
    hostEs.close()
  }
}

function closeHostLogConn() {
  if (hostEs) {
    hostEs.close()
  }
}

</script>
<style scoped src="../../../assets/css/devops/task.css">
</style>