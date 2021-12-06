<template>
  <div>
    <van-row class="partner">
      <van-col span="24">
        <van-cell title="请选择供应商" is-link :value="curPartnerName" @click="partnerVisable = true"></van-cell>
      </van-col>
    </van-row>
    <van-row class="date">
      <van-col span="24">
        <van-cell title="请选择到货日期" is-link :value="currentDateStr" @click="chooseDate"></van-cell>
      </van-col>
    </van-row>
    <van-row class="root">
      <van-col span="24" class="right">
        <van-empty image="search" description="选择供应商和日期查询采购记录" v-if="invs.length <= 0" />
        <div
          :id="'_' + inv.clsId + '_' + inv.invId"
          class="title van-cell-group__tit1e"
          v-for="(inv, i) in invs"
          :key="inv.invId"
        >
          <!-- <div style="margin: 10px">{{ d.clsName }}</div> -->
          <van-cell :label="inv.specification">
            <template #title>
              <span class="custom-title">{{ inv.name }}</span>
              <van-tag type="danger" style="margin-left: 5px">{{ inv.unitname }}</van-tag>
            </template>
            <template #label>
              <span class="custom-title">规格:{{ inv.specification == '' ? '-' : inv.specification }}</span>
              <span class="custom-title">单价:{{ inv.price }}</span>
            </template>
            <template #extra>
              <van-stepper
                :disabled="!canUse"
                @plus="onPlus(i + '_' + inv.clsId + '_' + inv.invId + '_q')"
                @minus="onMinus(i + '_' + inv.clsId + '_' + inv.invId + '_q')"
                v-model="inv.count"
                theme="round"
                min="0"
                :max="inv.max"
                integer
              />
            </template>
          </van-cell>
        </div>
      </van-col>
    </van-row>
    <van-goods-action>
      <van-goods-action-button type="danger" :disabled="!canSave" text="提交保存" @click="onClickSubmit" />
    </van-goods-action>
    <van-popup v-model="showDate" round position="bottom" :style="{ height: '40%' }">
      <van-datetime-picker
        :min-date="minDate"
        @confirm="confirmDate"
        @cancel="showDate = false"
        v-model="currentDate"
        type="date"
        title="选择年月日"
      />
    </van-popup>

    <van-popup v-model="partnerVisable" safe-area-inset-bottom round position="bottom" :style="{ height: '80%' }">
      <van-tabs v-model="active">
        <van-tab title="供应商列表">
          <van-search
            v-model="keyword"
            placeholder="请输入搜索关键词"
            show-action
            @blur="onSearchBlur"
            @search="onSearch"
            @cancel="onCancel"
          />
          <van-list :finished="finished" finished-text="没有更多了">
            <van-cell v-for="item in partners" :key="item.id" :title="item.name">
              <template>
                <van-button
                  :disabled="item.isChoose"
                  @click="onClickChoose(item)"
                  :type="item.isChoose ? '' : 'primary'"
                  size="small"
                  >选取</van-button
                >
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
import { getSignDetail } from '@/api/sign.js'
import { mounted } from '@/mix/mounted.js'
import { mapGetters } from 'vuex'
import { setStorage, getStorage } from '@/utils/index.js'
import dayjs from 'dayjs'
export default {
  name: `p51`,
  mixins: [mounted],
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
      currentDate: new Date(),
      showDate: false,
      cache: {}
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
    async currentDateStr() {
      return dayjs(this.currentDate).format('YYYY-MM-DD')
    }
  },
  watch: {
    curPartnerId() {
      this.onClickClear()
      this.getDetail()
    }
  },
  methods: {
    chooseDate() {
      this.showDate = true
    },
    confirmDate() {
      this.showDate = false
      this.$dialog
        .confirm({
          title: '提示',
          message: '切换日期将重置数据,是否继续?'
        })
        .then(() => {
          this.clearCache(() => {
            this.getDetail()
          })
        })
    },
    clearCache(success) {
      this.partners_p.forEach(({ id }) => {
        setStorage(this.groupId + '_P51_ShopCar_' + id, '')
      })
      setStorage(this.groupId + '_shopCar_P51', '')
      setStorage(this.groupId + '_shopCar_P51_Dic', '')
      success && success()
    },
    getDetail() {
      if (this.curPartnerId == '') return
      this.invs = []
      getSignDetail({ date: this.currentDateStr, partnerId: this.curPartnerId }).then(({ code, message, data }) => {
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

          this.invs = JSON.parse(JSON.stringify(data)).map(m => {
            m.partnerId = this.curPartnerId
            m.partnerName = this.curPartnerName
            m.price = Number(m.price).toFixed(2)
            m.max = m.count
            if (carInfo1.length > 0) {
              let t = carInfo1.filter(f => f.invId == m.invId)[0]
              if (t) {
                m.count = t.count
              } else {
                m.count = 0
              }
            }
            return m
          })
          this.invs_p = JSON.parse(JSON.stringify(data)).map(m => {
            m.partnerId = this.curPartnerId
            m.partnerName = this.curPartnerName
            m.price = Number(m.price).toFixed(2)
            m.max = m.count
            if (carInfo1.length > 0) {
              let t = carInfo1.filter(f => f.invId == m.invId)[0]
              if (t) {
                m.count = t.count
              } else {
                m.count = 0
              }
            }
            return m
          })
          this.cache = data.map(m => {
            let c = 0
            m.max = m.count
            this.partners_p
              .filter(f => f.id != this.curPartnerId)
              .forEach(({ id }) => {
                let t = getStorage(this.groupId + '_P51_ShopCar_' + id)
                if (t != '') {
                  t = JSON.parse(t)

                  c += t
                    .filter(f => f.invId == m.invId)
                    .map(f => f.count)
                    .reduce(function (prev, next, index, array) {
                      return prev + next
                    })
                }
              })

            return {
              id: m.invId,
              max: m.max,
              cur: this.invs.filter(f => f.invId == m.invId)[0].count + c
            }
          })
        }
      })
    },
    onChangeCount(value, name) {
      if (this.curPartnerId == '') {
        return this.$toast({ type: 'fail', message: '请先添加供应商,再添加存货!' })
      } else {
        const id = name.split('_')[1]
        const invId = name.split('_')[2]
        const f = name.split('_')[3]

        const invIndex = this.invs_p.findIndex(f => f.invId == invId)
        const inv = this.invs.filter(f => f.invId == invId)[0]
        if (invIndex < 0) {
          this.invs_p.push(
            Object.assign(
              {},
              { partnerId: this.curPartnerId, partnerName: this.curPartnerName },
              { cid: id, id: invId },
              inv,
              { count: value }
            )
          )
        } else {
          const tt = this.invs_p.filter(f => f.invId == invId)[0]
          tt.count += value

          if (tt.count == 0) {
            this.invs_p.splice(invIndex, 1)
          } else {
            this.$set(this.invs_p, invIndex, tt)
          }
        }
        if (f == 'p') {
          let i = this.invs.findIndex(f => f.invId == invId)
          if (i > -1) {
            let ttt = this.invs.filter(f => f.invId == invId)[0]
            ttt.count += value
            this.$set(this.invs, i, ttt)
          }
        }
        let cache = this.cache.filter(f => f.id == invId)[0]
        cache.cur += value
        let cacheIdex = this.cache.findIndex(f => f.id == invId)
        this.$set(this.cache, cacheIdex, cache)
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
    onClickPartner(partner) {
      const { id, name } = partner
      setStorage(this.groupId + '_P51_ShopCar_' + this.curPartnerId, JSON.stringify(this.invs_p))

      this.curPartnerId = id
      this.curPartnerName = name

      this.invs_p = JSON.parse(
        getStorage(this.groupId + '_P51_ShopCar_' + id) == null || getStorage(this.groupId + '_P51_ShopCar_' + id) == ''
          ? '[]'
          : getStorage(this.groupId + '_P51_ShopCar_' + id)
      )
      this.invs.forEach((inv, index) => {
        let t = this.cache.filter(f => f.invId == inv.id)[0]
        let t1 = this.invs_p.filter(f => f.invId == inv.id)[0]
        inv.count = t1 ? t1.count : 0
        inv.max = t.max - t.cur == 0 ? inv.count : t.max - t.cur + inv.count
        this.$set(this.invs, index, inv)
      })
    },
    onClickRemove(partner) {
      const { id } = partner
      const index = this.partners.findIndex(f => f.id == id)
      let p = this.partners[index]
      p.isChoose = false
      this.$set(this.partners, index, p)

      let cp = this.partners_copy[index]
      cp.isChoose = false
      this.$set(this.partners_copy, index, cp)
      if (p.id == this.curPartnerId) {
        if (this.partners_p.length > 1) {
          this.curPartnerId = this.partners_p[0].id
          this.curPartnerName = this.partners_p[0].name
        } else {
          this.curPartnerId = ''
          this.curPartnerName = ''
        }
      }
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
        setStorage(this.groupId + '_P51_ShopCar_' + this.curPartnerId, JSON.stringify(this.invs_p))

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
  top: 140px;
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