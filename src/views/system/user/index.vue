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
      <el-button type="primary" icon="Search" @click="search">搜索</el-button>
      <el-button type="primary" icon="Plus" :disabled="!hasPermission('user:add')" @click="addDialog">新增</el-button>
    </div>
    <!--表格数据-->
    <el-table :data="x.tableData"  empty-text="暂无数据">
      <el-table-column label="昵称" prop="nickname" header-align="center" align="center" width="120px"></el-table-column>
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
    <el-pagination class="pagination" :default-page-size="x.defaultPageSize" v-model:current-page="x.currentPage" background :total="x.total" layout="prev, pager, next" @update:current-page="pageChanged"></el-pagination>
    <!--用户详情弹框-->
    <el-dialog v-model="x.showUserDialog" width="60%">
      <div class="p_info">
        <div class="p_left">
          <el-image class="p_img" src="" fit="contain">
            <template #error>
              <svg class="p_img_err" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" data-v-ea893728="">
                <path fill="currentColor" d="M512 512a192 192 0 1 0 0-384 192 192 0 0 0 0 384zm0 64a256 256 0 1 1 0-512 256 256 0 0 1 0 512zm320 320v-96a96 96 0 0 0-96-96H288a96 96 0 0 0-96 96v96a32 32 0 1 1-64 0v-96a160 160 0 0 1 160-160h448a160 160 0 0 1 160 160v96a32 32 0 1 1-64 0z"></path>
              </svg>
            </template>
          </el-image>
          <span class="p_nickname">{{ x.userInfo.nickname }}</span>
        </div>
        <div class="h_line"></div>
        <div class="p_right">
          <div class="info">
            <div class="row">
              <div class="p_name">手机号</div>
              <div class="p_value">{{ x.userInfo.cellphone }}</div>
              <div class="p_name">性别</div>
              <div class="p_value">{{ x.userInfo.sexLabel }}</div>
            </div>
            <div class="row">
              <div class="p_name">邮箱</div>
              <div class="p_value">{{ x.userInfo.email }}</div>
              <div class="p_name">账号状态</div>
              <div class="p_value">
                <el-tag :type="x.userInfo.statusTagType" disable-transitions>{{ x.userInfo.statusLabel }}</el-tag>
              </div>
            </div>
            <div class="row">
              <div class="p_name">真实姓名</div>
              <div class="p_value">{{ x.userInfo.name }}</div>
              <div class="p_name">超级用户</div>
              <div class="p_value">
                <el-tag :type="x.userInfo.rootTagType" disable-transitions>{{ x.userInfo.rootLabel }}</el-tag>
              </div>
            </div>
            <div class="row">
              <div class="p_name">部门</div>
              <div class="p_value">
                <div style="width: 100%; flex-wrap: wrap; display: flex; align-items: center;">
                  <el-tag v-if="x.userInfo.dept" type="primary" disable-transitions style="margin: 2px 10px 2px 0;">{{ x.userInfo.dept.name }}
                  </el-tag>
                </div>
              </div>
              <div class="p_name">岗位</div>
              <div class="p_value">
                <div style="width: 100%; flex-wrap: wrap; display: flex; align-items: center;">
                  <el-tag v-for="item in x.userInfo.jobList" :key="item.id" type="warning" disable-transitions style="margin: 2px 10px 2px 0;">{{ item.name }}
                  </el-tag>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="p_name">角色</div>
              <div class="p_value">
                <div style="width: 100%; flex-wrap: wrap; display: flex; align-items: center;">
                  <el-tag v-for="item in x.userInfo.roleList" :key="item.id" type="warning" disable-transitions style="margin: 2px 10px 2px 0;">{{ item.name }}
                  </el-tag>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="p_name">注册时间</div>
              <div class="p_value">{{ x.userInfo.createTime }}</div>
              <div class="p_name">修改时间</div>
              <div class="p_value">{{ x.userInfo.updateTime }}</div>
            </div>
          </div>
          <div class="op_btn_v">
            <el-button class="op_btn" type="success" :disabled="!hasPermission('user:changePassword')" @click="updatePasswordDialog">修改密码</el-button>
            <el-button class="op_btn" type="warning" :disabled="!hasPermission('user:resetPassword')" @click="resetPasswordDialog">重置密码</el-button>
            <el-button class="op_btn" type="danger" :disabled="!hasPermission('user:delete')" @click="deleteDialog">删除用户</el-button>
            <el-button class="op_btn" type="primary" :disabled="!hasPermission('user:menus')" @click="assignPermissionDialog">分配权限</el-button>
          </div>
        </div>
      </div>
    </el-dialog>
    <!--编辑/新增弹框-->
    <el-dialog v-model="x.showUpdateDialog" width="60%">
      <div class="p_info">
        <div class="p_left">
          <el-image class="p_img" src="" fit="contain">
            <template #error>
              <svg class="p_img_err" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" data-v-ea893728="">
                <path fill="currentColor" d="M512 512a192 192 0 1 0 0-384 192 192 0 0 0 0 384zm0 64a256 256 0 1 1 0-512 256 256 0 0 1 0 512zm320 320v-96a96 96 0 0 0-96-96H288a96 96 0 0 0-96 96v96a32 32 0 1 1-64 0v-96a160 160 0 0 1 160-160h448a160 160 0 0 1 160 160v96a32 32 0 1 1-64 0z"></path>
              </svg>
            </template>
          </el-image>
          <span class="p_nickname">
            <el-input class="_required" v-model="x.userInfo.nickname" maxlength="20" placeholder="用户昵称"></el-input>
          </span>
        </div>
        <div class="h_line"></div>
        <div class="p_right">
          <div class="info">
            <div class="row">
              <div class="p_name">手机号</div>
              <div class="p_value">
                <el-input v-model="x.userInfo.cellphone" maxlength="11"></el-input>
              </div>
              <div class="p_name">性别</div>
              <div class="p_value">
                <el-select v-model="x.userInfo.sex">
                  <el-option label="男" :value="0"></el-option>
                  <el-option label="女" :value="1"></el-option>
                </el-select>
              </div>
            </div>
            <div class="row">
              <div class="p_name _required">邮箱</div>
              <div class="p_value">
                <el-input v-model="x.userInfo.email" maxlength="50"></el-input>
              </div>
              <div class="p_name">真实姓名</div>
              <div class="p_value">
                <el-input v-model="x.userInfo.name" maxlength="20"></el-input>
              </div>
            </div>
            <div class="row">
              <div class="p_name _required">部门</div>
              <div class="p_value">
                <el-tree-select class="v" placeholder="选择部门" v-model="x.userInfo.deptId" value-key="id" check-strictly :data="x.deptTree" :props="x.defaultProps" accordion :render-after-expand="false" :filterable="true"></el-tree-select>
              </div>
              <div class="p_name _required">岗位</div>
              <div class="p_value">
                <el-select v-model="x.userInfo.jobIds" placeholder="选择岗位" :filterable="true" multiple>
                  <el-option v-for="item in x.jobList" :key="item.id" :label="item.name" :value="item.id"></el-option>
                </el-select>
              </div>
            </div>
            <div class="row">
              <div class="p_name _required">角色</div>
              <div class="p_value">
                <el-select v-model="x.userInfo.roleIds" placeholder="选择角色" :filterable="true" multiple style="width: 100%;">
                  <el-option v-for="item in x.roleList" :key="item.id" :label="item.name" :value="item.id"></el-option>
                </el-select>
              </div>
            </div>
            <div class="row" v-if="!x.userInfo.id">
              <div class="p_name">发送密码</div>
              <el-radio-group v-model="x.userInfo.shouldSendPassword" style="padding-left: 10px;">
                <el-radio :value="true">是</el-radio>
                <el-radio :value="false">否</el-radio>
              </el-radio-group>
              <span style="padding-left: 20px; color: #b4b4b4;">（是否通过邮件发送初始登录密码）</span>
            </div>
          </div>
          <div class="op_btn_v">
            <el-button v-if="x.userInfo.id && x.userInfo.id > 0" class="op_btn" type="warning" :loading="x.btnState.isLoading" @click="doUpdateUser">保存
            </el-button>
            <el-button v-else class="op_btn" type="primary" :loading="x.btnState.isLoading" @click="doAddUser">保存
            </el-button>
          </div>
        </div>
      </div>
    </el-dialog>
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
    <el-dialog v-model="x.showAssignPermissionDialog" title="分配权限" width="30%">
      <el-tree ref="permissionTree" :data="x.menuTree" node-key="id" :props="x.defaultProps" :default-checked-keys="x.userInfo.menuIds" :render-after-expand="false" show-checkbox check-strictly @checkChange="permissionsChange">
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
  showUpdateDialog: false,
  userInfo: {},
  btnState: uiUtils.buttonState(),
  showResetPasswordDialog: false,
  showUpdatePasswordDialog: false,
  newPassword: "",
  showAssignPermissionDialog: false,
  defaultProps: {
    label: "name",
    children: "children"
  },
  roleList: [],
  menuTree: [],
  permissionCount: 0,
  deptTree: [],
  jobList: []
})
const permissionTree = ref()

onMounted(() => {
  search()
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

function pageChanged(page) {
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

function search() {
  if (x.currentPage === 1) {
    pageChanged(1)
  } else {
    x.currentPage = 1
  }
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
    pageChanged(x.currentPage)
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
    pageChanged(x.currentPage)
  }, () => {
    x.btnState.unLoading()
  })
}

function userDetail(user) {
  x.userInfo = JSON.parse(JSON.stringify(user))
  x.permissionCount = x.userInfo.menuIds.length
  x.showUserDialog = true
}

function addDialog() {
  x.userInfo = {
    sex: 0,
    shouldSendPassword: false
  }
  x.showUpdateDialog = true
}

function doAddUser() {
  x.btnState.loading()
  httpUtils.post(serverPaths.userAdd, x.userInfo, function () {
    x.btnState.unLoading()
    x.showUpdateDialog = false
    uiUtils.showToast("success", "添加成功")
    pageChanged(x.currentPage)
  }, () => {
    x.btnState.unLoading()
  })
}

function updateDialog(user) {
  x.userInfo = JSON.parse(JSON.stringify(user))
  x.userInfo.shouldSendPassword = false
  x.showUpdateDialog = true
}

function doUpdateUser() {
  x.btnState.loading()
  const {
    roleList,
    menuIds,
    sexLabel,
    statusLabel,
    statusTagType,
    rootLabel,
    rootTagType,
    dept,
    jobList,
    ...updateUserInfo
  } = x.userInfo
  httpUtils.put(serverPaths.userUpdate(x.userInfo.id), updateUserInfo, function () {
    x.btnState.unLoading()
    x.showUpdateDialog = false
    uiUtils.showToast("success", "修改成功")
    pageChanged(x.currentPage)
  }, () => {
    x.btnState.unLoading()
  })
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
    pageChanged(x.currentPage)
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
  if (permissionTree.value) {
    permissionTree.value.setCheckedKeys([])
  }
  x.userInfo.menuIds = [...x.userInfo.menuIds]  // 重新赋值是为了触发模板响应数据变化
  x.permissionCount = x.userInfo.menuIds.length
  x.showAssignPermissionDialog = true
}

function doAssignPermission() {
  x.btnState.loading()
  x.userInfo.menuIds = permissionTree.value.getCheckedKeys()
  httpUtils.put(serverPaths.userMenu(x.userInfo.id), {ids: x.userInfo.menuIds}, function () {
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
<style scoped src="../../../assets/css/sys/users.css">
</style>