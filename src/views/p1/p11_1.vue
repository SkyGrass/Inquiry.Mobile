<template>
  <div class="root">
    <div class="vcr">
      <van-cell-group title="用户信息">
        <van-cell title="申购人" :value="currentUserName" />
        <van-cell title="申购部门" :value="currentDeptName" :is-link="!forbidden" @click="chooseDept" />
      </van-cell-group>

      <van-cell-group title="表单信息">
        <van-cell title="申购日期" :value="date" @click="chooseDate" :is-link="!forbidden" />
      </van-cell-group>

      <van-cell-group>
        <template #title>
          <span>申购详情 </span>
        </template>
        <van-cell-group :title="c.clsName" v-for="(c, i) in cars" :key="i">
          <van-cell :label="v.specification" v-for="(v, a) in c.invs" :key="a" :title-class='titleCls'>
            <template #title>
              <span class="custom-title">{{ v.name }}</span>
              <van-tag type="danger">{{ v.unitname }}</van-tag>
            </template>
            <template #label>
              <span class="custom-title">规格:{{ v.specification == '' ? '-' : v.specification }}</span>
              <van-field v-model="v.remark" rows="1" autosize label="其他说明" type="textarea" placeholder="请输入说明" />
            </template>
            <template>
              <span>{{ v.count }}{{ v._unit }}</span>
            </template>
          </van-cell>
        </van-cell-group>
      </van-cell-group>

      <div style="margin: 16px">
        <van-button round block type="info" @click="submit">提交</van-button>
      </div>
    </div>
    <van-popup v-model="showDept" round position="bottom" :style="{ height: '40%' }">
      <van-picker show-toolbar @confirm="confirmDept" value-key="name" title="选择部门" :columns="depts" :default-index="currentDeptIndex" />
    </van-popup>
    <van-popup v-model="showDate" round position="bottom" :style="{ height: '40%' }">
      <van-datetime-picker :min-date="minDate" @confirm="confirmDate" v-model="currentDate" type="date" title="选择年月日" />
    </van-popup>
  </div>
</template>
<script>
import { mounted } from '@/mix/mounted.js'
import { mapGetters } from 'vuex'
import dayjs from 'dayjs'
import { setStorage, getStorage } from '@/utils/index.js'
import { getDepts } from '@/api/home.js'
import { save, modify, getSub } from '@/api/sg.js'
export default {
  mixins: [mounted],
  name: `p11_1`,
  data() {
    return {
      id: -1,
      showDate: false,
      showTime: false,
      showDept: false,
      currentUserName: '',
      currentBillerId: -1,
      currentDeptId: -1,
      currentDeptName: '',
      currentDate: new Date(),
      currentDeptIndex: 0,
      minDate: new Date(),
      invs_p: [],
      depts: [],
      forbidden: false,
      titleCls: 'titleCls'
    }
  },
  asyncComputed: {
    ...mapGetters(['userName', 'billerId', 'deptId', 'deptName']),
    date() {
      return dayjs(this.currentDate).format('YYYY-MM-DD')
    },
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
    id() {
      return this.$route.query.id
    }
  },
  methods: {
    chooseDate() {
      if (this.forbidden) return
      this.showDate = true
    },
    confirmDate() {
      this.showDate = false
    },
    chooseDept() {
      if (this.forbidden) return
      this.showDept = true
    },
    confirmDept(value) {
      const { id, name } = value
      this.currentDeptId = id
      this.currentDeptName = name
      this.showDept = false
    },
    submit() {
      this.$dialog
        .confirm({
          title: '提示',
          message: '确定要提交购申请吗?'
        })
        .then(() => {
          if (this.id > 0) {
            modify({
              subscribe: { id: this.id },
              subscribeEntry: this.invs_p.map(m => {
                return {
                  invId: m.id,
                  quantity: m.count,
                  remark: m.remark,
                  unitname: m._unit
                }
              }),
              context: this.invs_p
            })
              .then(({ code, data, message }) => {
                if (code == 200) {
                  setStorage(this.id + '_shopCar_Temp', '')
                }
                this.$dialog
                  .alert({
                    title: '提示',
                    message: message
                  })
                  .then(() => {
                    if (code == 200) {
                      this.$router.go(-2)
                    }
                  })
              })
              .catch(err => {
                this.$dialog.alert({
                  title: '提示',
                  message: '保存订单发生异常!'
                })
              })
          } else {
            save({
              subscribe: { date: this.date, deptId: this.currentDeptId, billerId: this.currentBillerId },
              subscribeEntry: this.invs_p.map(m => {
                return {
                  invId: m.id,
                  quantity: m.count,
                  remark: m.remark,
                  unitname: m._unit
                }
              }),
              context: this.invs_p
            })
              .then(({ code, data, message }) => {
                if (code == 200) {
                  setStorage('shopCar_P11', '')
                }
                this.$dialog
                  .alert({
                    title: '提示',
                    message: message
                  })
                  .then(() => {
                    if (code == 200) {
                      this.$router.go(-2)
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
    }
  },
  mounted() {
    const id = this.$route.query.id
    setTimeout(() => {
      this.$nextTick(() => {
        if (id == void 0) {
          this.currentUserName = this.userName
          this.currentDeptId = this.deptId
          this.currentDeptName = this.deptName
          this.currentBillerId = this.billerId
        }
      })
    }, 100)

    if (id) {
      this.forbidden = true
      getSub({ id }).then(({ code, data, message }) => {
        if (code == 200) {
          this.currentUserName = data[0].billerName
          this.currentBillerId = data[0].billerId
          this.currentDeptId = data[0].deptId
          this.currentDeptName = data[0].deptName
          this.date = dayjs(data[0].date).format('YYYY-MM-DD')
        }
      })
    }

    getDepts().then(({ code, data, message }) => {
      if (code == 200) {
        this.depts = data
        this.currentDeptIndex = data.findIndex(f => f.id == this.deptId)
      }
    })

    const data = id > 0 ? getStorage(id + '_shopCar_Temp') : getStorage('shopCar_P11')
    if (data != '') {
      this.invs_p = JSON.parse(data).map(m => {
        return m
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

.titleCls {
  flex: 5
}
</style>