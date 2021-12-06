import api from './index'
// axios
import request from '@/utils/request'

// 登录
export function getBindList(params) {
    return request({
        url: api.BindList,
        method: 'get',
        params
    })
}
export function bindWechat(data) {
    return request({
        url: api.BindWechat,
        method: 'post',
        data,
        hideloading: false
    })
}
export function bindPartner(data) {
    return request({
        url: api.BindPartner,
        method: 'post',
        data,
        hideloading: false
    })
}
export function bindPerson(data) {
    return request({
        url: api.BindPerson,
        method: 'post',
        data,
        hideloading: false
    })
}

export function unBindWechat(data) {
    return request({
        url: api.UnBindWechat,
        method: 'post',
        data,
        hideloading: false
    })
}
export function unBindPartner(data) {
    return request({
        url: api.UnBindPartner,
        method: 'post',
        data,
        hideloading: false
    })
}
export function unBindPerson(data) {
    return request({
        url: api.UnBindPerson,
        method: 'post',
        data,
        hideloading: false
    })
}