<template>
  <div class="container">
    <div class="block">
      <div class="b_title">
        <div style="flex: 1;">实时性能状况</div>
        <el-button type="primary" size="small" style="margin-right: 10px;" @click="goBack">返回</el-button>
      </div>
      <div class="stats">
        <div class="item" style="margin-left: 4px;">
          <div class="title">CPU使用率</div>
          <div class="chart" ref="cpuChart"></div>
          <div class="title">{{x.cpu.logicalCores}}&nbsp;核心</div>
        </div>
        <div class="item">
          <div class="title">内存使用率</div>
          <div class="chart" ref="memoryChart"></div>
          <div class="title">{{x.virtualMemory.used}}&nbsp;G&nbsp;/&nbsp;{{x.virtualMemory.total}}&nbsp;G</div>
        </div>
        <div class="item">
          <div class="title">交换区使用率</div>
          <div class="chart" ref="swapChart"></div>
          <div class="title">{{x.swapMemory.used}}&nbsp;G&nbsp;/&nbsp;{{x.swapMemory.total}}&nbsp;G</div>
        </div>
        <div class="item" style="margin-right: 4px;">
          <div class="title">磁盘使用率</div>
          <div class="chart" ref="diskChart"></div>
          <div class="title">{{x.disk.used}}&nbsp;G&nbsp;/&nbsp;{{x.disk.total}}&nbsp;G</div>
        </div>
      </div>
    </div>
    <div class="block">
      <div class="b_title" style="margin-bottom: 1px;">主机信息</div>
      <div class="host">
        <div class="item">
          <div class="row">
            <div class="name">主机名</div>
            <div class="value">{{x.hostInfo.hostName}}</div>
          </div>
          <div class="row">
            <div class="name">IP地址</div>
            <div class="value">{{x.hostInfo.ip}}</div>
          </div>
          <div class="row">
            <div class="name">操作系统</div>
            <div class="value">{{x.hostInfo.platform}}</div>
          </div>
          <div class="row">
            <div class="name">系统版本</div>
            <div class="value">{{x.hostInfo.platformVersion}}</div>
          </div>
          <div class="row">
            <div class="name">内核架构</div>
            <div class="value">{{x.hostInfo.kernelArch}}</div>
          </div>
          <div class="row">
            <div class="name">内核版本</div>
            <div class="value">{{x.hostInfo.kernelVersion}}</div>
          </div>
          <div class="row">
            <div class="name">系统运行时长</div>
            <div class="value">{{x.hostInfo.upTime}}</div>
          </div>
          <div class="row">
            <div class="name">上报时间</div>
            <div class="value">{{x.hostInfo.time}}</div>
          </div>
        </div>
        <div v-if="x.hostInfo.cpuInfos" class="item">
          <template v-for="(item, i) in x.hostInfo.cpuInfos" :key="item.num">
            <div class="row">
              <div class="name">CPU</div>
              <div class="value">{{item.num}}</div>
            </div>
            <div class="row">
              <div class="name">核心数</div>
              <div class="value">{{item.cores}}</div>
            </div>
            <div class="row">
              <div class="name">厂商</div>
              <div class="value">{{item.vendorId}}</div>
            </div>
            <div class="row">
              <div class="name">型号</div>
              <div class="value">{{item.modelName}}</div>
            </div>
            <div class="row">
              <div class="name">系列/家族</div>
              <div class="value">{{item.family}}</div>
            </div>
            <div class="row">
              <div class="name">频率（MHz）</div>
              <div class="value">{{item.mhz}}</div>
            </div>
            <div class="row">
              <div class="name">物理ID</div>
              <div class="value">{{item.physicalId}}</div>
            </div>
            <div v-if="i < x.hostInfo.cpuInfos.length - 1" style="height: 1px; background-color: #e2e2e2; margin: 12px 0;"></div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import {onBeforeUnmount, onMounted, reactive, ref} from "vue";
import {serverPaths} from "@/settings";
import httpUtils from "@/utils/http-utils";
import * as echarts from 'echarts';
import { useRoute, useRouter } from "vue-router";
import moment from "moment";

const route = useRoute()
const router = useRouter()
const cpuChart = ref()
const memoryChart = ref()
const swapChart = ref()
const diskChart = ref()

const x = reactive({
  cpu: {},
  virtualMemory: {},
  swapMemory: {},
  disk:{},
  hostInfo: {}
})

let interval
onMounted(() => {
  let cpuCht = echarts.init(cpuChart.value)
  let memCht = echarts.init(memoryChart.value)
  let swapCht = echarts.init(swapChart.value)
  let diskCht = echarts.init(diskChart.value)

  getPerformanceStats(cpuCht, memCht, swapCht, diskCht, route.query.ip)
  getHostInfo(route.query.ip)

  interval = setInterval(function () {
    getPerformanceStats(cpuCht, memCht, swapCht, diskCht, route.query.ip)
  }, 3000)
})

onBeforeUnmount(() => {
  if (interval !== undefined) {
    clearInterval(interval)
  }
})

function getPerformanceStats(cpuCht, memCht, swapCht, diskCht, ip) {
  let params = {
    ip: ip
  }
  httpUtils.get(serverPaths.performanceStats, params, function (data) {
    x.cpu = data.cpu
    cpuCht.setOption(getChatOption(data.cpu.usedPercent))

    x.virtualMemory = data.virtualMemory
    memCht.setOption(getChatOption(data.virtualMemory.usedPercent))

    x.swapMemory = data.swapMemory
    swapCht.setOption(getChatOption(data.swapMemory.usedPercent))

    x.disk = data.disk
    diskCht.setOption(getChatOption(data.disk.usedPercent))
  })
}

function getHostInfo(ip) {
  let params = {
    ip: ip
  }
  httpUtils.get(serverPaths.monitorHostInfo, params, function (data) {
    x.hostInfo = data
    x.hostInfo.time = moment(x.hostInfo.time).format("YYYY-MM-DD HH:mm:ss")
  })
}

function getChatOption(value) {
  return {
    series: [
      {
        type: 'gauge',
        pointer: {
          show: false
        },
        progress: {
          show: true,
          overlap: false,
          roundCap: true,
          clip: false,
          itemStyle: {
            borderWidth: 1,
            borderColor: "#337ecc",
            color: "#409eff"
          }
        },
        axisLine: {
          lineStyle: {
            width: 12
          }
        },
        splitLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          show: false
        },
        data: [{value: value}],
        detail: {
          show: true,
          formatter: "{value}%",
          valueAnimation: true,
          offsetCenter: ["0%", "0%"],
          fontSize: 16,
          fontWeight: "normal"
        }
      }
    ]
  }
}
function goBack() {
  router.back()
}

</script>
<style scoped src="../../../../assets/css/devops/monitor/detail.css">

</style>