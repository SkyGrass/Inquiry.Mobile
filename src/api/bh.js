import api from './index'
// axios
import request from '@/utils/request'
export function getBhList(params) {
    return request({
        url: api.BhList,
        method: 'get',
        params,
        hideloading: true
    })
}