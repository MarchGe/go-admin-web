import {ElMessage} from "element-plus";

export default {
    // 用以控制Element-Plus Button按钮的加载状态
    buttonState() {
        return {
            isLoading: false,
            loading() {
                this.isLoading = true
            },
            unLoading() {
                this.isLoading = false
            }
        }
    },
    showToast(type, message) {
        ElMessage.closeAll(type)
        ElMessage({
            message: message ? message : "操作成功",
            type: type
        })
    }
}