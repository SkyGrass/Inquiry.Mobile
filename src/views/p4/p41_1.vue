<template>
  <div class="root">
    <div class="vcr">
      <van-cell-group title="用户信息">
        <van-cell title="制单人" :value="userName" />
        <van-cell title="日期" :value="curDateStr" />
      </van-cell-group>

      <van-cell-group title="送货信息">
        <van-cell title="申购日期" :value="askDateStr" />
        <van-cell title="送货日期" :value="requiredDateStr" is-link @click="showDateVisiable = true" />
      </van-cell-group>

      <van-cell-group :title="'订单信息 部门:' + inv.deptName" v-for="(inv, index) in invs_p" :key="index">
        <van-cell :label="inv.specification">
          <template #title>
            <span class="custom-title">{{ inv.name }}</span>
            <van-tag type="danger" style="margin-left: 5px">{{ inv.unitname }}</van-tag>
          </template>
          <template #label>
            <p class="custom-title">规格:{{ inv.specification }}</p>
            <van-cell v-for="p in inv.partners" :key="p.partnerId">
              <template #title>
                <span class="custom-title">{{ p.partnerName }}</span>
              </template>
              <template #label>
                <p class="custom-title">单价:{{ p.price }}</p>
                <p class="custom-title">总价:{{ calc(p.price, p.count) }}</p>
              </template>
              <template #extra>
                <p>{{ p.count }}</p>
              </template>
            </van-cell>
          </template>
        </van-cell>
      </van-cell-group>

      <div style="margin: 16px">
        <van-button round block type="info" @click="submit">提交</van-button>
        <van-button style="margin-top: 5px" v-if="!newBill" round block type="danger" @click="del">作废</van-button>
      </div>

      <van-popup v-model="showDateVisiable" round position="bottom" :style="{ height: '40%' }">
        <van-datetime-picker
          @confirm="showDateVisiable = false"
          @cancel="showDateVisiable = false"
          v-model="requiredDate"
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
import { saveMuilt } from '@/api/po.js'
import { floatMul, copyObj, groupBy } from '@/utils'
export default {
  mixins: [mounted],
  name: `p41_1`,
  data() {
    return {
      id: -1,
      activeNames: ['0'],
      askDate: dayjs(this.$route.query.date).toDate(),
      requiredDate: dayjs(this.$route.query.date).toDate(),
      invs_p: [],
      showDateVisiable: false,
      entry: []
    }
  },
  asyncComputed: {
    ...mapGetters(['userName', 'billerId']),

    async groupId() {
      return this.$route.query.group || ''
    },
    async newBill() {
      return (this.id = -1)
    },
    async curDateStr() {
      return dayjs(new Date()).format('YYYY-MM-DD')
    },
    async requiredDateStr() {
      return dayjs(this.requiredDate).format('YYYY-MM-DD')
    },
    async askDateStr() {
      return dayjs(this.askDate).format('YYYY-MM-DD')
    },
    id() {
      return this.$route.query.id
    }
  },
  methods: {
    calc(x, y) {
      return floatMul(x, y)
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
            saveMuilt(
              this.entry.map((m, i) => {
                return {
                  po: {
                    billerId: this.billerId,
                    billNo: this.groupId + '-' + (i + 1),
                    date: this.curDateStr,
                    partnerId: m[0].partnerId,
                    askDate: this.askDateStr,
                    requiredDate: this.requiredDateStr
                  },
                  poEntry: m.map(f => {
                    return {
                      invId: f.id,
                      price: f.price,
                      quantity: f.count,
                      unitname: f.unitname,
                      deptId: f.deptId,
                      remark: ''
                    }
                  }),
                  context: [
                    {
                      name: this.$route.query.group + '_P41_ShopCar_' + m[0].partnerId,
                      entry: m.map(g => {
                        return {
                          invId: g.id,
                          deptId: g.deptId,
                          price: g.price,
                          quantity: g.count,
                          remark: '',
                          partnerId: g.partnerId,
                          partnerName: m[0].partnerName
                        }
                      })
                    }
                  ]
                }
              })
            )
              .then(({ code, data, message }) => {
                if (code == 200) {
                  setStorage(this.groupId + '_P41_ShopCar_Invs', '')
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
          })
          .catch(() => {})
      }
    }
  },
  mounted() {
    const cacheData = getStorage(this.$route.query.group + '_P41_ShopCar_Invs')
    if (cacheData != '') {
      this.invs_p = JSON.parse(cacheData).map(m => {
        m.partners = m.partners.filter(f => f.count > 0)
        return m
      })

      let entry = []
      copyObj(this.invs_p).forEach(f => {
        f.partners.forEach(ff => {
          delete f.partners
          entry.push(Object.assign({}, f, ff))
        })
      })

      this.entry = groupBy(entry, 'partnerId')
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