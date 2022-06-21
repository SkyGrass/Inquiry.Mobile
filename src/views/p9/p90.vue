<template>
  <div class="wrapper">
    <div
      ref="fresh"
      :style="{
        'overflow-y': 'scroll',
        'box-sizing': 'border-box'
      }"
    >
      <van-row>
        <van-col span="14"> <van-cell title="送货日期" :value="date" @click="dateVisable = true" is-link /> </van-col>
        <van-col span="10"> <van-cell title="时间段" :value="time" @click="timeVisable = true" is-link /> </van-col>
      </van-row>
      <van-row>
        <van-col span="14">
          <van-cell title="供应商" :value="curPartnerName" @click="partnerVisable = true" v-if="canShow" is-link />
        </van-col>
        <van-col span="10">
          <van-cell title="模式" :value="model" @click="modelVisable = true" is-link />
        </van-col>
      </van-row>

      <div
        :style="{
          height: freshHeight + 'px',
          'overflow-y': 'scroll',
          'box-sizing': 'border-box'
        }"
      >
        <van-empty v-if="list.length <= 0" description="没有发现送货清单"></van-empty>
        <div v-else>
          <table v-if="modelId == 0" border="0" cellspacing="0" style="width: 100%">
            <tr style="text-align: center; background-color: #e6e6e6">
              <th class="col" style="width: 8%; border-left: 1px solid #333">序</th>
              <th class="col" style="width: 50%; border-left: 1px solid #333">商品名</th>
              <th class="col" style="width: 12%; border-left: 1px solid #333">采购量</th>
              <th class="col" style="width: 30%; border-left: 1px solid #333; border-right: 1px solid #333">明细</th>
            </tr>
            <tr v-for="(r, i) in list" :key="i" style="text-align: center">
              <td style="text-align: center; width: 8%" class="col1">
                {{ i + 1 }}
              </td>
              <td style="width: 50%" class="col1">
                <span>
                  {{ r.invName + '(' + r.unitName + ')' }}
                </span>
                <br />
                <span> 规格： {{ r.specification == '' ? '-' : r.specification }} </span>
              </td>
              <td style="width: 5%; text-align: right" class="col1">
                <strong style="color: red">{{ r.sum }}</strong>
              </td>
              <td style="width: 37%; border-right: 1px solid #333" class="col1">
                <ul>
                  <li style="padding: 3px" span="14" v-for="(rr, ii) in r.children" :key="ii">
                    {{ '[' + rr.deptName + ']'
                    }}<strong style="color: red">{{ '*' + Number(rr.qty).toFixed(2) }}</strong>
                  </li>
                </ul>
              </td>
            </tr>
          </table>
          <table v-if="modelId == 1" border="0" cellspacing="0" style="width: 100%">
            <tr style="text-align: center; background-color: #e6e6e6">
              <th class="col" style="width: 8%; border-left: 1px solid #333">序</th>
              <th class="col" style="width: 50%; border-left: 1px solid #333">商品名</th>
              <th class="col" style="width: 12%; border-left: 1px solid #333">采购量</th>
              <th class="col" style="width: 30%; border-left: 1px solid #333; border-right: 1px solid #333">明细</th>
            </tr>
            <tr v-for="(r, i) in listCopy" :key="i" style="text-align: center">
              <td style="text-align: center; width: 8%" class="col1">
                {{ i + 1 }}
              </td>
              <td style="width: 50%" class="col1">
                <span>
                  {{ r.invName + '(' + r.unitName + ')' }}
                </span>
                <br />
                <span> 规格： {{ r.specification == '' ? '-' : r.specification }} </span>
              </td>
              <td style="width: 5%; text-align: right" class="col1">
                <strong style="color: red">{{ Number(r.qty).toFixed(2) }}</strong>
              </td>
              <td style="width: 37%; border-right: 1px solid #333; text-align: center" class="col1">
                <strong>{{ r.deptName }}</strong>
              </td>
            </tr>
          </table>
        </div>
      </div>
      <van-popup v-model="dateVisable" round position="bottom" :style="{ height: '40%' }">
        <van-datetime-picker
          @confirm="confirmDate"
          @cancel="dateVisable = false"
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
              @input="onSearchBlur"
              @search="onSearch"
              @cancel="partnerVisable = false"
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
      <van-action-sheet
        close-on-click-action
        v-model="timeVisable"
        :actions="actions"
        @select="onSelect"
        cancel-text="取消"
        description="请选择时间段"
        @cancel="timeVisable = false"
      />
      <van-action-sheet
        close-on-click-action
        v-model="modelVisable"
        :actions="actions1"
        @select="onSelect1"
        cancel-text="取消"
        description="请选择汇总模式"
        @cancel="modelVisable = false"
      />
    </div>
  </div>
</template>
<script>
import { getPartners } from '@/api/home.js'
import { mapGetters } from 'vuex'
import { mounted } from '@/mix/mounted.js'
import { getDayList } from '@/api/rpt.js'
import { floatAdd } from '@/utils'
import dayjs from 'dayjs'
export default {
  name: `p90`,
  mixins: [mounted],
  data() {
    return {
      active: 0,
      dateVisable: false,
      partnerVisable: false,
      timeVisable: false,
      modelVisable: false,

      finished: false,

      list: [],
      listCopy: [],
      partners: [],
      partners_copy: [],
      freshHeight: '',
      date: dayjs(new Date()).format('YYYY-MM-DD'),
      time: '白天',
      model: '商品',
      modelId: 0,
      curPartnerId: '',
      curPartnerName: '',
      currentDate: new Date(),
      flag: 0,
      keyword: '',
      actions: [
        { id: 0, name: '白天' },
        { id: 1, name: '晚上' }
      ],
      actions1: [
        { id: 0, name: '商品' },
        { id: 1, name: '部门' }
      ]
    }
  },
  computed: {
    ...mapGetters(['partnerName', 'partnerId']),
    canShow() {
      return this.partnerId == '-1'
    }
  },
  methods: {
    confirmDate() {
      this.date = dayjs(this.currentDate).format('YYYY-MM-DD')
      this.dateVisable = false
      this.getList()
    },
    getList() {
      getDayList({ date: this.date, partnerId: this.curPartnerId, flag: this.flag })
        .then(({ code, data, message }) => {
          if (code == 200) {
            if (data.length <= 0) {
              this.$toast({ type: 'fail', message: '未能查询到数据!' })
            }
            this.listCopy = data.sort((a, b) => {
              return a.deptId - b.deptId
            })
            let invs = Array.from(new Set(data.map(f => f.invId)))

            invs = invs.map(f => {
              let rs = data.filter(ff => ff.invId == f)
              if (rs.length > 0) {
                var r = rs[0]
                const sum = rs
                  .map(fff => fff.qty)
                  .reduce((total, num) => {
                    return floatAdd(total, num)
                  }, 0)
                return Object.assign(
                  {},
                  {
                    requiredDate: r.requiredDate,
                    invName: r.invName,
                    specification: r.specification,
                    sum: r.sum,
                    unitName: r.unitName
                  },
                  { sum: Number(sum).toFixed(2), children: rs }
                )
              }
            })
            this.list = invs
          } else {
            this.$toast({ type: 'fail', message })
          }
          this.isLoading = false
        })
        .catch(() => {
          this.isLoading = false
        })
    },
    onSearchBlur() {
      this.onSearch(this.keyword)
    },
    onSearch(val) {
      this.partners = this.partners_copy.filter(
        f => f.chinaname.indexOf(val.toUpperCase()) > -1 || f.name.indexOf(val) > -1 || f.code.indexOf(val) > -1
      )
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

      this.getList()
    },
    onSelect({ id, name }) {
      this.timeVisable = false
      this.time = name
      this.flag = id
      this.getList();
    },
    onSelect1({ id, name }) {
      this.modelVisable = false
      this.model = name
      this.modelId = id
    }
  },
  mounted() {
    this.curPartnerId = this.partnerId
    this.curPartnerName = this.partnerName == '未分配' ? '' : this.partnerName
    this.freshHeight = document.documentElement.clientHeight - 50 * 3
    getPartners().then(({ code, data, message }) => {
      if (code == 200) {
        this.partners = data.map(m => {
          return m
        })
        this.partners_copy = data.map(m => {
          return m
        })
      }
    })

    if (this.curPartnerId != '-1') {
      this.getList()
    }
  }
}
</script>
<style lang="scss" scoped>
.wrapper {
  position: absolute;
  left: 0;
  right: 0;
  top: 46px;
  bottom: 0px; // overflow: hidden;
  height: calc(100vh - 46px);
  .lists_item {
    margin-bottom: 5px;
    padding-bottom: 6px;

    border-radius: 8px;
  }
  .col {
    border-top: 1px solid #333;
    border-bottom: 1px solid #333;
    padding: 5px;
    text-align: center;
  }
  .col1 {
    text-align: left;
    padding: 5px;
    border-left: 1px solid #333;
    border-bottom: 1px solid #333;
  }
}
</style> 