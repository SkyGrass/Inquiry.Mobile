import api from './index'
// axios
import request from '@/utils/request'
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
export function getInvs(params) {
    return request({
        url: api.Inv,
        method: 'get',
        params,
        hideloading: false
    })
}
export function getDepts(params) {
    return request({
        url: api.Dept,
        method: 'get',
        params,
        hideloading: false
    })
}
export function getPartners(params) {
    return request({
        url: api.Partner,
        method: 'get',
        params,
        hideloading: false
    })
}
export function getPartnerCls(params) {
    return request({
        url: api.PartnerCls,
        method: 'get',
        params,
        hideloading: false
    })
}
export function getAuditCount(params) {
    return request({
        url: api.AuditCount,
        method: 'get',
        params,
        hideloading: false
    })
}
export function getAuditList(params) {
    return request({
        url: api.AuditList,
        method: 'get',
        params,
        hideloading: false
    })
}

export function getAuditInfo(params) {
    return request({
        url: api.AuditInfo,
        method: 'get',
        params,
        hideloading: true
    })
}
export function auditBill(data) {
    return request({
        url: api.Audit,
        method: 'post',
        data,
        hideloading: false
    })
}
export function unAuditBill(data) {
    return request({
        url: api.UnAudit,
        method: 'post',
        data,
        hideloading: false
    })
}