<template>
  <div>
    <van-row class="root">
      <van-search readonly placeholder="请输入搜索关键词" input-align="center" @click="gotoSearch" />
      <van-col span="6" class="left">
        <van-sidebar v-model="activeKey" class="menu" @change="onChangeTab">
          <van-sidebar-item
            :id="'_' + c.id"
            :dot="cls_p.filter(f => f.id == c.id).length > 0"
            class="item"
            v-for="c in cls"
            :key="c.id"
            :title="c.name"
          />
        </van-sidebar>
      </van-col>
      <van-col span="18" class="right">
        <van-empty image="search" description="没有查询到存货" v-if="invs.length <= 0" />
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
              <van-tag type="danger">{{ inv.unitname2 }}</van-tag>
            </template>
            <template #label>
              <span class="custom-title">规格:{{ inv.specification == '' ? '-' : inv.specification }}</span>
            </template>
            <template #extra>
              <van-button
                v-if="inv.count <= 0"
                size="small"
                @click="chooseUnit(i + '_' + inv.clsId + '_' + inv.id + '_p', inv)"
              >
                选取
              </van-button>
              <span v-else>{{ inv.count }}{{ inv._unit }}</span>
            </template>
          </van-cell>
        </div>
      </van-col>
    </van-row>
    <van-goods-action>
      <van-goods-action-icon icon="cart-o" :badge="total" text="购物车" @click="onClickCar" style="width: 30%" />
      <van-goods-action-button type="danger" :disabled="!canSave" text="提交申请" @click="onClickSubmit" />
    </van-goods-action>

    <van-popup v-model="carVisiable" safe-area-inset-bottom round position="bottom" :style="{ height: '80%' }">
      <van-notice-bar v-if="cars && cars.length > 0" left-icon="volume-o" text="向右滑动条目快速删除" />
      <van-empty image="search" description="购物车内没有东西" v-if="cars && cars.length <= 0" />
      <van-cell-group :title="c.clsName" v-for="(c, i) in cars" :key="i">
        <van-swipe-cell :before-close="beforeClose" :name="c.clsId + '_' + v.id" v-for="(v, a) in c.invs" :key="a">
          <van-cell :label="v.specification">
            <template #title>
              <div style="display: inline-flex; justify-content: space-between; width: 100%">
                <div>
                  <span class="custom-title">{{ v.name }}</span>
                  <van-tag type="danger">{{ v._unit }}</van-tag>
                </div>
                <div>规格：{{ v.specification == '' ? '-' : v.specification }}</div>
              </div>
            </template>
            <template #label>
              <div style="display: inline-flex; justify-content: space-between; width: 100%">
                <div style="flex: 2">
                  <number-input
                    label="数量"
                    type="number"
                    v-model="v.count"
                    label-width="auto"
                    @blur="changeCount(v)"
                    autocomplete="off"
                  />
                </div>
                <div>
                  <van-field label-width="auto" class="card" label="说明" v-model="v.remark" readonly />
                </div>
              </div>
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
          <van-button @click="onClickClear" v-if="invs_p.length > 0" style="width: 100%" type="warning" size="small"
            >清空购物车</van-button
          >
        </van-col>
        <van-col span="2"></van-col>
      </van-row>
    </van-popup>

    <van-popup v-model="searchVisiable" safe-area-inset-bottom round position="bottom" :style="{ height: '80%' }">
      <van-search
        show-action
        v-model="keyword"
        placeholder="请输入搜索关键词"
        @blur="onSearchBlur"
        @search="onSearch"
        @input="onSearch"
        @cancel="onCancel"
      />
      <van-empty v-if="!dataList.length > 0" description="没有发现记录"></van-empty>
      <div class="lists_item">
        <van-cell
          v-for="(ele, i) in dataList"
          :label="'规格:' + ele.specification"
          :key="i"
          :title="ele.name"
          :value="ele.code"
        >
          <template>
            <van-button @click="onClickChoose(ele)" type="primary" size="small">选取</van-button>
          </template>
        </van-cell>
      </div>
    </van-popup>

    <van-popup v-model="unitVisiable" safe-area-inset-bottom round position="bottom" :style="{ height: '50%' }">
      <van-form validate-first style="padding: 20px" @submit="onConfirm">
        <van-field name="name" label="存货" readonly v-model="form.name" />
        <van-field name="unit" label="计量单位">
          <template #input>
            <van-radio-group direction="horizontal" v-model="form.unit">
              <van-radio v-for="unit in curUnits" :key="unit" :name="unit" shape="square">{{ unit }}</van-radio>
            </van-radio-group>
          </template>
        </van-field>
        <number-input name="count" label="数量" type="number" v-model="form.count" autocomplete="off" />
        <van-field
          name="remark"
          label="其他说明"
          type="textarea"
          rows="1"
          autosize
          v-model="form.remark"
          placeholder="请填写其他说明"
        />
        <div style="margin: 16px">
          <van-button round block type="info" native-type="submit">确定</van-button>
        </div>
      </van-form>
    </van-popup>
  </div>
</template>

<script>
import { getCls, getInvs } from '@/api/home.js'
import { mounted } from '@/mix/mounted.js'
import { mapGetters } from 'vuex'
import { setStorage, getStorage, isEmpty, floatAdd } from '@/utils/index.js'
import { searchInv } from '@/api/base.js'
import NumberInput from '@/components/NumberInput'
export default {
  name: `p11`,
  mixins: [mounted],
  components: {
    NumberInput
  },
  data() {
    return {
      id: -1,
      activeKey: 0,
      cls: [],
      invs: [],
      invs_p: [],
      carVisiable: false,
      searchVisiable: false,
      unitVisiable: false,
      keyword: '',
      dataList: [],
      curUnits: [],
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
            .reduce(function (prev, next, index, array) {
              return floatAdd(prev, next)
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
    }
  },
  methods: {
    gotoSearch() {
      this.searchVisiable = true
    },
    onSearchBlur() {
      this.onSearch(this.keyword)
    },
    onSearch(val) {
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
    onCancel() {
      this.dataList = []
    },
    onClickChoose(inv) {
      const { idinventoryclass, id } = inv
      this.searchVisiable = false
      const index = this.cls.findIndex(f => f.id == idinventoryclass)

      this.keyword = ''
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
    fetchInvs(clsId, index) {
      getInvs({ clsId }).then(({ code, data, message }) => {
        if (code == 200) {
          this.invs = data.map(f => {
            const inv = this.invs_p.filter(ff => ff.id == f.id)
            f.clsName = this.cls[index].name
            f.clsId = this.cls[index].id
            f.count = inv.length > 0 ? inv[0].count : 0
            f._unit = inv.length > 0 ? inv[0]._unit : ''
            return f
          })
          this.onComplete && this.onComplete()
        }
      })
    },
    onChangeTab(index) {
      this.fetchInvs(this.cls[index].id, index)
    },
    onChangeCount(value, name, unit, remark, eq) {
      const id = name.split('_')[1]
      const invId = name.split('_')[2]
      const f = name.split('_')[3]

      const invIndex = this.invs_p.findIndex(f => f.id == invId)
      const inv = this.invs.filter(f => f.id == invId)[0]
      if (invIndex < 0) {
        this.invs_p.push(Object.assign({}, { cid: id, id: invId }, inv, { count: value, _unit: unit, remark }))
      } else {
        const tt = this.invs_p.filter(f => f.id == invId)[0]
        if (eq) {
          tt.count = value
        } else {
          tt.count = floatAdd(tt.count, value)
        }

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
          if (eq) {
            ttt.count = value
          } else {
            ttt.count = floatAdd(ttt.count, value)
          }
          ttt._unit = unit
          this.$set(this.invs, i, ttt)
        }
      }
    },
    onPlus(name, inv) {
      this.onChangeCount(1, name, inv._unit)
    },
    onMinus(name, inv) {
      this.onChangeCount(-1, name, inv._unit)
    },
    chooseUnit(name, inv) {
      const { unitname, unitname2 } = inv
      this.form.unit = unitname2
      this.form.count = 1
      this.form.remark = ''
      this.form.name = inv.name
      this.form._name = name
      this.curUnits = [unitname2].filter(f => f != null && f != '')
      this.unitVisiable = true
    },
    onConfirm(values) {
      if (isEmpty(values.unit)) {
        this.$toast({ type: 'fail', message: '商品单位不正确!' })
      } else {
        this.onChangeCount(Number(values.count), this.form._name, values.unit, values.remark)
        this.unitVisiable = false
      }
    },
    changeCount(v) {
      this.onChangeCount(Number(v.count), `${v.clsId}_${v.clsId}_${v.id}_p`, v.unitname2, v.remark, true)
    },
    onClickClear() {
      this.invs_p = []
      this.activeKey = 0
      this.fetchInvs(this.cls[0].id, 0)
    },
    onClickCar() {
      this.carVisiable = true
    },
    onClickSubmit() {
      if (this.invs_p.length <= 0) {
        this.$toast({ type: 'fail', message: '请先添加商品' })
      } else {
        if (this.id > 0) {
          setStorage(this.id + '_shopCar_Temp', JSON.stringify(this.invs_p))
          this.$router.push({
            path: '/p11_1',
            query: {
              id: this.id
            }
          })
        } else {
          setStorage('shopCar_P11', JSON.stringify(this.invs_p))
          this.$router.push({ path: '/p11_1' })
        }
      }
    },
    beforeClose({ name, position, instance }) {
      switch (position) {
        case 'left':
          const clsId = name.split('_')[0]
          const invId = name.split('_')[1]
          const index = this.invs_p.findIndex(f => f.clsId == clsId && f.id == invId)
          if (index > -1) {
            this.invs_p.splice(index, 1)

            const _index = this.invs.findIndex(f => f.id == invId)
            let _t = this.invs.filter(f => f.id == invId)[0]
            if (_t != void 0) {
              _t.count = 0
              if (_index > -1) {
                this.$set(this.invs, _index, _t)
              }
            }
          }
          instance.close()
          break
        default:
          instance.close()
          break
      }
    }
  },
  computed: {
    ...mapGetters(['canSave'])
  },
  mounted() {
    const id = this.$route.query.id
    if (id) {
      this.id = id
    }
    getCls().then(({ code, data, message }) => {
      if (code == 200) {
        this.cls = data
        let carInfo = this.id > 0 ? getStorage(this.id + '_shopCar_Temp') : getStorage('shopCar_P11')
        if (carInfo != '') {
          carInfo = JSON.parse(carInfo)
          this.invs_p = carInfo
        }

        this.fetchInvs(data[0].id, 0)
      }
    })
  },
  beforeRouteLeave(to, from, next) {
    if (to.path == '/p10' && this.invs_p.length <= 0) {
      if (this.id > 0) {
        setStorage(this.id + '_shopCar_Temp', '')
      } else {
        setStorage('shopCar_P11', '')
      }
    }
    next()
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
.card {
  .van-field__label {
    width: auto !important;
  }
}
</style>