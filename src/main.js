import {createApp} from 'vue'
import {createRouter, createWebHistory} from 'vue-router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import locale from 'element-plus/es/locale/lang/zh-cn.mjs'
import App from './App.vue'
import router from './router'

let app = createApp(App);
let vurRouter = createRouter({
    history: createWebHistory(),
    routes: router.routes
})

app.use(vurRouter)
app.use(ElementPlus, {locale})
// 注册图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
app.mount('#app')

app.config.errorHandler = (err) => {
    console.error(err)
}
