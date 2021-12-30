<template>
  <div>
    <van-row class="partner">
      <van-col span="24">
        <van-cell title="请选择供应商" is-link :value="curPartnerName" @click="partnerVisable = true"></van-cell>
      </van-col>
    </van-row>
    <van-row class="date">
      <van-col span="24">
        <van-cell title="请选择采购订单" is-link :value="currentOrderBillNo" @click="chooseOrder"></van-cell>
      </van-col>
    </van-row>
    <van-row class="date">
      <van-col span="24">
        <van-cell title="到货日期" :value="currentDateStr"></van-cell>
      </van-col>
    </van-row>
    <van-row class="root">
      <van-col span="24" class="right">
        <van-empty image="search" description="选择供应商和日期查询采购记录" v-if="invs.length <= 0" />
        <div :id="'_' + inv.clsId + '_' + inv.invId" class="title van-cell-group__tit1e" v-for="(inv, i) in invs_p" :key="i">
          <!-- <div style="margin: 10px">{{ d.clsName }}</div> -->
          <van-cell :label="inv.specification">
            <template #title>
              <span class="custom-title">{{ inv.name }}</span>
              <van-tag type="danger" style="margin-left: 5px">{{ inv.unitname }}</van-tag>
              <van-tag type="danger" style="margin-left: 5px">{{ inv.deptName }}</van-tag>
            </template>
            <template #label>
              <!--<p class="custom-title">规格:{{ inv.specification == '' ? '-' : inv.specification }}</p>-->

              <van-field v-model="inv.price" type="number" label="单价" readonly/>
              <number-input v-model="inv.count" label="数量" />
              <van-field label="缺货">
                <template #input>
                  <van-checkbox v-model="inv.isDiff" shape="square" />
                </template>
              </van-field>
              <van-field clearable :disabled="!inv.isDiff" v-model="inv.remark" rows="1" autosize label="说明" type="textarea" placeholder="请输入缺货说明" />
            </template>
            <!-- <template #extra>
                      <van-stepper :disabled="!canUse" @plus="onPlus(i + '_' + inv.clsId + '_' + inv.invId + '_' + inv.deptId + '_q')" 
                                                        @minus="onMinus(i + '_' + inv.clsId + '_' + inv.invId+ '_' + inv.deptId  + '_q')" v-model="inv.count" theme="round" min="0" :max="inv.max" />
                                                </template>-->
          </van-cell>
        </div>
      </van-col>
    </van-row>
    <van-goods-action>
      <van-goods-action-button type="danger" :disabled="!canSave" text="提交保存" @click="onClickSubmit" />
    </van-goods-action>

    <van-popup v-model="showOrder" round position="bottom" :style="{ height: '40%' }">
      <van-picker show-toolbar title="采购订单" @cancel="showOrder = false" @confirm="onConfirmBillNo" :columns="billNoList" :default-index="0" />
    </van-popup>

    <van-popup v-model="partnerVisable" safe-area-inset-bottom round position="bottom" :style="{ height: '80%' }">
      <van-tabs v-model="active">
        <van-tab title="供应商列表">
          <van-search v-model="keyword" placeholder="请输入搜索关键词" show-action @blur="onSearchBlur" @search="onSearch" @cancel="onCancel" />
          <van-list :finished="finished" finished-text="没有更多了">
            <van-cell v-for="item in partners" :key="item.id" :title="item.name">
              <template>
                <van-button :disabled="item.isChoose" @click="onClickChoose(item)" :type="item.isChoose ? '' : 'primary'" size="small">选取</van-button>
              </template>
            </van-cell>
          </van-list>
        </van-tab>
      </van-tabs>
    </van-popup>
  </div>
</template>

<script>
import { getPartners } from '@/api/home.js'
import { getPoBillNoList } from '@/api/po.js'
import { getSignDetail } from '@/api/sign.js'
import { mounted } from '@/mix/mounted.js'
import { mapGetters } from 'vuex'
import { setStorage, getStorage, copyObj } from '@/utils/index.js'
import dayjs from 'dayjs'
import NumberInput from '@/components/NumberInput'
export default {
  name: `p51`,
  mixins: [mounted],
  components: {
    NumberInput
  },
  data() {
    return {
      partners: [],
      partners_copy: [],
      active: 0,
      invs: [],
      invs_p: [],
      partnerVisable: false,
      finished: false,
      keyword: '',
      curPartnerId: '',
      curPartnerName: '',
      minDate: new Date(),
      currentDateStr: "",
      currentOrderBillNo: "",
      showOrder: false,
      billNos: [],
    }
  },
  asyncComputed: {
    async partners_p() {
      return this.partners_copy.filter(f => f.isChoose == true)
    },
    async canUse() {
      return this.partners.filter(f => f.isChoose == true).length > 0
    },
    async groupId() {
      return this.$route.query.group || ''
    },
    async id() {
      return this.$route.query.id || void 0
    },
    async billNoList() {
      //return this.billNos.map(m => `${m.billNo}(${m.requiredDate})`);
      return this.billNos.map(m => `${m.billNo}`);
    }
  },
  watch: {
    curPartnerId() {
      this.onClickClear()
      //this.getDetail()
      this.getOrderBillNo();
    }
  },
  methods: {
    chooseOrder() {
      if (this.curPartnerId == '') {
        this.$toast({ type: 'fail', message: '请先选择供应商!' })
      } else {
        this.showOrder = true
      }
    },
    onConfirmBillNo(value, index) {
      this.currentOrderBillNo = this.billNos[index].billNo
      this.currentDateStr = this.billNos[index].requiredDate
      this.showOrder = false
      this.getDetail(this.billNos[index].id)
    },
    clearCache(success) {
      this.partners_p.forEach(({ id }) => {
        setStorage(this.groupId + '_P51_ShopCar_' + id, '')
      })
      setStorage(this.groupId + '_shopCar_P51', '')
      setStorage(this.groupId + '_shopCar_P51_Dic', '')
      success && success()
    },
    getOrderBillNo() {
      if (this.curPartnerId == '') {
        this.$toast({ type: 'fail', message: '请先选择供应商!' })
      }
      else {
        getPoBillNoList({ partnerId: this.curPartnerId }).then(({ code, message, data }) => {
          this.billNos = data.map(m => {
            m.requiredDate = dayjs(m.requiredDate).format("YYYY-MM-DD")
            return m;
          })
          if (data.length > 0) {
            this.currentDateStr = data[0].requiredDate
            this.currentOrderBillNo = data[0].billNo

            this.getDetail(data[0].id)
          }
        })
      }
    },
    getDetail(orderId) {
      if (this.curPartnerId == '') return
      this.invs = []
      getSignDetail({ orderId }).then(({ code, message, data }) => {
        if (code == 200) {
          if (this.curPartnerId == '') {
            this.$toast({ type: 'fail', message: '请先选择供应商' })
          }
          let carInfo1 = getStorage(this.groupId + '_shopCar_P51')
          if (carInfo1 != '') {
            carInfo1 = JSON.parse(carInfo1).map(m => {
              m.count = m.factQuantity
              return m
            })
          }
          this.invs = copyObj(data).map(m => {
            m.partnerId = this.curPartnerId
            m.partnerName = this.curPartnerName
            m.price = Number(m.price).toFixed(2)
            m.max = m.count
            if (carInfo1.length > 0) {
              let t = copyObj(carInfo1).filter(f => f.invId == m.invId && f.deptId == m.deptId)[0]
              if (t) {
                m.count = t.count
                m.isDiff = t.isDiff
                m.remark = t.remark
              } else {
                m.count = 0
              }
            }
            return m
          })
          this.invs_p = copyObj(data).map(m => {
            m.partnerId = this.curPartnerId
            m.partnerName = this.curPartnerName
            m.price = Number(m.price).toFixed(2)
            m.max = m.count
            if (carInfo1.length > 0) {
              let t = copyObj(carInfo1).filter(f => f.invId == m.invId && f.deptId == m.deptId)[0]
              if (t) {
                m.count = t.count
                m.isDiff = t.isDiff
                m.remark = t.remark
              } else {
                m.count = 0
              }
            }
            return m
          })

        }
      })
    },
    onChangeCount(value, name) {
      if (this.curPartnerId == '') {
        return this.$toast({ type: 'fail', message: '请先添加供应商,再添加存货!' })
      } else {
        const invId = name.split('_')[2]
        const deptId = name.split('_')[3]
        const f = name.split('_')[4]

        const invIndex = this.invs_p.findIndex(f => f.invId == invId && f.deptId == deptId)
        if (invIndex > -1) {
          const tt = copyObj(this.invs_p.filter(f => f.invId == invId && f.deptId == deptId)[0])
          tt.count += value

          if (tt.count == 0) {
            this.invs_p.splice(invIndex, 1)
          } else {
            this.$set(this.invs_p, invIndex, tt)
          }
        }
      }
    },
    onPlus(name) {
      this.onChangeCount(1, name)
    },
    onMinus(name) {
      this.onChangeCount(-1, name)
    },
    onSearchBlur() {
      this.onSearch(this.keyword)
    },
    onSearch(val) {
      this.partners = this.partners_copy.filter(
        f => f.chinaname.indexOf(val.toUpperCase()) > -1 || f.name.indexOf(val) > -1 || f.code.indexOf(val) > -1
      )
    },
    onCancel() {
      this.partners = this.partners_copy
    },

    onClickChoose(partner) {
      const { id, name } = partner
      const index = this.partners.findIndex(f => f.id == id)

      this.curPartnerId = id
      this.curPartnerName = name

      this.partners.forEach((p, i) => {
        p.isChoose = i == index
        this.$set(this.partners, i, p)
      })
      this.partners_copy.forEach((p, i) => {
        p.isChoose = p.id == id
        this.$set(this.partners_copy, i, p)
      })
      this.partnerVisable = false
    },
    onClickClear() {
      this.invs_p = []
      this.invs.forEach((inv, index) => {
        inv.count = 0
        this.$set(this.invs, index, inv)
      })
    },
    onClickPartners() {
      this.partnerVisable = true
    },
    onClickSubmit() {
      if (this.invs_p.length <= 0) {
        this.$toast({ type: 'fail', message: '请先添加商品' })
      } else {
        setStorage(this.groupId + '_P51_ShopCar_' + this.curPartnerId, JSON.stringify(this.invs_p.filter(f => f.count > 0)))

        let tmp = [],
          dic = []
        this.partners_p.forEach(({ id }) => {
          let t = getStorage(this.groupId + '_P51_ShopCar_' + id)
          dic.push(this.groupId + '_P51_ShopCar_' + id)
          if (t != null && t != '') {
            tmp = tmp.concat(JSON.parse(t))
          }
        })
        setStorage(this.groupId + '_shopCar_P51', JSON.stringify(tmp))
        setStorage(this.groupId + '_shopCar_P51_Dic', JSON.stringify(dic))
        this.$router.push({ path: '/p51_1', query: { date: this.currentDateStr, group: this.groupId, id: this.id } })
      }
    }
  },
  computed: {
    ...mapGetters(['canSave'])
  },
  mounted() {
    if (this.$route.query.id) {
      if (this.$route.query.partnerId) {
        this.curPartnerId = this.$route.query.partnerId
      }
    }
    getPartners().then(({ code, data, message }) => {
      if (code == 200) {
        let carInfo = getStorage(this.groupId + '_shopCar_P51')

        if (carInfo != '') {
          carInfo = JSON.parse(carInfo)
          carInfo = Array.from(new Set(carInfo.map(f => f.partnerId)))
          if (carInfo.length > 0) {
            this.curPartnerId = carInfo[0]
            this.curPartnerName = data.filter(f => f.id == this.curPartnerId)[0].name
          }
        } else {
          carInfo = []
        }
        if (this.curPartnerId != '') {
          let t = getStorage(this.groupId + '_P51_ShopCar_' + this.curPartnerId)
          if (t != '') this.invs_p = JSON.parse(t)
        }

        this.partners = data.map(m => {
          m.isChoose = carInfo.findIndex(f => f == m.id) > -1
          return m
        })
        this.partners_copy = data.map(m => {
          m.isChoose = carInfo.findIndex(f => f == m.id) > -1
          return m
        })
      }
      this.finished = true
    })
  }
}
</script>

<style lang="scss" scoped>
.partner {
  margin-top: 44px;
}

.root {
  position: absolute;
  left: 0;
  right: 0;
  top: 170px;
  bottom: 50px;
  overflow: hidden;
  height: calc(100vh - 150px);
  .left {
    height: 100%;
    overflow: scroll;
     ::-webkit-scrollbar {
      display: none;
    }
    .menu {
      width: 100%;
      .item {
        font-size: 18px;
      }
    }
  }
  .right {
    height: 100%;
    overflow: scroll;
     ::-webkit-scrollbar {
      display: none;
    }
    .title {
      font-size: 18px;
    }
  }
}
</style>