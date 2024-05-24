import Main from "./views/general/main/main.vue"
import Login from "./views/login/login.vue"
import NotFound from "./views/general/404/404.vue"
// 系统管理
import User from "./views/system/user/index.vue"
import Role from "./views/system/role/index.vue"
import Menu from "./views/system/menu/index.vue"
import Job from "./views/system/job/index.vue"
import Dept from "./views/system/dept/index.vue"
import PersonCenter from "./views/system/person-center/index.vue"
import LoginLog from "./views/system/log/login/index.vue"
import OpLog from "./views/system/log/op/index.vue"
import ExceptionLog from "./views/system/log/exception/index.vue"
// 运维工具
import Xterm from "./views/devops/xterm/index.vue"
import Explorer from "./views/devops/explorer/index.vue"
import Performance from "./views/devops/monitor/performance/index.vue"
import PerformanceDetail from "./views/devops/monitor/performance/detail.vue"
import Host from "./views/devops/host/index.vue"
import HostXterm from "./views/devops/host/xterm.vue"
import Group from "./views/devops/group/index.vue"
import App from "./views/devops/app/index.vue"
import Script from "./views/devops/script/index.vue"
import Task from "./views/devops/task/index.vue"
const router = [
    {path: "/login", component: Login},
    {
        path: "", component: Main, children: [
            // 系统管理
            {path: "/sys/user", component: User},
            {path: "/sys/role", component: Role},
            {path: "/sys/menu", component: Menu},
            {path: "/sys/job", component: Job},
            {path: "/sys/dept", component: Dept},
            {path: "/sys/my-info", component: PersonCenter},
            {path: "/sys/log/login", component: LoginLog},
            {path: "/sys/log/op", component: OpLog},
            {path: "/sys/log/exception", component: ExceptionLog},
            // 运维工具
            {path: "/devops/terminal", component: Xterm},
            {path: "/devops/explorer", component: Explorer},
            {path: "/devops/monitor/performance", component: Performance},
            {path: "/devops/monitor/performance/detail", component: PerformanceDetail},
            {path: "/devops/host", component: Host},
            {path: "/devops/host/terminal", component: HostXterm},
            {path: "/devops/group", component: Group},
            {path: "/devops/app", component: App},
            {path: "/devops/script", component: Script},
            {path: "/devops/task", component: Task},
            // 404
            {path: "/:pathMatch(.*)*", component: NotFound},
        ]
    }
]
export default {
    routes: router
}