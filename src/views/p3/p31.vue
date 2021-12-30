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
            <number-input :disabled="haveStatus" :ref="'input_' + '_' + v.id" :id="'input_' + '_' + v.id" v-model="v.priceCurrent" type="number" label="本期报价" autocomplete="off" @blur="onBlur(v, a)" @focus="onFocus(v, a)" />
            <number-input v-if="v.showConfirm" :disabled="haveStatus" :ref="'input_' + '_' + v.id" :id="'input_' + '_' + v.id" v-model="v.priceCurrentConfirm" type="number" label="本期确认报价" autocomplete="off" @blur="onBlur(v, a)" @focus="onFocus(v, a)" />
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
import { mapGetters } from 'vuex'
import { getPartnerAsk, savePa, confirm } from '@/api/xj.js'
import dayjs from 'dayjs'
import NumberInput from '@/components/NumberInput'
export default {
  mixins: [mounted],
  name: `p31`,
  components: {
    NumberInput
  },
  data() {
    return {
      haveStatus: true,
      invs_p: [],
      startDateStr: '',
      endDateStr: ''
    }
  },
  computed: { ...mapGetters(['userName', 'partnerId']) },
  asyncComputed: {
    async total() {
      return this.invs_p.length > 0
        ? this.invs_p
          .map(f => 1)
          .reduce(function(prev, next, index, array) {
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
  methods: {
    onFocus(inv, index) {
      if (Number(inv.priceCurrent) == 0) {
        inv.priceCurrent = ''
      }
      this.$set(this.invs_p, index, inv)
    },
    onBlur(inv, index) {
      if (inv.priceCurrent == '') {
        inv.priceCurrent = '0.00'
        this.$set(this.invs_p, index, inv)
      }
    },
    beforeSave() {
      return !this.invs_p.map(m => m.priceCurrent).some(s => Number(s) <= 0)
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
              savePa(
                this.invs_p.map(m => {
                  return {
                    Id: m.id,
                    PartnerId: this.partnerId,
                    EntryId: m.entryId,
                    PriceCurrent: m.priceCurrent
                  }
                })
              )
                .then(({ code, data, message }) => {
                  this.$dialog
                    .alert({
                      title: '提示',
                      message: code == 200 ? `提交成功!` : message
                    })
                    .then(() => {
                      if (code == 200) {
                        this.$router.replace({
                          path:`/p30`
                        })
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
          .catch(() => { })
      } else {
        this.$toast({ type: 'fail', message: '发现异常价格，请核实!' })
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      getPartnerAsk({ id: this.id, partnerId: this.partnerId }).then(({ code, data, message }) => {
        if (code == 200) {
          this.startDateStr = dayjs(data[0].startDate).format('YYYY-MM-DD')
          this.endDateStr = dayjs(data[0].endDate).format('YYYY-MM-DD')
          this.haveStatus = data[0].status == 1 || data[0].priceCurrentConfirm > 0 //采购录完确认价则不允许编辑
          this.invs_p = data.map(m => {
            if(data[0].status != 1 || Number(m.priceCurrent) <= 0){
              m.priceCurrent = m.priceLastConfirm
            }
            m.showConfirm = Number(m.priceCurrentConfirm) > 0
            return m
          })

          if (this.haveStatus == 0) {
            confirm(
              this.invs_p.map(m => {
                return { id: m.id, entryId: m.entryId }
              })
            )
          } else {
            this.$toast({ type: 'fail', message })
          }
        }
      })
    })
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