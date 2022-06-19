import api from './index'
// axios
import request from '@/utils/request'

export function getDayList(data) {
  return request({
    url: api.DayList,
    method: 'post',
    data,
    hideloading: true
  })
}

export function getSubDayList(data) {
  return request({
    url: api.SubDayList,
    method: 'post',
    data,
    hideloading: true
  })
}
