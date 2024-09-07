import config from "./config"
const serverContextPath = config.serverContextPath
const configSettings = {
    roleListMaxPageSize: 1000, // 查询全部角色列表时，最大支持的返回条数
    jobListMaxPageSize: 1000, // 查询全部岗位列表时，最大支持的返回条数
    appListMaxPageSize: 1000, // 查询全部应用列表时，最大支持的返回条数
    scriptListMaxPageSize: 1000, // 查询全部脚本列表时，最大支持的返回条数
    hostGroupListMaxPageSize: 1000, // 查询全部服务器组列表时，最大支持的返回条数
    uploadAppPkgSizeLimit: 500 // 上传的应用部署包大小限制，单位：MB
}

const sessionKeys = {
    loginUser: "_loginUser_",
    permissions: "_permissions_"
}
const localStorageKeys = {

}
const settingsKeys = {
    systemMainSettings: "sys_main_settings"
}

const serverPaths = {
    //settings
    settingsGet: serverContextPath + "/settings",
    settingsUpsert: serverContextPath + "/settings",
    // auth
    login: serverContextPath + "/auth/login",
    myInfo: serverContextPath + "/auth/my-info",
    changeMyPasswd: serverContextPath + "/auth/passwd",
    myInfoUpdate: serverContextPath + "/auth/my-info",
    webShellToken: serverContextPath + "/auth/web-shell-token",
    // menu
    menuTree: serverContextPath + "/menu/tree",
    menuAdd: serverContextPath + "/menu",
    menuUpdate: id => serverContextPath + "/menu/" + id,
    menuDelete: id => serverContextPath + "/menu/" + id,
    myMenuTree: serverContextPath + "/menu/my/tree",
    myPermissions: serverContextPath + "/menu/my/permissions",
    // icon
    iconAll: serverContextPath + "/icon/all",
    // user
    userList: serverContextPath + "/user/list",
    userDisable: id => serverContextPath + "/user/disable/" + id,
    userEnable: id => serverContextPath + "/user/enable/" + id,
    userDelete: id => serverContextPath + "/user/" + id,
    userUpdate: id => serverContextPath + "/user/" + id,
    userAdd: serverContextPath + "/user",
    userPasswdReset: id => serverContextPath + "/user/passwd-reset/" + id,
    userChangePasswd: serverContextPath + "/user/passwd",
    userMenu: id => serverContextPath + "/user/" + id + "/menus",
    // role
    roleList: serverContextPath + "/role/list",
    roleUpdate: id => serverContextPath + "/role/" + id,
    roleDelete: id => serverContextPath + "/role/" + id,
    roleAdd: serverContextPath + "/role",
    roleMenu: id => serverContextPath + "/role/" + id + "/menus",
    // job
    jobList: serverContextPath + "/job/list",
    jobAdd: serverContextPath + "/job",
    jobUpdate: id => serverContextPath + "/job/" + id,
    jobDelete: id => serverContextPath + "/job/" + id,
    // dept
    deptTree: serverContextPath + "/dept/tree",
    deptAdd: serverContextPath + "/dept",
    deptUpdate: id => serverContextPath + "/dept/" + id,
    deptDelete: id => serverContextPath + "/dept/" + id,
    // log
    loginLog: serverContextPath + "/log/login",
    opLog: serverContextPath + "/log/op",
    exceptionLog: serverContextPath + "/log/exception",
    loginLogDelete: serverContextPath + "/log/login",
    opLogDelete: serverContextPath + "/log/op",
    exceptionLogDelete: serverContextPath + "/log/exception",

    // devops
    // xterm
    terminal: serverContextPath + "/terminal/ws",
    // monitor
    performanceStats: serverContextPath + "/monitor/performance-stats",
    monitorList: serverContextPath + "/monitor/list",
    monitorHostInfo: serverContextPath + "/monitor/host-info",
    monitorHostDelete: serverContextPath + "/monitor/host",
    // host
    hostList: serverContextPath + "/devops/host/list",
    hostAll: serverContextPath + "/devops/host/all",
    hostAdd: serverContextPath + "/devops/host",
    hostUpdate: id => serverContextPath + "/devops/host/" + id,
    hostDelete: id => serverContextPath + "/devops/host/" + id,
    hostConnectTest: serverContextPath + "/devops/host/connect-test",
    // group
    groupList: serverContextPath + "/devops/group/list",
    groupAdd: serverContextPath + "/devops/group",
    groupUpdate: id => serverContextPath + "/devops/group/" + id,
    groupDelete: id => serverContextPath + "/devops/group/" + id,
    // app
    appList: serverContextPath + "/devops/app/list",
    appAdd: serverContextPath + "/devops/app",
    appUpdate: id => serverContextPath + "/devops/app/" + id,
    appDelete: id => serverContextPath + "/devops/app/" + id,
    uploadPkg: serverContextPath + "/devops/app/upload",
    downloadPkg: serverContextPath + "/devops/app/download",
    // script
    scriptList: serverContextPath + "/devops/script/list",
    scriptAdd: serverContextPath + "/devops/script",
    scriptUpdate: id => serverContextPath + "/devops/script/" + id,
    scriptDelete: id => serverContextPath + "/devops/script/" + id,
    // task
    taskList: serverContextPath + "/devops/task/list",
    taskAdd: serverContextPath + "/devops/task",
    taskUpdate: id => serverContextPath + "/devops/task/" + id,
    taskDelete: id => serverContextPath + "/devops/task/" + id,
    taskStart: id => serverContextPath + "/devops/task/start/" + id,
    taskStop: id => serverContextPath + "/devops/task/stop/" + id,
    // sse
    ssePush: serverContextPath + "/sse/message-push",
    taskManifestLog: taskId => serverContextPath + "/sse/task/" + taskId + "/manifest-log",
    taskHostLog: taskId => serverContextPath + "/sse/task/" + taskId + "/host-log",
    // explorer
    explorerEntries: serverContextPath + "/devops/explorer/entries",
    explorerDelete: serverContextPath + "/devops/explorer/entry",
    explorerUpload: serverContextPath + "/devops/explorer/upload",
    explorerDownload: serverContextPath + "/devops/explorer/download",
    explorerCreate: serverContextPath + "/devops/explorer/create",
    explorerRename: serverContextPath + "/devops/explorer/rename",
    // host explorer
    hostExplorerEntries: serverContextPath + "/devops/explorer/sftp/entries",
    hostExplorerDelete: serverContextPath + "/devops/explorer/sftp/entry",
    hostExplorerUpload: serverContextPath + "/devops/explorer/sftp/upload",
    hostExplorerDownload: serverContextPath + "/devops/explorer/sftp/download",
    hostExplorerCreate: serverContextPath + "/devops/explorer/sftp/create",
    hostExplorerRename: serverContextPath + "/devops/explorer/sftp/rename",
}
export {
    serverPaths,
    configSettings,
    sessionKeys,
    localStorageKeys,
    settingsKeys,
    config
}