import api from './index'
// axios
import request from '@/utils/request'

export function getBaseList(params) {
    return request({
        url: api.BaseList,
        method: 'get',
        params,
        hideloading: true
    })
}

export function searchInv(params) {
    return request({
        url: api.SInv,
        method: 'get',
        params,
        hideloading: true
    })
}