<template>
  <div class="root">
    <div class="vcr">
      <van-cell-group title="用户信息">
        <van-cell title="制单人" :value="userName" />
        <van-cell title="日期" :value="curDateStr" is-link @click="showDateVisiable = true" />
      </van-cell-group>

      <van-cell-group title="送货信息">
        <van-cell title="要求送货日期" :value="requiredDateStr" />
      </van-cell-group>

      <van-cell-group>
        <template #title>
          <span>订单详情</span>
        </template>
        <van-collapse v-model="activeNames">
          <van-collapse-item :name="i" :title="c.partnerName" v-for="(c, i) in cars" :key="i">
            <van-cell :label="v.specification" v-for="(v, a) in c.invs" :key="a">
              <template #title>
                <span class="custom-title">{{ v.name }}</span>
                <van-tag type="danger">{{ v.unitname }}</van-tag>
              </template>
              <template #label>
                <van-field v-model="v.price" type="number" label="单价" disabled />
                <van-field v-model="v.max" type="number" label="要求数量" disabled />
                <van-field v-model="v.count" type="number" label="实际数量" disabled />
                <van-field
                  readonly
                  :ref="'input_' + i + '_' + a"
                  :id="'input_' + i + '_' + a"
                  v-model="v.amount"
                  type="number"
                  label="总价"
                />
                <van-field
                  v-model="v.remark"
                  rows="1"
                  autosize
                  label="其他说明"
                  type="textarea"
                  placeholder="请输入说明"
                />
              </template>
              <!--<template>
                <span>规格：{{ v.specification == '' ? '-' : v.specification }}</span>
              </template>-->
            </van-cell>
          </van-collapse-item>
        </van-collapse>
      </van-cell-group>

      <div style="margin: 16px">
        <van-button round block type="info" @click="submit">提交</van-button>
        <van-button style="margin-top: 5px" v-if="!newBill" round block type="danger" @click="del">作废</van-button>
      </div>

      <van-popup v-model="showDateVisiable" round position="bottom" :style="{ height: '40%' }">
        <van-datetime-picker
          @confirm="showDateVisiable = false"
          @cancel="showDateVisiable = false"
          v-model="curDate"
          type="date"
          title="选择年月日"
        />
      </van-popup>
    </div>
  </div>
</template>
<script>
import { mounted } from '@/mix/mounted.js'
import { mapGetters } from 'vuex'
import dayjs from 'dayjs'
import { setStorage, getStorage } from '@/utils/index.js'
import { getSign, save, modify, del } from '@/api/sign.js'
import { floatMul } from '@/utils'
export default {
  mixins: [mounted],
  name: `p51_1`,
  data() {
    return {
      id: -1,
      activeNames: ['0'],
      curDate: new Date(),
      requiredDate: dayjs(this.$route.query.date).toDate(),
      invs_p: [],
      showDateVisiable: false,
      poId: -1
    }
  },
  asyncComputed: {
    ...mapGetters(['userName', 'billerId']),

    async total_partner() {
      return Array.from(new Set(this.invs_p.map(f => f.partnerId))).length
    },
    async total() {
      return this.invs_p.length > 0
        ? this.invs_p
            .map(f => f.count || f.quantity)
            .reduce(function (prev, next, index, array) {
              return Number(prev) + Number(next)
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
            name: this.$route.query.group + '_P51_ShopCar_' + g,
            entry: this.invs_p
              .filter(f => f.partnerId == g)
              .map(m => {
                return {
                  invId: m.invId,
                  price: m.price,
                  quantity: m.max,
                  factQuantity: m.count,
                  remark: m.remark,
                  partnerId: m.partnerId,
                  partnerName: m.partnerName
                }
              })
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
    async curDateStr() {
      return dayjs(this.curDate).format('YYYY-MM-DD')
    },
    async requiredDateStr() {
      return dayjs(this.requiredDate).format('YYYY-MM-DD')
    },
    id() {
      return this.$route.query.id
    }
  },
  methods: {
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
      if (this.invs_p.map(m => m.amount).some(s => Number(s) <= 0)) {
        this.$toast({ type: 'fail', message: '发现异常的价格,请核实!' })
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
                sign: {
                  id: this.id,
                  billerId: this.billerId,
                  date: this.curDateStr,
                  poBillId: this.poId,
                  partnerId: this.invs_p[0].partnerId,
                  requiredDate: this.requiredDateStr
                },
                signEntry: this.invs_p.map(m => {
                  return {
                    invId: m.invId,
                    price: m.price,
                    quantity: m.max,
                    factQuantity: m.count,
                    remark: m.remark
                  }
                }),
                context: this.context
              })
                .then(({ code, data, message }) => {
                  if (code == 200) {
                    let t = JSON.parse(getStorage(this.groupId + '_shopCar_P51_Dic'))
                    t.forEach(row => {
                      setStorage(row, '')
                    })
                    setStorage(this.groupId + '_shopCar_P51', '')
                    setStorage(this.groupId + '_shopCar_P51_Dic', '')
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
                sign: {
                  billerId: this.billerId,
                  billNo: this.groupId,
                  date: this.curDateStr,
                  poBillId: this.poId,
                  partnerId: this.invs_p[0].partnerId,
                  requiredDate: this.requiredDateStr
                },
                signEntry: this.invs_p.map(m => {
                  return {
                    invId: m.invId,
                    price: m.price,
                    quantity: m.max,
                    factQuantity: m.count,
                    remark: m.remark
                  }
                }),
                context: this.context
              })
                .then(({ code, data, message }) => {
                  if (code == 200) {
                    let t = JSON.parse(getStorage(this.groupId + '_shopCar_P51_Dic'))
                    t.forEach(row => {
                      setStorage(row, '')
                    })
                    setStorage(this.groupId + '_shopCar_P51', '')
                    setStorage(this.groupId + '_shopCar_P51_Dic', '')
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
    const cacheData = getStorage(this.$route.query.group + '_shopCar_P51')
    if (cacheData != '') {
      if (id) {
        this.requiredDate = getStorage(this.$route.query.group + '_shopCar_P51_RequiredDate')
        getSign({ id })
          .then(({ code, data, message }) => {
            if (code == 200) {
              //
            } else {
              this.$toast({ type: 'fail', message: '未能查询到订单详情!' })
            }
          })
          .catch(() => {
            this.$toast({ type: 'fail', message: '查询订单详情发生错误!' })
          })
      }

      this.invs_p = JSON.parse(cacheData).map(m => {
        this.poId = m.id
        m.remark = m.remark || ''
        m.amount = floatMul(m.price, m.count).toFixed(2)
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