import axios from "axios"
import {ElLoading} from "element-plus"
import uiUtils from "./ui-utils"

function responseHandler(res, successCallback, failCallback) {
  if (res.data.code === 200) {
    successCallback(res.data.value)
  } else if (res.data.code === 401) {
    handle401(res, failCallback)
  } else if ([400, 403].includes(res.data.code)) {
    handle400(res, failCallback)
  } else {
    handleFail(res, failCallback)
  }
}
function handle400(res, failCallback) {
  if (typeof failCallback === "function") {
    failCallback(res.data)
  }
  uiUtils.showToast("error", res.data.message)
}

function handle401(res, failCallback) {
  if (typeof failCallback === "function") {
    failCallback(res.data)
  }
  uiUtils.showToast("error", res.data.message)
  setTimeout(function () {
    location.assign("/login")
  }, 2000)
}

function handleFail(res, failCallback) {
  if (typeof failCallback === "function") {
    failCallback(res.data)
  }
  console.error(res.data)
  uiUtils.showToast("error", "抱歉，出错了！")
}

export default {
  // 发起http请求时，页面的加载蒙层
  loadingConfig: {
    background: "rgba(255,255,255,0.3)",
    target: "#_loading-target"
  },
  /**
   * 发起http get请求
   * @param url 请求地址， 必填
   * @param params 参数 [类型：Object]，可选
   * @param successCallback 回调函数，参数值为res.data.value，可选
   * @param failCallback 回调函数，有一个参数，res.data，可选
   */
  get(url, params, successCallback, failCallback){
    axios.get(url, {params: params}).then(function (res) {
      responseHandler(res, successCallback, failCallback)
    }).catch(function (err) {
      console.error(err)
      uiUtils.showToast("error", err.toString())
    })
  },
  /**
   * 发起http post请求
   * @param url 请求地址，必填
   * @param params 参数 [类型：Object]，可选
   * @param successCallback 回调函数，参数值为res.data.value，可选
   * @param failCallback 回调函数，有一个参数，res.data，可选
   */
  post(url, params, successCallback, failCallback){
    let self = this
    const loadingInstance = ElLoading.service(self.loadingConfig)
    axios.defaults.headers.post["Content-Type"] = "application/json"
    axios.post(url, params).then(function (res) {
      loadingInstance.close()
      responseHandler(res, successCallback, failCallback)
    }).catch(function (err) {
      loadingInstance.close()
      console.error(err)
      uiUtils.showToast("error", err.toString())
    })
  },
  /**
   * 发起http put请求
   * @param url 请求地址，必填
   * @param params 参数 [类型：Object]，可选
   * @param successCallback 回调函数，参数值为res.data.value，可选
   * @param failCallback 回调函数，有一个参数，res.data，可选
   */
  put(url, params, successCallback, failCallback){
    let self = this
    const loadingInstance = ElLoading.service(self.loadingConfig)
    axios.defaults.headers.put["Content-Type"] = "application/json"
    axios.put(url, params).then(function (res) {
      loadingInstance.close()
      responseHandler(res, successCallback, failCallback)
    }).catch(function (err) {
      loadingInstance.close()
      console.error(err)
      uiUtils.showToast("error", err.toString())
    })
  },
  /**
   * 发起http delete请求
   * @param url 请求地址， 必填
   * @param params 参数 [类型：Object]，可选
   * @param successCallback 回调函数，参数值为res.data.value，可选
   * @param failCallback 回调函数，有一个参数，res.data，可选
   */
  delete(url, params, successCallback, failCallback){
    let self = this
    const loadingInstance = ElLoading.service(self.loadingConfig)
    axios.delete(url, {params: params}).then(function (res) {
      loadingInstance.close()
      responseHandler(res, successCallback, failCallback)
    }).catch(function (err) {
      loadingInstance.close()
      console.error(err)
      uiUtils.showToast("error", err.toString())
    })
  }
}