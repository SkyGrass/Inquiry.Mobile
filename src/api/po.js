import api from './index'
// axios
import request from '@/utils/request'

export function getPoDetail(params) {
    return request({
        url: api.PoDetail,
        method: 'get',
        params,
        hideloading: true
    })
}
export function getRecord(params) {
    return request({
        url: api.PoRecord,
        method: 'get',
        params,
        hideloading: true
    })
}

export function getPo(params) {
    return request({
        url: api.Po,
        method: 'get',
        params,
        hideloading: true
    })
}
export function getPoList(params) {
    return request({
        url: api.PoList,
        method: 'get',
        params,
        hideloading: true
    })
}
export function save(data) {
    return request({
        url: api.SavePo,
        method: 'post',
        data,
        hideloading: false
    })
}
export function saveMuilt(data) {
    return request({
        url: api.SavePoMuilt,
        method: 'post',
        data,
        hideloading: false
    })
}
export function modify(data) {
    return request({
        url: api.ModifyPo,
        method: 'post',
        data,
        hideloading: false
    })
}

export function del(data) {
    return request({
        url: api.DelPo,
        method: 'post',
        data,
        hideloading: false
    })
}

export function audit(data) {
    return request({
        url: api.AuditPo,
        method: 'post',
        data,
        hideloading: false
    })
}

export function unAudit(data) {
    return request({
        url: api.UnAuditPo,
        method: 'post',
        data,
        hideloading: false
    })
}
export function partnerConfirmOrder(params) {
    return request({
        url: api.PartnerConfirmOrder,
        method: 'get',
        params,
        hideloading: true
    })
}
