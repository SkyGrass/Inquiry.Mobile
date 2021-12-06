import api from './index'
// axios
import request from '@/utils/request'

export function getSignDetail(params) {
    return request({
        url: api.SignDetail,
        method: 'get',
        params,
        hideloading: true
    })
}
export function getRecord(params) {
    return request({
        url: api.SignRecord,
        method: 'get',
        params,
        hideloading: true
    })
}

export function getSign(params) {
    return request({
        url: api.Sign,
        method: 'get',
        params,
        hideloading: true
    })
}
export function getSignList(params) {
    return request({
        url: api.SignList,
        method: 'get',
        params,
        hideloading: true
    })
}
export function save(data) {
    return request({
        url: api.SaveSign,
        method: 'post',
        data,
        hideloading: false
    })
}
export function modify(data) {
    return request({
        url: api.ModifySign,
        method: 'post',
        data,
        hideloading: false
    })
}

export function del(data) {
    return request({
        url: api.DelSign,
        method: 'post',
        data,
        hideloading: false
    })
}

export function audit(data) {
    return request({
        url: api.AuditSign,
        method: 'post',
        data,
        hideloading: false
    })
}

export function unAudit(data) {
    return request({
        url: api.UnAuditSign,
        method: 'post',
        data,
        hideloading: false
    })
}