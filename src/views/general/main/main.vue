<template>
  <div class="_m-root">
    <el-menu class="_m-left" :collapse="x.settings.collapse" :unique-opened="true" :default-active="x.activeMenu + ''" :router="false" background-color="#222d32" text-color="rgb(255, 255, 255, 0.7)" active-text-color="#1890ff">
      <recursive-menu :items="x.menuTree" recursive-attribute="children" @click="onMenuClick"></recursive-menu>
    </el-menu>
    <div v-if="x.isOuterPage" class="_m-right" @click="menuCollapse">
      <div class="_float-collapse">
        <el-icon size="24"><Fold/></el-icon>
      </div>
      <iframe width="100%" height="100%" style="border: none;" :src="x.externalLink"></iframe>
    </div>
    <div v-else id="_loading-target" class="_m-right">
      <div class="_float-settings" @click="openSettings" :style="x.settings.head ? 'display:none;' : ''">
        <el-icon size="24"><i class="iconfont icon-shezhi" style="font-size: 20px;"></i></el-icon>
      </div>
      <el-menu class="header" mode="horizontal" :ellipsis="false" :style="x.settings.head ? '' : 'display:none;'">
        <el-menu-item index="0" @click="menuCollapse">
          <el-icon size="24">
            <Fold/>
          </el-icon>
        </el-menu-item>
        <div class="_m_blank-space">
          <el-tabs class="custom-tab" type="card" v-model="x.selectedTab" @tab-change="onTabChange" @tab-remove="onTabRemove" :style="x.settings.tab ? '' : 'display:none;'">
            <el-tab-pane v-for="(item, i) in x.tabs" :key="item.name" :name="item.name" :label="item.label" :closable="i !== 0"></el-tab-pane>
          </el-tabs>
        </div>
        <el-menu-item v-if="x.canFullscreen && !x.isFullscreen" class="_menu-item-right" index="1" @click="fullscreen">
          <i class="iconfont icon-suofang" style="font-size: 20px;"></i>
        </el-menu-item>
        <el-menu-item v-if="x.canFullscreen && x.isFullscreen" class="_menu-item-right" index="2" @click="exitFullscreen">
          <i class="iconfont icon-shousuo" style="font-size: 20px;"></i>
        </el-menu-item>
        <el-menu-item class="_menu-item-right" index="3" @click="openSettings">
          <i class="iconfont icon-shezhi" style="font-size: 20px;"></i>
        </el-menu-item>
        <el-sub-menu popper-class="_m-pop-p-menu" index="1">
          <template #title>{{ x.loginUser.nickname }}</template>
          <el-menu-item index="1-1" @click="personCenter('-1')">个人中心</el-menu-item>
          <el-menu-item index="1-2" @click="logout">退出登录</el-menu-item>
        </el-sub-menu>
      </el-menu>
      <router-view class="_router-view" v-slot="{ Component, route }" style="position: relative;">
        <transition name="scale" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
      <el-drawer class="_drawer" v-model="x.settings.showDrawer" title="页面设置" direction="rtl" size="25%">
        <div class="block">
          <div class="rows">
            <div class="row">
              <div class="name">导航栏</div>
              <el-switch class="value" v-model="x.settings.head"></el-switch>
            </div>
            <div class="row">
              <div class="name">Tab栏</div>
              <el-switch class="value" v-model="x.settings.tab"></el-switch>
            </div>
            <div class="row">
              <div class="name">菜单栏</div>
              <el-switch class="value" :model-value="!x.settings.collapse" @click="x.settings.collapse = !x.settings.collapse"></el-switch>
            </div>
          </div>
        </div>
        <template #footer>
          <div style="flex: auto">
            <el-button @click="x.settings.showDrawer = false">取消</el-button>
            <el-button type="primary" :loading="x.btnState.isLoading" @click="doSaveSettings">保存配置</el-button>
          </div>
        </template>
      </el-drawer>
    </div>
  </div>
</template>
<script setup>
import {onBeforeMount, onMounted, reactive} from "vue"
import RecursiveMenu from "./recursive-menu/recursive-menu.vue"
import httpUtils from "@/utils/http-utils"
import {serverPaths, sessionKeys, localStorageKeys, settingsKeys} from "@/settings"
import {loadPermissions} from "@/utils/permissions";
import uiUtils from "@/utils/ui-utils";
import { useRouter } from "vue-router";

const router = useRouter()
const NOT_FOUND_URL = "/page-not-found"
const x = reactive({
  btnState: uiUtils.buttonState(),
  settings: {
    showDrawer: false,
    head: true,
    tab: true,
    collapse: false,
  },
  isOuterPage: false,
  externalLink: "",
  loginUser: {},
  activeMenu: 0,
  selectedTab: "",
  menuTree: [],
  tabs: [],
  canFullscreen: true,
  isFullscreen: false,
  additionalTabRoutes: {
    "-1": "/sys/my-info"
  }
})

onBeforeMount(() => {
  httpUtils.get(serverPaths.settingsGet, {key: settingsKeys.systemMainSettings}, function (data) {
    if (data && data.value) {
      let settings = JSON.parse(data.value)
      x.settings.head = settings.head === undefined ? x.settings.head : settings.head
      x.settings.tab = settings.tab === undefined ? x.settings.tab : settings.tab
      x.settings.collapse = settings.collapse === undefined ? x.settings.collapse : settings.collapse
    }
  })
})

onMounted(() => {
  if (!document.fullscreenEnabled) {
    x.canFullscreen = false
  }
  let loginUserStr = sessionStorage.getItem(sessionKeys.loginUser)
  if (!loginUserStr) {
    location.assign(serverPaths.login)
  }
  x.loginUser = JSON.parse(loginUserStr)

  // 加载权限
  loadPermissions()
  // 加载左侧菜单
  loadMenuTree()
})

function openSettings() {
  x.settings.showDrawer = true
}

function doSaveSettings() {
  x.btnState.loading()
  let settings = {
    head: x.settings.head,
    tab: x.settings.tab,
    collapse: x.settings.collapse
  }
  httpUtils.put(serverPaths.settingsUpsert, {key: settingsKeys.systemMainSettings, value: JSON.stringify(settings)}, function () {
    x.btnState.unLoading()
    uiUtils.showToast("success", "保存成功")
  }, () => {
    x.btnState.unLoading()
  })
}

function fullscreen() {
  document.documentElement.requestFullscreen();
  x.isFullscreen = true
}

function exitFullscreen() {
  document.exitFullscreen();
  x.isFullscreen = false
}

function personCenter(tabIdStr) {
  x.activeMenu = parseInt(tabIdStr) // 加这一行的目的是消除左侧菜单的选中状态
  showTab(parseInt(tabIdStr), "个人中心")
  router.push("/sys/my-info")
}

function logout() {
  for (const key of Object.keys(sessionKeys)) {
    sessionStorage.removeItem(sessionKeys[key])
  }
  for (const key of Object.keys(localStorageKeys)) {
    localStorage.removeItem(localStorageKeys[key])
  }
  location.reload()
}

function loadMenuTree() {
  httpUtils.get(serverPaths.myMenuTree, null, function (data) {
    x.menuTree = data
    showFirstPage(x.menuTree)
  })
}

function showFirstPage(menuTree) {
  if (!menuTree || menuTree.length === 0) {
    return
  }
  let menu = getFirstLeaf(menuTree)
  x.activeMenu = menu.id
  if (menu.external === 1) {
    // 如果外链是第一个菜单，默认嵌入iframe
    x.isOuterPage = true
    x.externalLink = menu.url
  } else {
    x.isOuterPage = false
    showTab(x.activeMenu, menu.name)
    if (menu.url) {
      router.push(menu.url)
    } else {
      router.push(NOT_FOUND_URL)
    }
  }
}

function getFirstLeaf(menuTree) {
  let menu = menuTree[0]
  if (menu.children && menu.children.length > 0) {
    return getFirstLeaf(menu.children)
  }
  return menu
}

function menuCollapse() {
  x.settings.collapse = !x.settings.collapse
}

function routePage(tabId) {
  let menu = searchMenuById(x.menuTree, tabId)
  if (menu.url) {
    router.push(menu.url)
  } else {
    let path = x.additionalTabRoutes[tabId + ""]
    if (path) {
      router.push(path)
    } else {
      router.push(NOT_FOUND_URL)
    }
  }
}

function onMenuClick(e) {
  let menuId = parseInt(e.index)
  let menu = searchMenuById(x.menuTree, menuId)
  if (menu.external === 1) {
    if (menu.externalWay === 1) {
      x.isOuterPage = true
      x.externalLink = menu.url
    } else {
      window.open(menu.url, "_blank")
    }
  } else {
    x.isOuterPage = false
    showTab(menu.id, menu.name)
    if (menu.url) {
      router.push(menu.url)
    } else {
      router.push(NOT_FOUND_URL)
    }
  }
}

function searchMenuById(menuTree, menuId) {
  if (menuTree && menuTree.length > 0) {
    for (let menu of menuTree) {
      if (menu.id === menuId) {
        return menu
      } else if (menu.children && menu.children.length > 0) {
        let m = searchMenuById(menu.children, menuId)
        if (menuId === m.id) {
          return m
        }
      }
    }
  }
  return {}
}

function showTab(tabId, name) {
  for (let tab of x.tabs) {
    if (tab.name === tabId) {
      x.selectedTab = tabId
      return
    }
  }
  x.tabs.push({name: tabId, label: name})
  x.selectedTab = tabId
}

function removeTab(tabId) {
  for (let i = 0; i < x.tabs.length; i++) {
    if (x.tabs[i].name === tabId) {
      x.tabs.splice(i, 1)
      if (tabId !== x.selectedTab) {
        return
      }
      if (i < x.tabs.length) {
        x.selectedTab = x.tabs[i].name
        x.activeMenu = x.tabs[i].name
        routePage(x.tabs[i].name)
      } else {
        x.selectedTab = x.tabs[i - 1].name
        x.activeMenu = x.tabs[i - 1].name
        routePage(x.tabs[i - 1].name)
      }
      return
    }
  }
}

function onTabChange(tabId) { // 这个menuId参数，即name属性的值
  x.activeMenu = tabId
  routePage(tabId)
}

function onTabRemove(tabId) {
  removeTab(tabId)
}

</script>