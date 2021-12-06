<template>
  <div>
    <van-row class="partner">
      <van-col span="24">
        <van-cell title="请选择大类" is-link :value="currentCls" @click="partnerClsVisable = true"></van-cell>
      </van-col>
    </van-row>
    <van-row class="date">
      <van-col span="24">
        <van-cell title="请选择日期" is-link :value="currentDateStr" @click="chooseDate"></van-cell>
      </van-col>
    </van-row>
    <van-row class="root">
      <van-col span="24" class="right">
        <van-empty image="search" description="选择供应商和日期查询申请记录" v-if="invs.length <= 0" />
        <div
          :id="'_' + inv.clsId + '_' + inv.id"
          class="title van-cell-group__tit1e"
          v-for="(inv, i) in invs"
          :key="inv.id"
        >
          <!-- <div style="margin: 10px">{{ d.clsName }}</div> -->
          <van-cell :label="inv.specification">
            <template #title>
              <span class="custom-title">{{ inv.name }}</span>
              <van-tag type="danger" style="margin-left: 5px">{{ inv.unitname }}</van-tag>
            </template>
            <template #label>
              <van-cell v-for="(p, pi) in inv.partners" :key="p.partnerId">
                <template #title>
                  <span class="custom-title">{{ p.partnerName }}</span>
                </template>
                <template #label>
                  <p class="custom-title">单价:{{ p.price }}</p>
                  <p class="custom-title">总价:{{ calc(p.price, p.count) }}</p>
                </template>
                <template #extra>
                  <van-stepper
                    :disabled="p.price == 0"
                    @plus="onPlus1(i + '_' + pi + '_' + p.partnerId + '_' + inv.id + '_q')"
                    @minus="onMinus1(i + '_' + pi + '_' + p.partnerId + '_' + inv.id + '_q')"
                    v-model="p.count"
                    theme="round"
                    min="0"
                    :max="inv.count"
                    integer
                  />
                </template>
              </van-cell>
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
    <van-popup v-model="carVisiable" safe-area-inset-bottom round position="bottom" :style="{ height: '80%' }">
      <van-empty image="search" description="购物车内没有东西" v-if="cars && cars.length <= 0" />
      <van-cell-group :title="c.clsName" v-for="(c, i) in cars" :key="i">
        <van-cell :label="v.specification" v-for="(v, a) in c.invs" :key="a">
          <template #title>
            <span class="custom-title">{{ v.name }}</span>
            <van-tag type="danger" style="margin-left: 5px">{{ v.unitname }}</van-tag>
          </template>
          <template #label>
            <span class="custom-title">规格:{{ v.specification == '' ? '-' : v.specification }}</span>
            <span class="custom-title">单价:{{ v.price }}</span>
          </template>
          <template #extra>
            <van-stepper
              @plus="onPlus(i + '_' + v.clsId + '_' + v.id + '_p')"
              @minus="onMinus(i + '_' + v.clsId + '_' + v.id + '_p')"
              v-model="v.count"
              theme="round"
              min="0"
              :max="v.max"
              integer
            />
          </template>
        </van-cell>
      </van-cell-group>
      <van-row type="flex" justify="center" style="margin-top: 5px">
        <van-col span="2"></van-col>
        <van-col span="20">
          <van-button @click="onClickClear" v-if="invs_p.length > 0" style="width: 100%" type="warning" size="small"
            >清空购物车</van-button
          ></van-col
        >
        <van-col span="2"></van-col>
      </van-row>
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
    <van-popup v-model="partnerClsVisable" safe-area-inset-bottom round position="bottom" :style="{ height: '80%' }">
      <van-tabs v-model="active">
        <van-tab title="大类列表">
          <van-list :finished="finished" finished-text="没有更多了">
            <van-cell v-for="(item, index) in clsList" :key="item.id" :title="item.name">
              <template>
                <van-button
                  :disabled="item.isChoose"
                  @click="onClickChoosePcls(item, index)"
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
import { getPartnerCls, getPartners } from '@/api/home.js'
import { getPoDetail } from '@/api/po.js'
import { mounted } from '@/mix/mounted.js'
import { mapGetters } from 'vuex'
import { setStorage, getStorage } from '@/utils/index.js'
import dayjs from 'dayjs'
import { floatMul } from '@/utils'
export default {
  name: `p41`,
  mixins: [mounted],
  data() {
    return {
      partners: [],
      partners_copy: [],
      active: 0,
      invs: [],
      invs_p: [],
      carVisiable: false,
      partnerVisable: false,
      partnerClsVisable: false,
      finished: false,
      keyword: '',
      curPartnerId: '',
      curPartnerName: '',
      minDate: new Date(),
      currentDate: new Date(),
      currentCls: '',
      currentClsId: '',
      showDate: false,
      cache: {},
      clsList: [],
      clsListCopy: []
    }
  },
  asyncComputed: {
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
        let group = Array.from(new Set(this.invs_p.map(f => f.clsId))).map(g => {
          let t = {}
          t.clsId = g
          t.clsName = this.invs_p.filter(f => f.clsId == g)[0].clsName
          t.invs = this.invs_p.filter(f => f.clsId == g)
          return t
        })
        return group
      } else {
        return []
      }
    },
    async partners_p() {
      return this.partners_copy.filter(f => f.isChoose == true)
    },
    async canUse() {
      return this.partners_p.length > 0
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
    calc(x, y) {
      return floatMul(x, y)
    },
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
        setStorage(this.groupId + '_P41_ShopCar_' + id, '')
      })
      setStorage(this.groupId + '_shopCar_P41', '')
      setStorage(this.groupId + '_shopCar_P41_Dic', '')
      success && success()
    },
    getDetail() {
      if (this.curPartnerId == '') return
      this.invs = []
      getPoDetail({ date: this.currentDateStr, partnerId: this.curPartnerId }).then(({ code, message, data }) => {
        if (code == 200) {
          if (this.curPartnerId == '') {
            this.$toast({ type: 'fail', message: '请先选择供应商' })
          }
          let carInfo1 = getStorage(this.groupId + '_shopCar_P41')
          if (carInfo1 != '') {
            carInfo1 = JSON.parse(carInfo1).map(m => {
              m.count = m.quantity || m.count
              m.invId = m.invId || m.id
              return m
            })
          }

          this.invs = JSON.parse(JSON.stringify(data)).map(m => {
            m.partnerId = this.curPartnerId
            m.partnerName = this.curPartnerName
            m.price = Number(m.price).toFixed(2)
            m.max = m.count
            if (carInfo1.length > 0) {
              let t = carInfo1.filter(f => f.invId == m.id)[0]
              if (t) {
                m.count = t.count
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
              let t = carInfo1.filter(f => f.invId == m.id)[0]
              if (t) {
                m.count = t.count
              }
            }
            return m
          })
          this.cache = data.map(m => {
            let c = 0
            this.partners_p
              .filter(f => f.id != this.curPartnerId)
              .forEach(({ id }) => {
                let t = getStorage(this.groupId + '_P41_ShopCar_' + id)
                if (t != '') {
                  t = JSON.parse(t)

                  c += t
                    .filter(f => f.id == m.id)
                    .map(f => f.count)
                    .reduce(function (prev, next, index, array) {
                      return prev + next
                    })
                }
              })

            return {
              id: m.id,
              max: m.max,
              cur: this.invs.filter(f => f.id == m.id)[0].count + c
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

        const invIndex = this.invs_p.findIndex(f => f.id == invId)
        const inv = this.invs.filter(f => f.id == invId)[0]
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
          const tt = this.invs_p.filter(f => f.id == invId)[0]
          tt.count += value

          if (tt.count == 0) {
            this.invs_p.splice(invIndex, 1)
          } else {
            this.$set(this.invs_p, invIndex, tt)
          }
        }
        if (f == 'p') {
          let i = this.invs.findIndex(f => f.id == invId)
          if (i > -1) {
            let ttt = this.invs.filter(f => f.id == invId)[0]
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
    onPlus1(name) {
      const index = name.split('_')[0]
      const id = name.split('_')[1]
      const invId = name.split('_')[2]
    },
    onMinus1(name) {
      console.log(name)
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
      setStorage(this.groupId + '_P41_ShopCar_' + this.curPartnerId, JSON.stringify(this.invs_p))

      this.curPartnerId = id
      this.curPartnerName = name

      this.invs_p = JSON.parse(
        getStorage(this.groupId + '_P41_ShopCar_' + id) == null || getStorage(this.groupId + '_P41_ShopCar_' + id) == ''
          ? '[]'
          : getStorage(this.groupId + '_P41_ShopCar_' + id)
      )
      this.invs.forEach((inv, index) => {
        let t = this.cache.filter(f => f.id == inv.id)[0]
        let t1 = this.invs_p.filter(f => f.id == inv.id)[0]
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
    onClickChoosePcls(cls, index) {
      this.invs = []
      this.currentCls = cls.name
      this.currentClsId = cls.id
      this.clsList.forEach((e, i) => {
        e.isChoose = i == index
        this.$set(this.clsList, i, e)
      })

      const ps = this.clsListCopy
        .filter(f => f.idinventoryclass == cls.id)
        .map(m => {
          return getPoDetail({ date: this.currentDateStr, partnerId: m.idParent })
        })

      Promise.all(ps).then(values => {
        values.forEach(({ data }) => {
          data.forEach(row => {
            if (this.invs.findIndex(f => f.id == row.id) < 0) {
              this.invs.push(
                Object.assign({}, row, {
                  partners: [
                    {
                      price: row.price,
                      count: row.count,
                      partnerId: row.partnerId,
                      partnerName: this.clsListCopy.filter(f => f.idParent == row.partnerId)[0]['partnerName']
                    }
                  ]
                })
              )
            } else {
              this.invs
                .filter(f => f.id == row.id)[0]
                .partners.push({
                  price: row.price,
                  count: 0,
                  partnerId: row.partnerId,
                  partnerName: this.clsListCopy.filter(f => f.idParent == row.partnerId)[0]['partnerName']
                })
            }
          })
        })
      })

      this.partnerClsVisable = false
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
    onClickCar() {
      this.carVisiable = true
    },
    beforeSave() {
      let t = this.invs.map(m => {
        return {
          max: m.count,
          count: m.partners
            .map(f => f.count)
            .reduce(function (prev, cur) {
              return prev + cur
            })
        }
      })

      let t1 = this.invs.map(m => {
        return {
          price: m.partners
            .map(f => f.price)
            .reduce(function (prev, cur) {
              return prev + cur
            })
        }
      })

      return t.some(f => f.count > f.max) || t.some(f => f.count == 0) || t1.some(f => f.price == 0)
    },
    onClickSubmit() {
      if (this.beforeSave()) {
        this.$toast({ type: 'fail', message: '存在数量或单价异常,请检查' })
      } else {
        setStorage(this.groupId + '_P41_ShopCar_Invs', JSON.stringify(this.invs))
        this.$router.push({ path: '/p41_1', query: { date: this.currentDateStr, group: this.groupId, id: this.id } })
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
    getPartnerCls().then(({ code, data, message }) => {
      if (code == 200) {
        this.clsListCopy = data
        this.clsList = Array.from(new Set(data.map(m => m.idinventoryclass))).map(m => {
          return {
            id: m,
            name: data.filter(f => f.idinventoryclass == m)[0].invClsName,
            isChoose: false
          }
        })
      }
    })
    getPartners().then(({ code, data, message }) => {
      if (code == 200) {
        let carInfo = getStorage(this.groupId + '_shopCar_P41')

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
          let t = getStorage(this.groupId + '_P41_ShopCar_' + this.curPartnerId)
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
  top: 130px;
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
    height: calc(100% - 34px);
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