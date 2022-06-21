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
        <van-col span="14"> <van-cell title="申购日期" :value="date" @click="dateVisable = true" is-link /> </van-col>
        <van-col span="10">
          <van-cell title="部门" :value="curDeptName" @click="deptVisable = true" is-link />
        </van-col>
      </van-row>
      <div
        :style="{
          height: freshHeight + 'px',
          'overflow-y': 'scroll',
          'box-sizing': 'border-box'
        }"
      >
        <van-empty v-if="list.length <= 0" description="没有发现申购清单"></van-empty>
        <table v-else border="0" cellspacing="0" style="width: 100%">
          <tr style="text-align: center; background-color: #e6e6e6">
            <th class="col" style="width: 8%; border-left: 1px solid #333">序</th>
            <th class="col" style="width: 15%; border-left: 1px solid #333">部门</th>
            <th class="col" style="width: 50%; border-left: 1px solid #333">商品名</th>
            <th class="col" style="width: 10%; border-left: 1px solid #333">单位</th>
            <th class="col" style="width: 17%; border-left: 1px solid #333; border-right: 1px solid #333">采购量</th>
          </tr>
          <tr v-for="(r, i) in list" :key="i" style="text-align: center">
            <td style="text-align: center; width: 8%" class="col1">
              {{ i + 1 }}
            </td>
            <td style="text-align: center; width: 15%" class="col1">
              {{ r.deptName }}
            </td>
            <td style="width: 50%" class="col1">
              <span>
                {{ r.invName }}
              </span>
              <br />
              <span> 规格： {{ r.specification == '' ? '-' : r.specification }} </span>
            </td>
            <td style="text-align: center; width: 10%" class="col1">
              {{ r.unitName }}
            </td>
            <td style="width: 17%; text-align: right; border-right: 1px solid #333" class="col1">
              <strong style="color: red">{{ r.qty }}</strong>
            </td>
          </tr>
        </table>
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
      <van-popup v-model="deptVisable" safe-area-inset-bottom round position="bottom" :style="{ height: '80%' }">
        <van-tabs v-model="active">
          <van-tab title="部门列表">
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
              <van-cell v-for="item in depts" :key="item.id" :title="item.name">
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
  </div>
</template>
<script>
import { mounted } from '@/mix/mounted.js'
import { getSubDayList } from '@/api/rpt.js'
import { getDepts } from '@/api/home.js'
import dayjs from 'dayjs'
import { mapGetters } from 'vuex'
export default {
  name: `p91`,
  mixins: [mounted],
  data() {
    return {
      dateVisable: false,
      deptVisable: false,
      finished: false,

      active: 0,
      list: [],
      freshHeight: '',
      depts: [],
      depts_copy: [],

      curDeptId: '',
      curDeptName: '',
      keyword: '',
      date: dayjs(new Date()).format('YYYY-MM-DD'),
      currentDate: new Date()
    }
  },
  computed: { ...mapGetters(['deptId', 'deptName']) },
  methods: {
    confirmDate() {
      this.date = dayjs(this.currentDate).format('YYYY-MM-DD')
      this.dateVisable = false
      this.getList()
    },
    getList() {
      getSubDayList({ date: this.date, deptId: this.curDeptId })
        .then(({ code, data, message }) => {
          if (code == 200) {
            if (data.length <= 0) {
              this.$toast({ type: 'fail', message: '未能查询到数据!' })
            }
            this.list = data.map(m => {
              m.qty = Number(m.qty).toFixed(2)
              return m
            })
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
      this.depts = this.depts_copy.filter(
        f => f.chinaname.indexOf(val.toUpperCase()) > -1 || f.name.indexOf(val) > -1 || f.code.indexOf(val) > -1
      )
    },
    onClickChoose(depts) {
      const { id, name } = depts
      const index = this.depts.findIndex(f => f.id == id)

      this.curDeptId = id
      this.curDeptName = name

      this.depts.forEach((p, i) => {
        p.isChoose = i == index
        this.$set(this.depts, i, p)
      })
      this.depts_copy.forEach((p, i) => {
        p.isChoose = p.id == id
        this.$set(this.depts_copy, i, p)
      })
      this.deptVisable = false

      this.getList()
    }
  },
  mounted() {
    this.curDeptId = this.deptId
    this.curDeptName = this.deptName == '未分配' ? '' : this.deptName

    this.freshHeight = document.documentElement.clientHeight - 50 * 2

    getDepts().then(({ code, data, message }) => {
      if (code == 200) {
        this.depts = data.map(m => {
          return m
        })
        this.depts_copy = data.map(m => {
          return m
        })
      }
    })
    if (this.curDeptId != '-1') {
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