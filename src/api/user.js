import api from './index'
// axios
import request from '@/utils/request'

// 登录
export function login(params) {
    return request({
        url: api.Login,
        method: 'get',
        params
    })
}

// 用户信息 post 方法
export function getUserInfo(params) {
    return request({
        url: api.UserInfo,
        method: 'get',
        params,
        hideloading: true
    })
}

export function getMenu(params) {
    return request({
        url: api.Menu,
        method: 'get',
        params,
        hideloading: false
    })
}

export function getCls(params) {
    return request({
        url: api.Cls,
        method: 'get',
        params,
        hideloading: false
    })
}

export function updatePwd(data) {
    return request({
        url: api.Pwd,
        method: 'post',
        data,
        hideloading: false
    })
}