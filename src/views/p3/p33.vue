<template>
  <div class="root">
    <div class="vcr">
      <van-cell-group title="报价有效期">
        <van-cell title="开始日期" :value="startDateStr" />
        <van-cell title="结束日期" :value="endDateStr" />
      </van-cell-group>

      <van-cell-group>
        <template #title>
          <span>报价单详情</span>
        </template>

        <van-cell :label="v.specification" v-for="(v, a) in invs_p" :key="a">
          <template #title>
            <span class="custom-title">{{ v.name }}</span>
            <van-tag type="danger">{{ v.unitname }}</van-tag>
          </template>
          <template #label>
            <van-field
              disabled
              :ref="'input_' + '_' + v.id"
              :id="'input_' + '_' + v.id"
              v-model="v.priceCurrent"
              type="number"
              label="本期报价"
              autocomplete="off"
            />
            <van-field
              :disabled="haveStatus"
              :ref="'input_' + '_' + v.id"
              :id="'input_' + '_' + v.id"
              v-model="v.priceCurrentConfirm"
              type="number"
              label="确认报价"
              autocomplete="off"
              @blur="onBlur(v, a)"
              @focus="onFocus(v, a)"
            />
          </template>
          <template>
            <span>规格：{{ v.specification == '' ? '-' : v.specification }}</span>
          </template>
        </van-cell>
      </van-cell-group>

      <div style="margin: 16px">
        <van-button v-if="!haveStatus" round block type="info" @click="submit">提交</van-button>
      </div>
    </div>
  </div>
</template>
<script>
import { mounted } from '@/mix/mounted.js'
import { getPartnerAsk, savePac, confirm } from '@/api/xj.js'

import dayjs from 'dayjs'
export default {
  mixins: [mounted],
  name: `p33`,
  data() {
    return {
      haveStatus: true,
      isDeleted: true,
      invs_p: [],
      startDateStr: '',
      endDateStr: '',
      partnerId: '-1'
    }
  },
  asyncComputed: {
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
    id() {
      return this.$route.query.id
    }
  },
  watch: {
    partnerId(newVal) {
      if (newVal != '-1') {
        getPartnerAsk({ id: this.$route.query.id, partnerId: newVal }).then(({ code, data, message }) => {
          if (code == 200) {
            this.startDateStr = dayjs(data[0].startDate).format('YYYY-MM-DD')
            this.endDateStr = dayjs(data[0].endDate).format('YYYY-MM-DD')

            this.isDeleted = data[0].isDeleted == 1
            if (this.isDeleted) {
              this.$dialog.alert({
                title: '提示',
                message: `当前报价单已经被删除，无法报价!`
              })
            } else {
              this.haveStatus = data[0].status == 1
              this.invs_p = data

              if (this.haveStatus == 0) {
                confirm(
                  this.invs_p.map(m => {
                    return { id: m.id, entryId: m.entryId }
                  })
                )
              }
            }
          }
        })
      }
    }
  },
  methods: {
    onFocus(inv, index) {
      if (Number(inv.priceCurrentConfirm) == 0) {
        inv.priceCurrentConfirm = ''
      }
      this.$set(this.invs_p, index, inv)
    },
    onBlur(inv, index) {
      if (inv.priceCurrentConfirm == '') {
        inv.priceCurrentConfirm = '0.00'
        this.$set(this.invs_p, index, inv)
      }
    },
    beforeSave() {
      return !this.invs_p.map(m => m.priceCurrentConfirm).some(s => Number(s) <= 0)
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
              savePac(
                this.invs_p.map(m => {
                  return {
                    Id: m.id,
                    EntryId: m.entryId,
                    priceCurrentConfirm: m.priceCurrentConfirm
                  }
                })
              )
                .then(({ code, data, message }) => {
                  this.$dialog
                    .alert({
                      title: '提示',
                      message: message
                    })
                    .then(() => {
                      if (code == 200) {
                        this.$router.go(-1)
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
      } else {
        this.$toast({ type: 'fail', message: '发现异常价格，请核实!' })
      }
    }
  },
  mounted() {
    const id = this.$route.query.id
    if (id == '' || id == void 0) {
      this.$dialog
        .alert({
          title: '提示',
          message: '未能查询到报价单,禁止操作!'
        })
        .then(() => {})
    }
    this.partnerId = this.$route.query.partnerId
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