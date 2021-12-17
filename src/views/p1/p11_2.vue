<template>
  <div class="root">
    <div class="vcr">
      <van-notice-bar left-icon="volume-o" background="#e6e6e6e6" :text="description" />
      <van-cell-group title="用户信息">
        <van-cell title="申请人" :value="userName" />
        <van-cell title="申请部门" :value="deptName" />
      </van-cell-group>

      <van-cell-group title="表单信息">
        <van-cell title="申购日期" :value="date" />
      </van-cell-group>

      <van-cell-group>
        <template #title>
          <span>申购详情</span>
        </template>
        <van-cell-group :title="c.clsName" v-for="(c, i) in cars" :key="i">
          <van-cell :label="v.specification" v-for="(v, a) in c.invs" :key="a" :title-class="titleCls">
            <template #title>
              <span class="custom-title">{{ v.name }}</span>
              <!--<van-tag type="danger">{{ v.unitname }}</van-tag>-->
            </template>
            <template #label>
              <van-field label="规格" v-model="v.specification"></van-field>
              <van-field v-model="v.remark" readonly rows="1" autosize label="其他说明" type="textarea" placeholder="请输入说明" />
            </template>
            <template>
              <span>{{ v.count }}{{ v._unitname }}</span>
            </template>
          </van-cell>
        </van-cell-group>
      </van-cell-group>

      <van-cell-group title="审批信息" v-if="!isDeleted">
        <van-cell v-for="(info, index) in auditInfo" :key="index" :title="'审批人:' + info.userName" :value="info.auditState" :title-class="titleCls">
          <template #label v-if="info.flag > -1">
            <van-field label="审批时间" v-model="info.auditDate"></van-field>
            <van-field v-model="info.remark" :readonly="info.flag > -1" rows="1" autosize label="备注" type="textarea" :placeholder="info.flag > -1 ? info.remark : '请输入说明'" />
          </template>
        </van-cell>
      </van-cell-group>

      <div style="margin: 16px">
        <van-button v-if="!isDeleted && isMy" round block type="danger" @click="del">作废</van-button>
        <van-button style="margin: 5px" v-if="myAuditDone && needAudit" round block type="warning" @click="unAudit">反审批</van-button>
        <van-button style="margin: 5px" v-if="waitMyAudit && needAudit" round block type="warning" @click="modify">调整</van-button>
        <van-button style="margin: 5px" v-if="waitMyAudit && needAudit" round block type="primary" @click="audit">审批</van-button>
      </div>

      <van-action-sheet v-model="showAudit" title="请选择" :actions="actions" cancel-text="取消" close-on-click-action @select="doAudit" @cancel="showAudit = false" />

      <van-dialog v-model="showDialog" title="留言" show-cancel-button @confirm="post">
        <van-field v-model="message" rows="2" autosize type="textarea" placeholder="请输入说明或者拒绝原因" />
      </van-dialog>
    </div>
  </div>
</template>
<script>
import { mounted } from '@/mix/mounted.js'
import { mapGetters } from 'vuex'
import dayjs from 'dayjs'
import { setStorage, getStorage, groupBy } from '@/utils/index.js'
import { getSub, del } from '@/api/sg.js'
import { getAuditInfo, auditBill, unAuditBill } from '@/api/home.js'

export default {
  mixins: [mounted],
  name: `p11_2`,
  data() {
    return {
      id: -1,
      type: -1,
      isDeleted: 0,
      userName: '',
      deptName: '',
      date: '',
      invs_p: [],
      auditInfo: [],
      showAudit: false,
      showDialog: false,
      message: '',
      flag: 2,
      actions: [
        { key: 2, name: '拒绝', color: '#ee0a24' },
        { key: 1, name: '通过' }
      ],
      isMy: false,
      titleCls: 'titleCls',
      needAudit: true
    }
  },
  asyncComputed: {
    ...mapGetters(['userId']),
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
    async noAudit() {
      return this.auditInfo.filter(f => f.flag > -1).length <= 0
    },
    async waitMyAudit() {
      return this.auditInfo.filter(f => f.userGuid.split(',').filter(ff => ff == this.userId).length > 0 && f.flag == -1).length > 0
    },
    async myAuditDone() {
      return this.auditInfo.filter(f => f.userGuid.split(',').filter(ff => ff == this.userId).length > 0 && f.flag == 1).length > 0
    },
    async waitAudit() {
      return (
        this.auditInfo.filter(f => f.flag > -1).length < this.auditInfo.length &&
        this.auditInfo.filter(f => f.flag > -1).length > 0
      )
    },
    async haveAudit() {
      return this.auditInfo.filter(f => f.flag > -1).length == this.auditInfo.length
    },
    async description() {
      if (this.isDeleted) {
        return '当前申请已作废'
      } else {

        if (this.noAudit) {
          return '当前申请等待审批'
        } else if (this.waitAudit) {
          return '当前申请审批中'
        } else if (this.haveAudit) {
          return '当前申请已审批'
        }

      }
    },
    async level() {
      const t = this.auditInfo.filter(f => f.userGuid.split(',').filter(ff => ff == this.userId).length > 0);
      if (t.length > 0) {
        return t[0].no
      } else {
        return -1;
      }
    }
  },
  methods: {
    modify() {
      this.$dialog
        .confirm({
          title: '提示',
          message: '您确定要调整当前申请单吗?'
        })
        .then(() => {
          setStorage(
            this.id + '_shopCar_Temp',
            JSON.stringify(
              this.invs_p.map(m => {
                return {
                  cid: m.clsId,
                  id: m.invId,
                  code: m.code,
                  name: m.name,
                  specification: m.specification,
                  idunit: m.idunit,
                  unitname: m.unitname,
                  idinventoryclass: m.idinventoryclass,
                  clsName: m.clsName,
                  clsId: m.clsId,
                  count: m.count,
                  remark: m.remark,
                  _unit: m._unitname
                }
              })
            )
          )
          this.$router.replace({
            path: `/p11`,
            query: { id: this.id }
          })
        })
        .catch(() => { })
    },
    unAudit() {
      this.$dialog
        .confirm({
          title: '提示',
          message: '确定要反审批当前申请吗?'
        })
        .then(() => {
          unAuditBill({ billType: this.type, billId: this.id, date: this.date })
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
            .catch(err => { })
        })
        .catch(() => { })
    },
    audit() {
      this.showAudit = true
    },
    del() {
      this.$dialog
        .confirm({
          title: '提示',
          message: '确定要作废当前申请吗?'
        })
        .then(() => {
          del({
            id: this.id
          })
            .then(({ code, data, message }) => {
              this.$dialog
                .alert({
                  title: '提示',
                  message: message
                })
                .then(() => {
                  this.$router.go(-1)
                })
            })
            .catch(err => {
              this.$dialog.alert({
                title: '提示',
                message: '操作过程发生异常!'
              })
            })
        })
        .catch(() => { })
    },
    doAudit(val) {
      const { key } = val
      this.flag = key
      this.showDialog = true
    },
    post() {
      auditBill({ billType: this.type, billId: this.id, flag: this.flag, remark: this.message, no: this.level })
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
        .catch(err => { })
    },
    submit() {
      this.$dialog
        .confirm({
          title: '提示',
          message: '确定要提交采购申请吗?'
        })
        .then(() => {
          save({
            subscribe: { date: this.date, deptId: this.currentDeptId, billerId: this.billerId },
            subscribeEntry: this.invs_p.map(m => {
              return {
                invId: m.id,
                quantity: m.count,
                remark: m.remark
              }
            })
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
                  this.$router.go(-2)
                })
            })
            .catch(err => {
              this.$dialog.alert({
                title: '提示',
                message: '保存订单发生异常!'
              })
            })
        })
        .catch(() => { })
    }
  },
  mounted() {
    const id = this.$route.query.id
    if (id) {
      this.id = id
      getSub({ id })
        .then(({ code, data, message }) => {
          if (code == 200) {
            this.userName = data[0].billerName
            this.deptName = data[0].deptName
            this.isDeleted = data[0].isDeleted == 1
            this.type = data[0].billType
            this.isMy = data[0].createdByUserGuid == this.userId
            this.date = dayjs(data[0].date).format('YYYY-MM-DD')
            this.needAudit = data[0].needAudit
            this.invs_p = data.map(m => {
              m.count = m.quantity
              return m
            })

            getAuditInfo({ billType: data[0].billType, billId: data[0].id }).then(({ code, data, message }) => {
              if (code == 200) {
                let nt = groupBy(data, 'no');
                this.auditInfo = (nt.map(ele => {
                  return {
                    no: ele[0]['no'],
                    flag: ele.every(e => e.flag == -1) ? -1 : ele.filter(e => e.flag > -1)[0].flag,
                    auditDate: ele.every(e => e.flag == -1) ? '-' : dayjs(ele.filter(e => e.flag > -1)[0].auditDate).format('YYYY-MM-DD HH:mm:ss'),
                    auditState: ele.every(e => e.flag == -1) ? '等待审批' : ele.some(e => e.flag == 1) ?
                      (ele.filter(e => e.flag == 1)[0].userName) + '已通过' : (ele.filter(e => e.flag == 2)[0].userName) + '已拒绝',
                    userName: ele.map(e => e.userName).join(' 或 '),
                    userGuid: ele.map(e => e.userGuid).join(','),
                    remark: ele[0].remark
                  }
                }))
                // this.auditInfo = data.map(m => {
                //   m.auditDate = m.auditDate == null ? '-' : dayjs(m.auditDate).format('YYYY-MM-DD HH:mm:ss')
                //   m.auditState = m.flag == -1 ? '等待审批' : m.flag == 1 ? '已通过' : '已拒绝'
                //   return m
                // })
              }
            })

          } else {
            this.$toast({ type: 'fail', message: '未能查询到订单详情!' })
          }
        })
        .catch(() => {
          this.$toast({ type: 'fail', message: '查询订单详情发生错误!' })
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
  flex: 4
}
</style>