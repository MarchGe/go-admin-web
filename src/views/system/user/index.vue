<template>
  <div>
    <!--搜索栏-->
    <div class="search_head">
      <el-input class="item" type="text" v-model="x.searchItems.keyword" maxlength="20" clearable style="width: 260px;">
        <template #prepend>关键字</template>
      </el-input>
      <el-select class="item" v-model="x.searchItems.sex" placeholder=" " clearable style="width: 100px;">
        <template #prefix>性别</template>
        <el-option :value="0" label="男"></el-option>
        <el-option :value="1" label="女"></el-option>
      </el-select>
      <el-select class="item" v-model="x.searchItems.status" placeholder=" " clearable style="width: 140px;">
        <template #prefix>账号状态</template>
        <el-option :value="0" label="正常"></el-option>
        <el-option :value="1" label="禁用"></el-option>
      </el-select>
      <el-date-picker class="item" v-model="x.searchItems.dates" type="daterange" :editable="false" :unlink-panels="true" clearable start-placeholder="开始日期" end-placeholder="结束日期" style="width: 260px; margin-right: 15px;"></el-date-picker>
      <el-button type="primary" icon="Search" @click="search(1)">搜索</el-button>
      <el-button type="primary" icon="Plus" :disabled="!hasPermission('user:add')" @click="addDialog">新增</el-button>
    </div>
    <!--表格数据-->
    <el-table :data="x.tableData" :show-overflow-tooltip="true" :tooltip-options="{'popper-class': 'tooltip', 'enterable': false}" empty-text="暂无数据">
      <el-table-column label="昵称" prop="nickname" header-align="center" align="center" min-width="120px"></el-table-column>
      <el-table-column label="邮箱" prop="email" header-align="center" align="center" min-width="180px"></el-table-column>
      <el-table-column label="手机号" prop="cellphone" header-align="center" align="center" min-width="120px"></el-table-column>
      <el-table-column label="性别" prop="sexLabel" header-align="center" align="center" width="60px"></el-table-column>
      <el-table-column label="真实姓名" prop="name" header-align="center" align="center" width="100px"></el-table-column>
      <el-table-column label="账号状态" header-align="center" align="center" width="100px">
        <template #default="scope">
          <el-tag :type="scope.row.statusTagType" disable-transitions>{{ scope.row.statusLabel }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="超级用户" header-align="center" align="center" width="100px">
        <template #default="scope">
          <el-tag :type="scope.row.rootTagType" disable-transitions>{{ scope.row.rootLabel }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="createTime" header-align="center" align="center" width="180px"></el-table-column>
      <el-table-column fixed="right" label="操作" header-align="center" align="center" width="220px">
        <template #default="scope">
          <el-button type="warning" size="small" :disabled="!hasPermission('user:update')" @click="updateDialog(scope.row)">编辑</el-button>
          <el-button v-if="scope.row.status === 0" type="danger" size="small" :disabled="!hasPermission('user:disable')" @click="disableDialog(scope.row)">禁用</el-button>
          <el-button v-if="scope.row.status === 1" type="warning" size="small" :disabled="!hasPermission('user:enable')" @click="enableDialog(scope.row)">启用</el-button>
          <el-button type="primary" size="small" @click="userDetail(scope.row)">更多</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination class="pagination" :default-page-size="x.defaultPageSize" v-model:current-page="x.currentPage" background :total="x.total" layout="prev, pager, next" @update:current-page="search"></el-pagination>
    <!--用户详情弹框-->
    <UserDetail v-model="x.showUserDialog" :data="x.userInfo" @update-password="updatePasswordDialog" @reset-password="resetPasswordDialog" @delete="deleteDialog" @assign-permission="assignPermissionDialog"/>
    <!--新增/编辑弹框-->
    <UpsertDialog v-model="x.showUpsertDialog" :mode="x.upsertMode" :data="x.upsertData" :role-list="x.roleList" :dept-tree="x.deptTree" :job-list="x.jobList" @success="search(x.currentPage)"/>
    <!--禁用弹框-->
    <el-dialog v-model="x.showDisableDialog" title="操作提示" width="30%">
      <span>确定<span style="color: #FF0000;">【禁用】</span>用户：{{ x.userInfo.nickname }} ？</span>
      <template #footer>
        <el-button @click="x.showDisableDialog = false">取消</el-button>
        <el-button type="primary" :loading="x.btnState.isLoading" @click="changeUserStatusDisable">确定</el-button>
      </template>
    </el-dialog>
    <!--启用弹框-->
    <el-dialog v-model="x.showEnableDialog" title="操作提示" width="30%">
      <span>确定<span style="color: #e6a23c;">【启用】</span>用户 '{{ x.userInfo.nickname }}'？</span>
      <template #footer>
        <el-button @click="x.showEnableDialog = false">取消</el-button>
        <el-button type="primary" :loading="x.btnState.isLoading" @click="changeUserStatusEnable">确定</el-button>
      </template>
    </el-dialog>
    <!--删除弹框-->
    <el-dialog v-model="x.showDeleteDialog" title="操作提示" width="30%">
      <span>删除后不可恢复，是否确定删除？</span>
      <template #footer>
        <el-button @click="x.showDeleteDialog = false">取消</el-button>
        <el-button type="primary" :loading="x.btnState.isLoading" @click="doDeleteUser">确定</el-button>
      </template>
    </el-dialog>
    <!--重置密码弹框-->
    <el-dialog v-model="x.showResetPasswordDialog" title="操作提示" width="30%">
      <span>重置密码后，新密码将通过邮件发送给用户，是否确定重置？</span>
      <template #footer>
        <el-button @click="x.showResetPasswordDialog = false">取消</el-button>
        <el-button type="primary" :loading="x.btnState.isLoading" @click="doResetPassword">确定</el-button>
      </template>
    </el-dialog>
    <!--修改密码弹框-->
    <el-dialog v-model="x.showUpdatePasswordDialog" title="修改密码" width="30%">
      <el-input v-model="x.newPassword" placeholder="填写新密码" maxlength="30"></el-input>
      <template #footer>
        <el-button @click="x.showUpdatePasswordDialog = false">取消</el-button>
        <el-button type="primary" :loading="x.btnState.isLoading" @click="doUpdatePassword">确定</el-button>
      </template>
    </el-dialog>
    <!--分配权限弹框-->
    <distribute-privileges v-model="x.showAssignPermissionDialog" :menu-tree="x.menuTree" :target-info="x.userInfo" :submit-url="serverPaths.userMenu(x.userInfo.id)" @success="onAssignPermissionSuccess"></distribute-privileges>
  </div>
</template>
<script setup>
import {onMounted, reactive} from "vue"
import UpsertDialog from "./component/upsert-dialog.vue"
import UserDetail from "./component/user-detail.vue"
import DistributePrivileges from "../component/distribute-privileges.vue"
import {hasPermission} from "@/utils/permissions"
import uiUtils from "@/utils/ui-utils"
import moment from "moment"
import {serverPaths, configSettings} from "@/settings"
import httpUtils from "@/utils/http-utils"

const x = reactive({
  searchItems: {
    keyword: "",
    sex: null,
    status: null,
    authentication: null,
    dates: []
  },
  currentPage: 1,
  defaultPageSize: 10,
  total: 0,
  tableData: [],
  showDisableDialog: false,
  showEnableDialog: false,
  showDeleteDialog: false,
  showUserDialog: false,
  showUpsertDialog: false,
  upsertMode: "add",
  upsertData: {},
  userInfo: {},
  btnState: uiUtils.buttonState(),
  showResetPasswordDialog: false,
  showUpdatePasswordDialog: false,
  newPassword: "",
  showAssignPermissionDialog: false,
  roleList: [],
  menuTree: [],
  deptTree: [],
  jobList: []
})

onMounted(() => {
  search(1)
  loadRoleList()
  loadDeptTree()
  loadJobList()
  loadMenuTree()
})

function loadMenuTree() {
  if (x.menuTree.length !== 0) {
    return
  }
  httpUtils.get(serverPaths.menuTree, null, function (data) {
    x.menuTree = data
  })
}

function loadRoleList() {
  if (x.roleList.length !== 0) {
    return
  }
  let params = {
    page: 1,
    pageSize: configSettings.roleListMaxPageSize
  }
  httpUtils.get(serverPaths.roleList, params, function (data) {
    x.roleList = data.list
  })
}

function loadDeptTree() {
  if (x.deptTree.length !== 0) {
    return
  }
  httpUtils.get(serverPaths.deptTree, null, function (data) {
    x.deptTree = data
  })
}

function loadJobList() {
  if (x.jobList.length !== 0) {
    return
  }
  let params = {
    page: 1,
    pageSize: configSettings.jobListMaxPageSize
  }
  httpUtils.get(serverPaths.jobList, params, function (data) {
    x.jobList = data.list
  })
}

function search(page) {
  let params = x.searchItems
  params.page = page
  params.pageSize = x.defaultPageSize
  httpUtils.get(serverPaths.userList, params, function (resData) {
    x.currentPage = page
    x.total = resData.total
    if (resData && resData.list) {
      let rows = []
      resData.list.forEach(function (item) {
        let row = {}
        row.id = item.id
        row.nickname = item.nickname
        row.email = item.email
        row.cellphone = item.cellphone
        row.sex = item.sex
        row.sexLabel = item.sex === 0 ? "男" : "女"
        row.status = item.status
        if (item.status === 0) {
          row.statusLabel = "正常"
          row.statusTagType = "success"
        } else if (item.status === 1) {
          row.statusLabel = "禁用"
          row.statusTagType = "danger"
        }
        row.root = item.root
        row.rootLabel = item.root ? "是" : "否"
        if (item.root) {
          row.rootTagType = "danger"
        } else {
          row.rootTagType = "info"
        }
        row.name = item.name
        let roleIds = []
        for (let role of item.roleList) {
          roleIds.push(role.id)
        }
        row.roleIds = roleIds
        row.roleList = item.roleList
        let menuIds = []
        for (let menu of item.menuList) {
          menuIds.push(menu.id)
        }
        row.deptId = item.deptId
        row.dept = item.dept
        let jobIds = []
        for (let job of item.jobList) {
          jobIds.push(job.id)
        }
        row.jobIds = jobIds
        row.jobList = item.jobList
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

function disableDialog(user) {
  x.userInfo = JSON.parse(JSON.stringify(user))
  x.showDisableDialog = true
}

function enableDialog(user) {
  x.userInfo = JSON.parse(JSON.stringify(user))
  x.showEnableDialog = true
}

function changeUserStatusDisable() {
  x.btnState.loading()
  httpUtils.put(serverPaths.userDisable(x.userInfo.id), null, function () {
    x.btnState.unLoading()
    x.showDisableDialog = false
    uiUtils.showToast("success", "禁用成功")
    search(x.currentPage)
  }, () => {
    x.btnState.unLoading()
  })
}

function changeUserStatusEnable() {
  x.btnState.loading()
  httpUtils.put(serverPaths.userEnable(x.userInfo.id), null, function () {
    x.btnState.unLoading()
    x.showEnableDialog = false
    uiUtils.showToast("success", "启用成功")
    search(x.currentPage)
  }, () => {
    x.btnState.unLoading()
  })
}

function userDetail(user) {
  x.userInfo = JSON.parse(JSON.stringify(user))
  x.showUserDialog = true
}

function addDialog() {
  x.upsertMode = "add"
  x.upsertData = {}
  x.showUpsertDialog = true
}

function updateDialog(user) {
  x.upsertMode = "update"
  x.upsertData = JSON.parse(JSON.stringify(user))
  x.showUpsertDialog = true
}

function deleteDialog() {
  x.showDeleteDialog = true
}

function doDeleteUser() {
  x.btnState.loading()
  httpUtils.delete(serverPaths.userDelete(x.userInfo.id), null, function () {
    x.btnState.unLoading()
    x.showDeleteDialog = false
    uiUtils.showToast("success", "删除成功")
    x.showUserDialog = false
    search(x.currentPage)
  }, () => {
    x.btnState.unLoading()
  })
}

function resetPasswordDialog() {
  x.showResetPasswordDialog = true
}

function doResetPassword() {
  x.showResetPasswordDialog = false
  x.btnState.loading()
  httpUtils.put(serverPaths.userPasswdReset(x.userInfo.id), null, function () {
    x.btnState.unLoading()
    uiUtils.showToast("success", "重置成功")
  }, () => {
    x.btnState.unLoading()
  })
}

function updatePasswordDialog() {
  x.newPassword = ""
  x.showUpdatePasswordDialog = true
}

function doUpdatePassword() {
  x.btnState.loading()
  let params = {
    id: x.userInfo.id,
    newPassword: x.newPassword
  }
  httpUtils.put(serverPaths.userChangePasswd, params, function () {
    x.btnState.unLoading()
    x.showUpdatePasswordDialog = false
    uiUtils.showToast("success", "修改成功")
  }, () => {
    x.btnState.unLoading()
  })
}

function assignPermissionDialog() {
  x.userInfo.menuIds = [...x.userInfo.menuIds]
  x.showAssignPermissionDialog = true
}

function onAssignPermissionSuccess(menuIds) {
  x.userInfo.menuIds = menuIds
  search(x.currentPage)
}
</script>
<style scoped src="../../../assets/css/sys/users.css">
</style>