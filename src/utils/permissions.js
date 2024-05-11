import httpUtils from "./http-utils"
import {serverPaths, sessionKeys} from "../settings";

function loadPermissions(completeFunc) {
    httpUtils.get(serverPaths.myPermissions, null, function (data) {
        let permissions = {}
        if (data && data.length > 0) {
            for (const permission of data) {
                permissions[permission] = 1
            }
        }
        sessionStorage.setItem(sessionKeys.permissions, JSON.stringify(permissions))
        if (typeof completeFunc === "function") {
            completeFunc()
        }
    })
}

function hasPermission(permission) {
    const permissionsStr = sessionStorage.getItem(sessionKeys.permissions)
    if (permissionsStr == null) {
        loadPermissions(function () {
            const permissions = JSON.parse(sessionStorage.getItem(sessionKeys.permissions))
            return permissions[permission] === 1
        })
    } else {
        const permissions = JSON.parse(permissionsStr)
        return permissions[permission] === 1
    }
}

export {loadPermissions, hasPermission}