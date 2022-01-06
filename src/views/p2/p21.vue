<template>
  <div>
    <van-row class="root">
      <van-search readonly placeholder="请输入搜索关键词" input-align="center" @click="gotoSearch" />
      <van-col span="6" class="left">
        <van-sidebar v-model="activeKey" class="menu" @change="onChangeTab">
          <van-sidebar-item :id="'_' + c.id" :dot="cls_p.filter(f => f.id == c.id).length > 0" class="item" v-for="c in cls" :key="c.id" :title="c.name" />
        </van-sidebar>
      </van-col>
      <van-col span="18" class="right">
        <van-empty image="search" description="没有查询到存货" v-if="invs.length <= 0" />
        <div :id="'_' + inv.clsId + '_' + inv.id" class="title van-cell-group__tit1e" v-for="(inv, i) in invs" :key="inv.id">
          <!-- <div style="margin: 10px">{{ d.clsName }}</div> -->
          <van-cell :label="inv.specification">
            <template #title>
              <span class="custom-title">{{ inv.name }}</span>
              <van-tag type="danger">{{ inv.unitname }}</van-tag>
            </template>
            <template #label>
              <span class="custom-title">规格:{{ inv.specification == '' ? '-' : inv.specification }}</span>
            </template>
            <template #extra>
              <van-stepper :disabled="!canUse" @plus="onPlus(i + '_' + inv.clsId + '_' + inv.id + '_q')" @minus="onMinus(i + '_' + inv.clsId + '_' + inv.id + '_q')" v-model="inv.count" theme="round" min="0" :max="inv.max" />
            </template>
          </van-cell>
        </div>
      </van-col>
    </van-row>
    <van-goods-action>
      <van-goods-action-icon icon="friends-o" text="供应商" @click="onClickPartners" style="width: 20%" />
      <van-goods-action-icon icon="cart-o" :badge="total" text="购物车" @click="onClickCar" style="width: 20%" />
      <van-goods-action-button type="danger" :disabled="!canSave" text="提交保存" @click="onClickSubmit" />
    </van-goods-action>

    <van-popup v-model="carVisiable" safe-area-inset-bottom round position="bottom" :style="{ height: '80%' }">
      <van-notice-bar v-if="cars && cars.length > 0" left-icon="volume-o" text="向右滑动条目快速删除" />
      <van-empty image="search" description="购物车内没有东西" v-if="cars && cars.length <= 0" />
      <van-cell-group :title="c.clsName" v-for="(c, i) in cars" :key="i">
        <van-swipe-cell :before-close="beforeClose" :name="c.clsId+'_'+v.id" v-for="(v, a) in c.invs" :key="a">
          <van-cell :label="v.specification">
            <template #title>
              <span class="custom-title">{{ v.name }}</span>
              <van-tag type="danger">{{ v.unitname }}</van-tag>
            </template>
            <template #label>
              <p>{{ v.partnerName }}</p>
              <span class="custom-title">规格:{{ v.specification == '' ? '-' : v.specification }}</span>
            </template>
            <template #extra>
              <van-stepper @plus="onPlus(i + '_' + v.clsId + '_' + v.id + '_p')" @minus="onMinus(i + '_' + v.clsId + '_' + v.id + '_p')" v-model="v.count" theme="round" min="0" />
            </template>
          </van-cell>
          <template #left>
            <van-button square text="删除" type="danger" class="delete-button" />
          </template>
        </van-swipe-cell>
      </van-cell-group>
      <van-row type="flex" justify="center" style="margin-top: 5px">
        <van-col span="2"></van-col>
        <van-col span="20">
          <van-button @click="onClickClear" v-if="invs_p.length > 0" style="width: 100%" type="warning" size="small">清空购物车</van-button>
        </van-col>
        <van-col span="2"></van-col>
      </van-row>
    </van-popup>
    <van-popup v-model="partnerVisable" safe-area-inset-bottom round position="bottom" :style="{ height: '80%' }">
      <van-tabs v-model="active">
        <van-tab title="供应商">
          <van-list>
            <van-cell @click="onClickPartner(item)" v-for="item in partners_p" :key="item.id" :title="item.name">
              <template #icon>
                <van-icon v-if="item.id == curPartnerId" name="success" size="24" :color="item.id == curPartnerId ? 'red' : ''" class="success-icon" />
              </template>
              <template>
                <van-button @click="onClickRemove(item)" type="warning" size="small">移除</van-button>
              </template>
            </van-cell>
          </van-list>
        </van-tab>
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

    <van-popup v-model="searchVisiable" safe-area-inset-bottom round position="bottom" :style="{ height: '80%' }">
      <van-search show-action v-model="keyword_inv" placeholder="请输入搜索关键词" @blur="onSearchInvBlur" @search="onSearchInv" @cancel="onCancelInv" />
      <van-empty v-if="!dataList.length > 0" description="没有发现记录"></van-empty>
      <div class="lists_item">
        <van-cell v-for="(ele, i) in dataList" :label="'规格:' + ele.specification" :key="i" :title="ele.name" :value="ele.code">
          <template>
            <van-button @click="onClickChooseInv(ele)" type="primary" size="small">选取</van-button>
          </template>
        </van-cell>
      </div>
    </van-popup>

    <van-popup v-model="unitVisiable" safe-area-inset-bottom round position="bottom" :style="{ height: '50%' }">
      <van-form validate-first style="padding: 20px" @submit="onConfirm">
        <van-field name="name" label="存货">
          <template #input>
            <van-field readonly v-model="form.name" />
          </template>
        </van-field>
        <van-field name="unit" label="计量单位">
          <template #input>
            <van-radio-group direction="horizontal" v-model="form.unit">
              <van-radio v-for="unit in curUnits" :key="unit" :name="unit" shape="square">{{ unit }}</van-radio>
            </van-radio-group>
          </template>
        </van-field>
        <van-field name="count" label="数量">
          <template #input>
            <van-stepper v-model="form.count" min="1" />
          </template>
        </van-field>
        <van-field name="remark" label="其他说明">
          <template #input>
            <van-field type="textarea" rows="1" autosize v-model="form.remark" name="remark" placeholder="请填写其他说明" />
          </template>
        </van-field>
        <div style="margin: 16px">
          <van-button round block type="info" native-type="submit">确定</van-button>
        </div>
      </van-form>
    </van-popup>
  </div>
</template>

<script>
import { getCls, getInvs, getPartners } from '@/api/home.js'
import { mounted } from '@/mix/mounted.js'
import { mapGetters } from 'vuex'
import { setStorage, getStorage } from '@/utils/index.js'
import { searchInv } from '@/api/base.js'
export default {
  name: `p21`,
  mixins: [mounted],
  data() {
    return {
      partners: [],
      partners_copy: [],
      activeKey: 0,
      active: 0,
      cls: [],
      invs: [],
      invs_p: [],
      form: [],
      carVisiable: false,
      searchVisiable: false,
      partnerVisable: false,
      unitVisiable: false,
      finished: false,
      keyword: '',
      curPartnerId: '',
      curPartnerName: '',
      keyword_inv: '',
      dataList: [],
      form: {
        name: '',
        _name: '',
        unit: '',
        count: '',
        remark: ''
      }
    }
  },
  asyncComputed: {
    async total() {
      return this.invs_p.length > 0
        ? this.invs_p
          .map(f => f.count)
          .reduce(function(prev, next, index, array) {
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
    async cls_p() {
      if (this.invs_p.length > 0) {
        let group = Array.from(new Set(this.invs_p.map(f => f.clsId))).map(g => {
          let t = {}
          t.id = g
          t.count = this.invs_p.filter(f => f.clsId == g).length
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
      return this.partners.filter(f => f.isChoose == true).length > 0
    },
    async groupId() {
      return this.$route.query.group || ''
    },
    async id() {
      return this.$route.query.id || void 0
    }
  },
  methods: {
    gotoSearch() {
      this.searchVisiable = true
    },
    onSearchInvBlur() {
      this.onSearchInv(this.keyword_inv)
    },
    onSearchInv(val) {
      if (val != '') {
        searchInv({ keyword: val })
          .then(({ code, data, message }) => {
            if (code == 200) {
              this.dataList = data
            } else {
              this.$dialog.alert({
                title: '提示',
                message: '没有查询到存货!'
              })
            }
          })
          .catch(err => {
            this.$dialog.alert({
              title: '提示',
              message: '查询过程发生异常!'
            })
          })
      }
    },
    onCancelInv() {
      this.dataList = []
    },
    onClickChooseInv(inv) {
      const { idinventoryclass, id } = inv
      this.searchVisiable = false
      const index = this.cls.findIndex(f => f.id == idinventoryclass)

      this.keyword_inv = ''
      this.dataList = []
      this.onComplete = () => {
        this.chooseUnit(`x_${idinventoryclass}_${id}_p`, inv)
        this.onComplete = void 0
      }
      if (this.activeKey == index) {
        this.onComplete()
      }
      this.activeKey = index
    },
    chooseUnit(name, inv) {
      const { unitname } = inv
      this.form.unit = unitname
      this.form.count = 1
      this.form.remark = ''
      this.form.name = inv.name
      this.form._name = name
      this.curUnits = [unitname]
      this.unitVisiable = true
    },
    onConfirm(values) {
      this.onChangeCount(values.count, this.form._name, values.unit, values.remark)
      this.unitVisiable = false
    },
    fetchInvs(clsId, index) {
      getInvs({ clsId }).then(({ code, data, message }) => {
        if (code == 200) {
          this.invs = data.map(f => {
            const inv = this.invs_p.filter(ff => ff.id == f.id)
            f.clsName = this.cls[index].name
            f.clsId = this.cls[index].id
            f.count = inv.length > 0 ? inv[0].count : 0
            f.max = 1
            return f
          })
          this.onComplete && this.onComplete()
        }
      })
    },
    onChangeTab(index) {
      this.fetchInvs(this.cls[index].id, index)
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
      setStorage(this.groupId + '_P21_ShopCar_' + this.curPartnerId, JSON.stringify(this.invs_p))

      this.curPartnerId = id
      this.curPartnerName = name

      this.invs_p = JSON.parse(
        getStorage(this.groupId + '_P21_ShopCar_' + id) == null || getStorage(this.groupId + '_P21_ShopCar_' + id) == ''
          ? '[]'
          : getStorage(this.groupId + '_P21_ShopCar_' + id)
      )

      this.fetchInvs(this.cls[0].id, 0)
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
      const _index = this.partners_copy.findIndex(f => f.id == id)
      if (this.curPartnerId == '') {
        this.curPartnerId = id
        this.curPartnerName = name
      }
      partner.isChoose = true
      this.$set(this.partners, index, partner)

      let cp = this.partners_copy[_index]
      cp.isChoose = true
      this.$set(this.partners_copy, _index, cp)
    },
    onClickClear() {
      this.invs_p = []
      this.activeKey = 0
      this.fetchInvs(this.cls[0].id, 0)
    },
    onClickPartners() {
      this.partnerVisable = true
    },
    onClickCar() {
      this.carVisiable = true
    },
    onClickSubmit() {
      if (this.invs_p.length <= 0) {
        this.$toast({ type: 'fail', message: '请先添加商品' })
      } else if (this.cls_p.length > 1) {
        this.$toast({ type: 'fail', message: '不允许跨大类询价!' })
      } else {
        setStorage(this.groupId + '_P21_ShopCar_' + this.curPartnerId, JSON.stringify(this.invs_p))

        let tmp = [],
          dic = []
        this.partners_p.forEach(({ id }) => {
          let t = getStorage(this.groupId + '_P21_ShopCar_' + id)
          dic.push(this.groupId + '_P21_ShopCar_' + id)
          if (t != null && t != '') {
            tmp = tmp.concat(JSON.parse(t))
          }
        })
        setStorage(this.groupId + '_shopCar_P21', JSON.stringify(tmp))
        setStorage(this.groupId + '_shopCar_P21_Dic', JSON.stringify(dic))
        this.$router.push({ path: '/p21_1', query: { group: this.groupId, id: this.id } })
      }
    }
    ,
    beforeClose({ name, position, instance }) {
      switch (position) {
        case 'left':
          const clsId = name.split('_')[0]
          const invId = name.split('_')[1]
          const index = this.invs_p.findIndex(f => f.clsId == clsId && f.id == invId);
          if (index > -1) {
            this.invs_p.splice(index, 1)

            const _index = this.invs.findIndex(f => f.id == invId);
            let _t = this.invs.filter(f => f.id == invId)[0];
            if (_t != void 0) {
              _t.count = 0
              if (_index > -1) {
                this.$set(this.invs, _index, _t)
              }
            }

          }
          instance.close();
          break;
        default:
          instance.close();
          break;
      }
    }
  },
  computed: {
    ...mapGetters(['canSave'])
  },
  mounted() {
    getCls().then(({ code, data, message }) => {
      if (code == 200) {
        this.cls = data
        let t = getStorage(this.groupId + '_shopCar_P21_Dic')
        let name = t == null || t == '' ? '' : JSON.parse(t)[0]

        if (name != '') {
          let carInfo = getStorage(name)
          if (carInfo != '') {
            carInfo = JSON.parse(carInfo)
            this.invs_p = carInfo
          }
        }
        this.fetchInvs(data[0].id, 0)
      }
    })
    getPartners().then(({ code, data, message }) => {
      if (code == 200) {
        let carInfo = getStorage(this.groupId + '_shopCar_P21')
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
  // beforeRouteLeave(to, from, next) {
  //   if (to.path == '/p10' && this.invs_p.length <= 0) {
  //     if (this.id > 0) {
  //       setStorage(this.id + '_shopCar_Temp', '')
  //     } else {
  //       setStorage('shopCar_P21', '')
  //     }
  //   }
  //   next()
  // }
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
  height: calc(100vh - 105px);
  .left {
    height: calc(100% - 45px);
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
    height: calc(100% - 45px);
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