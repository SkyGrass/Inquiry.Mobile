<template>
  <van-pull-refresh :disabled="forbidden" success-text="刷新成功" v-model="isLoading" @refresh="onRefresh">
    <div ref="fresh" :style="{ 
          'overflow-y': 'scroll',
          'box-sizing': 'border-box'
        }">
      <van-empty v-if="!list.length > 0" description="没有发现记录"></van-empty>
      <div :style="{
            color: item.isDeleted ? '#999999' : ''
          }" v-for="(item, index) in list" :key="index">
        <van-cell v-if="type == 0" :title="item.displayName" is-link @click="bind(item)" />
        <van-cell v-else-if="type == 1" :title="item.displayName" :value="item.partnerName" is-link @click="unBindPartner(item)" />
        <van-cell v-else-if="type == 2" :title="item.displayName" :value="item.deptName" is-link @click="unBindPerson(item)" />
      </div>

      <van-action-sheet v-model="showBind" title="请选择要绑定的档案" :actions="actions" cancel-text="取消" close-on-click-action @select="doSelect" @cancel="showBind = false" />
    </div>

    <van-popup v-model="partnerVisable" safe-area-inset-bottom round position="bottom" :style="{ height: '80%' }">
      <van-tabs>
        <van-tab title="供应商列表">
          <van-search v-model="keywordPartner" placeholder="请输入搜索关键词" show-action @search="onSearchPartner" @cancel="onCancelPartner" />
          <van-list :finished="finishedPartner" finished-text="没有更多了">
            <van-cell v-for="item in partners" :key="item.id" :title="item.name">
              <template>
                <van-button :disabled="item.isChoose" @click="onChoosePartner(item)" :type="item.isChoose ? '' : 'primary'" size="small">选取</van-button>
              </template>
            </van-cell>
          </van-list>
        </van-tab>
      </van-tabs>
    </van-popup>

    <van-popup v-model="personVisiable" safe-area-inset-bottom round position="bottom" :style="{ height: '80%' }">
      <van-tabs>
        <van-tab title="职员列表">
          <van-search v-model="keywordPerson" placeholder="请输入搜索关键词" show-action @search="onSearchPerson" @cancel="onCancelPerson" />
          <van-list :finished="finishedPerson" finished-text="没有更多了">
            <van-cell v-for="item in persons" :key="item.id" :title="item.name">
              <template>
                <van-button :disabled="item.isChoose" @click="onChoosePerson(item)" :type="item.isChoose ? '' : 'primary'" size="small">选取</van-button>
              </template>
            </van-cell>
          </van-list>
        </van-tab>
      </van-tabs>
    </van-popup>

    <van-popup v-model="deptVisiable" safe-area-inset-bottom round position="bottom" :style="{ height: '80%' }">
      <van-tabs>
        <van-tab title="科室列表">
          <van-search v-model="keywordDept" placeholder="请输入搜索关键词" show-action @search="onSearchDept" @cancel="onCancelDept" />
          <van-list :finished="finishedDept" finished-text="没有更多了">
            <van-cell v-for="item in depts" :key="item.id" :title="item.name">
              <template>
                <van-button :disabled="item.isChoose" @click="onChooseDept(item)" :type="item.isChoose ? '' : 'primary'" size="small">选取</van-button>
              </template>
            </van-cell>
          </van-list>
        </van-tab>
      </van-tabs>
    </van-popup>
  </van-pull-refresh>
</template>
<script>
import { getBindList, bindPartner, bindPerson, unBindPartner, unBindPerson } from '@/api/bind.js'
import { getBaseList } from '@/api/base.js'
export default {
  name: `ListItem`,
  props: {
    type: { type: String }
  },
  data() {
    return {
      isLoading: false,
      list: [],
      freshHeight: '',
      actions: [
        { key: 2, name: '供应商' },
        { key: 3, name: '职员' }
      ],
      showBind: false,
      personVisiable: false,
      partnerVisable: false,
      deptVisiable: false,
      finishedPartner: false,
      finishedPerson: false,
      finishedDept: false,
      partners: [],
      partners_copy: [],
      persons: [],
      persons_copy: [],
      depts: [],
      depts_copy: [],
      keywordPartner: '',
      keywordPerson: '',
      keywordDept: '',
      chooseUserId: '',
      choosePersonId: '',
      choosePersonName: ''
    }
  },
  computed: {
    forbidden() {
      return this.personVisiable || this.partnerVisable
    }
  },
  methods: {
    onRefresh() {
      this.list = []
      this.getList()
    },
    getList() {
      getBindList({ type: this.type })
        .then(({ code, data, message }) => {
          if (code == 200) {
            this.list = data
          } else {
            this.$toast({ type: 'fail', message })
          }
          this.isLoading = false
        })
        .catch(() => {
          this.isLoading = false
        })
    },
    bind({ userGuid }) {
      this.chooseUserId = userGuid
      this.showBind = true
    },
    unBindPartner({ userGuid }) {
      this.$dialog
        .confirm({
          title: '提示',
          message: '您正在解绑用户的供应商档案?'
        })
        .then(() => {
          unBindPartner({ userId: userGuid }).then(({ code, data, message }) => {
            if (code == 200) {
              return this.$toast({
                type: 'success',
                message: '解绑成功!',
                onClose: () => {
                  this.getList()
                }
              })
            } else {
              return this.$toast({
                type: 'fail',
                message,
                onClose: () => {
                  this.getList()
                }
              })
            }
          })
        })
        .catch(() => { })
    },
    unBindPerson({ userGuid }) {
      this.$dialog
        .confirm({
          title: '提示',
          message: '您正在解绑用户的职业档案?'
        })
        .then(() => {
          unBindPerson({ userId: userGuid }).then(({ code, data, message }) => {
            if (code == 200) {
              return this.$toast({
                type: 'success',
                message: '解绑成功!',
                onClose: () => {
                  this.getList()
                }
              })
            } else {
              return this.$toast({ type: 'fail', message: message })
            }
          })
        })
        .catch(() => { })
    },
    onSearchPartner(val) {
      this.partners = this.partners_copy.filter(f => f.name.indexOf(val) > -1 || f.code.indexOf(val) > -1)
    },
    onCancelPartner() {
      this.partners = this.partners_copy
    },
    onSearchPerson(val) {
      this.persons = this.persons_copy.filter(f => f.name.indexOf(val) > -1 || f.code.indexOf(val) > -1)
    },
    onCancelPerson() {
      this.persons = this.persons_copy
    },
    onSearchDept(val) {
      this.depts = this.depts_copy.filter(f => f.name.indexOf(val) > -1 || f.code.indexOf(val) > -1)
    },
    onCancelDept() {
      this.depts = this.depts_copy
    },
    doSelect({ key }) {
      this.personVisiable = false
      this.partnerVisable = false
      this.deptVisiable = false

      getBaseList({ type: key, notbind: 1 }).then(({ code, data, message }) => {
        if (key == 2) {
          this.partners = data.map(m => {
            m.isChoose = false
            return m
          })
          this.partners_copy = data.map(m => {
            m.isChoose = false
            return m
          })
          this.partnerVisable = true
          this.finishedPartner = true
        } else if (key == 3) {
          this.persons = data.map(m => {
            m.isChoose = false
            return m
          })
          this.persons_copy = data.map(m => {
            m.isChoose = false
            return m
          })
          this.personVisiable = true
          this.finishedPerson = true
        } else if (key == 4) {
          this.depts = data.map(m => {
            m.isChoose = false
            return m
          })
          this.depts_copy = data.map(m => {
            m.isChoose = false
            return m
          })
          this.deptVisiable = true
          this.finishedDept = true
        }
      })
    },
    onChoosePartner({ id, code, name }) {
      this.$dialog
        .confirm({
          title: '提示',
          message: '您确定要绑定用户到当前供应商吗?'
        })
        .then(() => {
          this.partnerVisable = false
          bindPartner({ userId: this.chooseUserId, partnerId: id, partnerName: name })
            .then(({ code, data, message }) => {
              if (code == 200) {
                this.$toast({
                  type: 'success',
                  message: '绑定成功!',
                  onClose: () => {
                    this.getList()
                  }
                })
              } else {
                this.$toast({
                  type: 'fail',
                  message: message,
                  onClose: () => {
                    this.getList()
                  }
                })
              }
            })
            .catch(err => { })
        })
    },
    onChoosePerson({ id, code, name }) {
      this.$dialog
        .alert({
          title: '提示',
          message: '请继续为用户绑定部门!'
        })
        .then(() => {
          this.choosePersonId = id
          this.choosePersonName = name
          this.doSelect({ key: 4 })
        })
    },
    onChooseDept({ id, code, name }) {
      this.$dialog
        .confirm({
          title: '提示',
          message: '您确定要绑定用户到当前职员吗?'
        })
        .then(() => {
          this.deptVisiable = false
          bindPerson({
            userId: this.chooseUserId,
            personId: this.choosePersonId,
            personName: this.choosePersonName,
            deptId: id,
            deptName: name
          })
            .then(({ code, data, message }) => {
              if (code == 200) {
                this.$toast({
                  type: 'success',
                  message: '绑定成功!',
                  onClose: () => {
                    this.getList()
                  }
                })
              } else {
                this.$toast({
                  type: 'fail',
                  message: message,
                  onClose: () => {
                    this.getList()
                  }
                })
              }
            })
            .catch(err => { })
        })
    }
  },
  mounted() {
    this.getList()

    this.freshHeight = document.documentElement.clientHeight - this.$refs.fresh.getBoundingClientRect().top
  }
}
</script>
<style lang="scss" scoped>
.lists_item {
  margin-bottom: 5px;
  background: #fdfdfd;
  padding-bottom: 6px; // box-shadow: 0 4px 4px rgba(219, 219, 219, 0.9);
  // margin: 10px;
  border-radius: 8px;

  .oneLine {
    font-weight: bold;
    display: flex;
    justify-content: space-between; // line-height: 30px;
    // height: 25px;
    padding: 10px 20px;
    border-bottom: 0.7px solid #ebebeb;

    .operator {
      font-size: 14px;
    }
    .add_time {
      font-size: 14px;
    }
  }

  .item {
    font-weight: bold;
    margin-top: 9px;
  }
}

.content {
  position: relative;
}

.detailsInfo {
  position: absolute;
  right: 20px;
  bottom: 5px;
  border-radius: 5px;
  padding: 3px 10px;
  background: #1989fa;
  color: #ffffff;
}

.swipe {
  width: 100%;
  height: 250px;
  img {
    width: 100%;
    height: 250px;
  }
}

.item-list {
  display: flex;
  li {
    width: 25%;
    text-align: center;
  }
}
</style> 