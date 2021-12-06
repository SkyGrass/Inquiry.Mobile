import api from './index'
// axios
import request from '@/utils/request'

export function getSub(params) {
    return request({
        url: api.Sub,
        method: 'get',
        params,
        hideloading: true
    })
}

export function getSubList(params) {
    return request({
        url: api.SubList,
        method: 'get',
        params,
        hideloading: true
    })
}

export function save(data) {
    return request({
        url: api.SaveSg,
        method: 'post',
        data,
        hideloading: false
    })
}

export function modify(data) {
    return request({
        url: api.ModifySg,
        method: 'post',
        data,
        hideloading: false
    })
}

export function del(data) {
    return request({
        url: api.DelSub,
        method: 'post',
        data,
        hideloading: false
    })
}