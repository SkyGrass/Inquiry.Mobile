<template>
  <div class="root">
    <div class="vcr">
      <van-cell-group title="用户信息">
        <van-cell title="制单人" :value="userName" />
        <van-cell title="日期" :value="date" />
      </van-cell-group>

      <van-cell-group title="报价有效期">
        <van-cell title="开始日期" :value="startDateStr" is-link @click="showStartDate = true" />
        <van-cell title="结束日期" :value="endDateStr" is-link @click="showEndDate = true" />
      </van-cell-group>

      <van-cell-group>
        <template #title>
          <span>询价单详情 共：{{ total_partner }}个供应商 共：{{ total }}件</span>
        </template>
        <van-collapse v-model="activeNames">
          <van-collapse-item :name="i" :title="c.partnerName" v-for="(c, i) in cars" :key="i">
            <van-cell :label="v.specification" v-for="(v, a) in c.invs" :key="a">
              <template #title>
                <span class="custom-title">{{ v.name }}</span>
                <van-tag type="danger">{{ v.unitname }}</van-tag>
              </template>
              <template #label>
                <van-field v-model="v.priceLast" type="number" label="上期报价" readonly />
                <van-field v-model="v.priceLastConfirm" type="number" label="上期定价" readonly />
                <van-field
                  :ref="'input_' + i + '_' + a"
                  :id="'input_' + i + '_' + a"
                  v-model="v.priceMarket"
                  type="number"
                  label="市场价"
                  autocomplete="off"
                  @blur="onBlur(v, c.partnerId, v.id)"
                  @focus="onGetPrice(v, c.partnerId, v.id)"
                />
                <!-- <van-field v-model="v.priceCurrent" type="number" label="供应商报价" disabled /> -->
                <van-field
                  v-model="v.remark"
                  rows="1"
                  autosize
                  label="其他说明"
                  type="textarea"
                  placeholder="请输入说明"
                />
              </template>
              <template>
                <span>规格：{{ v.specification == '' ? '-' : v.specification }}</span>
              </template>
            </van-cell>
          </van-collapse-item>
        </van-collapse>
      </van-cell-group>

      <div style="margin: 16px">
        <van-button round block type="info" @click="submit">提交</van-button>
        <van-button style="margin-top: 5px" v-if="!newBill" round block type="danger" @click="del">作废</van-button>
      </div>

      <van-popup v-model="showStartDate" round position="bottom" :style="{ height: '40%' }">
        <van-datetime-picker @confirm="showStartDate = false" v-model="startDate" type="date" title="选择年月日" />
      </van-popup>
      <van-popup v-model="showEndDate" round position="bottom" :style="{ height: '40%' }">
        <van-datetime-picker @confirm="showEndDate = false" v-model="endDate" type="date" title="选择年月日" />
      </van-popup>
    </div>
  </div>
</template>
<script>
import { mounted } from '@/mix/mounted.js'
import { mapGetters } from 'vuex'
import dayjs from 'dayjs'
import { setStorage, getStorage } from '@/utils/index.js'
import { getXj, check, save, modify, del } from '@/api/xj.js'
export default {
  mixins: [mounted],
  name: `p21_1`,
  data() {
    return {
      id: -1,
      activeNames: ['0'],
      currentDate: new Date(),
      invs_p: [],
      showStartDate: false,
      showEndDate: false,
      date: dayjs(new Date()).format('YYYY-MM-DD'),
      startDate: dayjs(new Date()).add(1, 'month').startOf('month').toDate(),
      endDate: dayjs(new Date()).add(1, 'month').endOf('month').toDate()
    }
  },
  asyncComputed: {
    ...mapGetters(['userName', 'billerId']),

    async startDateStr() {
      return dayjs(this.startDate).format('YYYY-MM-DD')
    },
    async endDateStr() {
      return dayjs(this.endDate).format('YYYY-MM-DD')
    },
    async total_partner() {
      return Array.from(new Set(this.invs_p.map(f => f.partnerId))).length
    },
    async total() {
      return this.invs_p.length > 0
        ? this.invs_p
            .map(f => f.count)
            .reduce(function (prev, next, index, array) {
              return prev + next
            })
        : 0
    },
    async cars() {
      if (this.invs_p.length > 0) {
        let group = Array.from(new Set(this.invs_p.map(f => f.partnerId))).map(g => {
          let t = {}
          t.partnerId = g
          t.partnerName = this.invs_p.filter(f => f.partnerId == g)[0].partnerName
          t.invs = this.invs_p.filter(f => f.partnerId == g)
          return t
        })
        return group
      } else {
        return []
      }
    },
    async groupId() {
      return this.$route.query.group || ''
    },
    async context() {
      if (this.invs_p.length > 0) {
        let group = Array.from(new Set(this.invs_p.map(f => f.partnerId))).map(g => {
          return {
            name: this.$route.query.group + '_P21_ShopCar_' + g,
            entry: this.invs_p.filter(f => f.partnerId == g)
          }
        })
        return group
      } else {
        return []
      }
    },
    async newBill() {
      return (this.id = -1)
    },
    id() {
      return this.$route.query.id
    }
  },
  methods: {
    onGetPrice(inv, pId, id) {
      check({ partnerId: inv.partnerId, invId: inv.id }).then(({ code, data, message }) => {
        if (code == 200) {
          if (data.length > 0) {
            inv.priceLast = Number(data[0]['priceCurrent']).toFixed(2)
            inv.priceLastConfirm = Number(data[0]['priceCurrentConfirm']).toFixed(2)
          } else {
            this.$toast({ message: '未能查询到往期价格，默认置为0' })
          }
          if (inv.priceMarket == '0.00') {
            inv.priceMarket = ''
          }
          const index = this.invs_p.findIndex(f => f.partnerId == pId && f.id == id)
          this.$set(this.invs_p, index, inv)
        }
      })
    },
    onBlur(inv, pId, id) {
      if (inv.priceMarket == '') {
        inv.priceMarket = '0.00'
        const index = this.invs_p.findIndex(f => f.partnerId == pId && f.id == id)
        this.$set(this.invs_p, index, inv)
      }
    },
    del() {
      this.$dialog
        .confirm({
          title: '提示',
          message: '确定要作废当前单据吗?'
        })
        .then(() => {
          del({
            id: this.id
          })
            .then(({ code, data, message }) => {
              this.$dialog
                .alert({
                  title: '提示',
                  message: message
                })
                .then(() => {
                  this.$router.go(-2)
                })
            })
            .catch(err => {
              this.$dialog.alert({
                title: '提示',
                message: '操作过程发生异常!'
              })
            })
        })
        .catch(() => {})
    },
    beforeSave() {
      if (this.invs_p.map(m => m.priceMarket).some(s => Number(s) <= 0)) {
        this.$toast({ type: 'fail', message: '发现异常的市场价,请核实!' })
        return false
      }
      if (dayjs(this.startDate).diff(dayjs(this.endDate)) > 0) {
        this.$toast({ type: 'fail', message: '发现报价有效期异常,请核实!' })
        return false
      }
      return true
    },
    submit() {
      if (this.beforeSave()) {
        this.$dialog
          .confirm({
            title: '提示',
            message: '确定要保存吗?'
          })
          .then(() => {
            if (this.id > 0) {
              modify({
                inquiry: {
                  id: this.id,
                  billerId: this.billerId,
                  billNo: this.groupId,
                  startDate: this.startDateStr,
                  endDate: this.endDateStr
                },
                inquiryEntry: this.invs_p.map(m => {
                  return {
                    invId: m.id,
                    partnerId: m.partnerId,
                    priceLast: m.priceLast,
                    priceLastConfirm: m.priceLastConfirm,
                    priceMarket: m.priceMarket,
                    remark: m.remark
                  }
                }),
                context: this.context
              })
                .then(({ code, data, message }) => {
                  if (code == 200) {
                    let t = JSON.parse(getStorage(this.groupId + '_shopCar_P21_Dic'))
                    t.forEach(row => {
                      setStorage(row, '')
                    })
                    setStorage(this.groupId + '_shopCar_P21', '')
                    setStorage(this.groupId + '_shopCar_P21_Dic', '')
                    setStorage(this.groupId + '_shopCar_D', '')
                  }
                  this.$dialog
                    .alert({
                      title: '提示',
                      message: message
                    })
                    .then(() => {
                      if (code == 200) {
                        this.$router.go(-2)
                      }
                    })
                })
                .catch(err => {
                  this.$dialog.alert({
                    title: '提示',
                    message: '保存订单发生异常!'
                  })
                })
            } else {
              save({
                inquiry: {
                  billerId: this.billerId,
                  billNo: this.groupId,
                  startDate: this.startDateStr,
                  endDate: this.endDateStr
                },
                inquiryEntry: this.invs_p.map(m => {
                  return {
                    invId: m.id,
                    partnerId: m.partnerId,
                    priceLast: m.priceLast,
                    priceLastConfirm: m.priceLastConfirm,
                    priceMarket: m.priceMarket,
                    remark: m.remark
                  }
                }),
                context: this.context
              })
                .then(({ code, data, message }) => {
                  if (code == 200) {
                    let t = JSON.parse(getStorage(this.groupId + '_shopCar_P21_Dic'))
                    t.forEach(row => {
                      setStorage(row, '')
                    })
                    setStorage(this.groupId + '_shopCar_P21', '')
                    setStorage(this.groupId + '_shopCar_P21_Dic', '')
                    setStorage(this.groupId + '_shopCar_D', '')
                  }
                  this.$dialog
                    .alert({
                      title: '提示',
                      message: message
                    })
                    .then(() => {
                      if (code == 200) {
                        this.$router.go(-2)
                      }
                    })
                })
                .catch(err => {
                  this.$dialog.alert({
                    title: '提示',
                    message: '保存订单发生异常!'
                  })
                })
            }
          })
          .catch(() => {})
      }
    }
  },
  mounted() {
    const id = this.$route.query.id
    const cacheData = getStorage(this.$route.query.group + '_shopCar_P21')
    if (cacheData != '') {
      if (id) {
        getXj({ id })
          .then(({ code, data, message }) => {
            if (code == 200) {
              this.date = dayjs(data[0].date).format('YYYY-MM-DD')
              this.startDate = dayjs(data[0].startDate).toDate()
              this.endDate = dayjs(data[0].endDate).toDate()
            } else {
              this.$toast({ type: 'fail', message: '未能查询到订单详情!' })
            }
          })
          .catch(() => {
            this.$toast({ type: 'fail', message: '查询订单详情发生错误!' })
          })
      }

      this.invs_p = JSON.parse(cacheData).map(m => {
        m.remark = m.remark || ''
        m.priceCurrent = m.priceCurrent || m.priceCurrent || '0.00'
        m.priceLast = m.priceLast || m.priceLast || '0.00'
        m.priceLastConfirm = m.priceLastConfirm || '0.00'
        m.priceMarket = m.priceMarket || '0.00'
        return m
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.root {
  position: absolute;
  left: 0;
  right: 0;
  top: 50px;
  bottom: 50px;
  overflow: hidden;
  height: calc(100vh - 50px);
  .vcr {
    height: 100%;
    overflow: scroll;
  }
}
</style>