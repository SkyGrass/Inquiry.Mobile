<template>
  <div class="root">
    <div class="vcr">
      <van-notice-bar left-icon="volume-o" background="#e6e6e6e6" :text="description" />
      <van-notice-bar left-icon="volume-o" background="#e6e6e6e6" :text="'状态：' + readflg" />
      <van-cell-group title="用户信息">
        <van-cell title="制单人" :value="userName" />
        <van-cell title="制单日期" :value="date" />
      </van-cell-group>

      <van-cell-group title="送货信息">
        <van-cell title="申购日期" :value="askDateStr" />
        <van-cell title="送货日期" :value="requiredDateStr" />
      </van-cell-group>

      <van-cell-group>
        <template #title>
          <span>采购单详情</span>
        </template>
        <van-collapse v-model="activeNames">
          <van-collapse-item :name="i" :title="c.partnerName" v-for="(c, i) in cars" :key="i">
            <van-cell :label="v.specification" v-for="(v, a) in c.invs" :key="a">
              <template #title>
                <span class="custom-title">{{ v.name }}</span>
                <van-tag type="danger">{{ v.unitname }}</van-tag>
                <van-tag type="danger" style="margin-left: 4px">{{ v.deptName }}</van-tag>
              </template>
              <template #label>
                <van-field v-model="v.specification" label="规格" readonly />
                <van-field v-model="v.price" type="number" label="单价" readonly />
                <van-field v-model="v.count" type="number" label="数量" readonly />
                <van-field
                  readonly
                  :ref="'input_' + i + '_' + a"
                  :id="'input_' + i + '_' + a"
                  v-model="v.amount"
                  type="number"
                  autocomplete="off"
                  label="总价"
                />
                <!-- <van-field
                          readonly
                          v-model="v.remark"
                          rows="1"
                          autosize
                          label="其他说明"
                          type="textarea"
                          placeholder="请输入说明"
                        /> -->
              </template>
              <!--<template>
                        <span>规格：{{ v.specification == '' ? '-' : v.specification }}</span>
                      </template>-->
            </van-cell>
          </van-collapse-item>
        </van-collapse>
      </van-cell-group>

      <div style="margin: 16px">
        <van-row gutter="10">
          <van-col span="8">
            <van-button v-if="!isDeleted && !haveAudit" block type="danger" @click="del">作废</van-button>
          </van-col>
          <van-col span="8">
            <van-button v-if="!isDeleted && !haveAudit" block @click="change">修改</van-button>
          </van-col>

          <van-col span="8">
            <van-button v-if="!isDeleted && !haveAudit" block type="primary" @click="doAudit">审批</van-button>
          </van-col>

          <van-col span="8">
            <van-button v-if="!isDeleted && haveAudit" block type="danger" @click="doUnAudit">反审批</van-button>
          </van-col>
        </van-row>
      </div>
    </div>
  </div>
</template>
<script>
import { mounted } from '@/mix/mounted.js'
import { mapGetters } from 'vuex'
import dayjs from 'dayjs'
import { setStorage } from '@/utils/index.js'
import { getRecord, getPo, del, audit, unAudit } from '@/api/po.js'
import { floatMul } from '@/utils'
export default {
  mixins: [mounted],
  name: `p41_2`,
  data() {
    return {
      id: -1,
      isDeleted: 0,
      haveAudit: 0,
      userName: '',
      date: '',
      invs_p: [],
      message: '',
      activeNames: ['0'],
      groupId: '',
      askDateStr: '',
      requiredDateStr: '',
      partnerId: -1,
      readflg: '已读'
    }
  },
  asyncComputed: {
    ...mapGetters(['billerId']),
    async total_partner() {
      return Array.from(new Set(this.invs_p.map(f => f.partnerId))).length
    },
    async total() {
      return this.invs_p.length > 0
        ? this.invs_p
            .map(f => 1)
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
    async description() {
      if (this.isDeleted) {
        return '当前单据已作废'
      } else if (this.haveAudit) {
        return '当前单据已审批'
      } else {
        return '当前单据等待审批'
      }
    },
    id() {
      return this.$route.query.id
    }
  },
  methods: {
    change() {
      getRecord({ id: this.id }).then(({ code, data, message }) => {
        if (code == 200) {
          let t = [],
            t1 = []
          JSON.parse(data).forEach(row => {
            t.push(row.name)
            t1 = t1.concat(row.entry)
            setStorage(row.name, JSON.stringify(row.entry))
          })
          setStorage(this.groupId + '_shopCar_P41_Dic', JSON.stringify(t))
          setStorage(this.groupId + '_shopCar_P41', JSON.stringify(t1))
          setStorage(this.groupId + '_shopCar_P41_RequiredDate', this.askDateStr)
          this.$router.push({
            path: '/p41_S',
            query: {
              id: this.id,
              askDate: this.askDateStr,
              requiredDate: this.requiredDateStr,
              partnerId: this.partnerId,
              group: this.groupId
            }
          })
        }
      })
    },
    doAudit() {
      this.$dialog
        .confirm({
          title: '提示',
          message: '确定要审批当前单据吗?'
        })
        .then(() => {
          audit({
            id: this.id,
            userId: this.billerId,
            date: this.askDateStr
          })
            .then(({ code, data, message }) => {
              this.$dialog
                .alert({
                  title: '提示',
                  message: message
                })
                .then(() => {
                  this.$router.go(-1)
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
    doUnAudit() {
      this.$dialog
        .confirm({
          title: '提示',
          message: '确定要反审批当前单据吗?'
        })
        .then(() => {
          unAudit({
            id: this.id,
            userId: this.billerId,
            date: this.askDateStr
          })
            .then(({ code, data, message }) => {
              this.$dialog
                .alert({
                  title: '提示',
                  message: message
                })
                .then(() => {
                  this.$router.go(-1)
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
                  this.$router.go(-1)
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
    }
  },
  mounted() {
    const id = this.$route.query.id
    if (id) {
      getPo({ id })
        .then(({ code, data, message }) => {
          if (code == 200) {
            this.userName = data[0].billerName
            this.isDeleted = data[0].isDeleted == 1
            this.haveAudit = data[0].status == 1
            this.groupId = data[0].billNo.replace('Po', '')
            this.date = dayjs(data[0].date).format('YYYY-MM-DD')
            this.partnerId = data[0].partnerId

            this.readflg = data[0].readflag
            this.askDateStr = dayjs(data[0].askDate).format('YYYY-MM-DD')
            this.requiredDateStr = dayjs(data[0].requiredDate).format('YYYY-MM-DD')
            this.invs_p = data.map(m => {
              m.count = m.quantity
              m.amount = floatMul(m.price, m.count).toFixed(2)
              return m
            })
          } else {
            this.$toast({ type: 'fail', message: '未能查询到订单详情!' })
          }
        })
        .catch(() => {
          this.$toast({ type: 'fail', message: '查询订单详情发生错误!' })
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