<template>
  <van-pull-refresh success-text="刷新成功" v-model="isLoading" @refresh="onRefresh">
    <div
      ref="fresh"
      :style="{
        height: freshHeight + 'px',
        'overflow-y': 'scroll',
        'box-sizing': 'border-box',
        'padding-bottom': '44px'
      }"
    >
      <van-empty v-if="!list.length > 0" description="没有发现记录"></van-empty>
      <div
        class="lists_item"
        :style="{
          color: item.isDeleted ? '#999999' : ''
        }"
        v-for="(item, index) in list"
        :key="index"
      >
        <div class="oneLine">
          <div class="operator">申请人:{{ item.billerName }}({{ item.deptName }})</div>
          <div class="add_time">{{ item.isDeleted ? '已作废' : item.auditState }}</div>
        </div>
        <div
          class="content"
          :style="{
            color: item.isDeleted ? '#999999' : 'rgb(153, 153, 153)',
            padding: '0 20px'
          }"
          style=""
        >
          <div class="item"><span style="margin-right: 3px">类型 :</span>{{ item.billTypeName }}</div>
          <div class="item"><span style="margin-right: 3px">申购单号 :</span>{{ item.displayBillNo }}</div>
          <div class="item"><span style="margin-right: 3px">申购日期 :</span>{{ item.date }}</div>
          <div @click="onClick('/p11_2', item)" class="detailsInfo">查看详情</div>
        </div>
      </div>
    </div>
  </van-pull-refresh>
</template>
<script>
import { getAuditList } from '@/api/home.js'
import dayjs from 'dayjs'

export default {
  name: 'listitem',
  props: {
    type: { type: String }
  },
  data() {
    return {
      isLoading: false,
      list: [],
      freshHeight: ''
    }
  },
  methods: {
    onRefresh() {
      this.list = []
      this.getList()
    },
    getList() {
      getAuditList({ type: this.type })
        .then(({ code, data, message }) => {
          if (code == 200) {
            this.list = data.map(m => {
              m.billTypeName = this.getBillTypeName(m.billType)
              m.date = dayjs(m.date).format('YYYY-MM-DD HH:mm:ss')
              m.isDeleted = m.isDeleted == 1
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
    getBillTypeName(id) {
      return ['未定义', '申购单', '询价单'][id]
    },
    onClick(path, item) {
      this.$emit('handlerClick', { path, item })
    }
  },
  created() {
    this.getList()
  },
  mounted() {
    this.freshHeight = document.documentElement.clientHeight - 145
  }
}
</script>
<style lang="scss" scoped>
.lists_item {
  margin-bottom: 5px;
  background: #fdfdfd;
  padding-bottom: 6px;
  box-shadow: 0 4px 4px rgba(219, 219, 219, 0.9);
  margin: 10px;
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