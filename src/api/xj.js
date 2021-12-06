import api from './index'
// axios
import request from '@/utils/request'

export function getXj(params) {
    return request({
        url: api.Xj,
        method: 'get',
        params,
        hideloading: true
    })
}

export function getRecord(params) {
    return request({
        url: api.AskRecord,
        method: 'get',
        params,
        hideloading: true
    })
}

export function getXjList(params) {
    return request({
        url: api.XjList,
        method: 'get',
        params,
        hideloading: true
    })
}

export function getPartnerAskList(params) {
    return request({
        url: api.PaList,
        method: 'get',
        params,
        hideloading: true
    })
}

export function getPartnerAsk(params) {
    return request({
        url: api.Pa,
        method: 'get',
        params,
        hideloading: false
    })
}

export function confirm(data) {
    return request({
        url: api.PartnerConfirm,
        method: 'post',
        data,
        hideloading: true
    })
}

export function check(params) {
    return request({
        url: api.CheckXj,
        method: 'get',
        params,
        hideloading: true
    })
}

export function save(data) {
    return request({
        url: api.SaveXj,
        method: 'post',
        data,
        hideloading: false
    })
}

export function savePa(data) {
    return request({
        url: api.SavePa,
        method: 'post',
        data,
        hideloading: false
    })
}

export function savePac(data) {
    return request({
        url: api.SavePac,
        method: 'post',
        data,
        hideloading: false
    })
}

export function modify(data) {
    return request({
        url: api.ModifyXj,
        method: 'post',
        data,
        hideloading: false
    })
}

export function del(data) {
    return request({
        url: api.DelXj,
        method: 'post',
        data,
        hideloading: false
    })
}

export function audit(data) {
    return request({
        url: api.AuditAsk,
        method: 'post',
        data,
        hideloading: false
    })
}

export function notity(data) {
    return request({
        url: api.SendPartner,
        method: 'post',
        data,
        hideloading: false
    })
}