<template>
  <van-pull-refresh success-text="刷新成功" v-model="isLoading" @refresh="onRefresh">
    <div ref="fresh" :style="{
                                height: freshHeight + 'px',
                                'overflow-y': 'scroll',
                                'box-sizing': 'border-box'
                              }">
      <van-empty v-if="!list.length > 0" description="没有发现记录"></van-empty>
      <div class="lists_item" :style="{
                                  color: item.isDeleted ? '#999999' : ''
                                }" v-for="(item, index) in list" :key="index">
        <div class="oneLine">
          <div class="operator">供应商:{{ item.partnerName }}</div>
          <div class="add_time">{{ item.isDeleted ? '已作废' : item.auditState }}</div>
        </div>
        <div class="content" :style="{
                                    color: item.isDeleted ? '#999999' : 'rgb(153, 153, 153)',
                                    padding: '0 20px'
                                  }" style="">
          <div class="item" style="display: inline-flex;width: 100%;justify-content: space-between;">
            <div>
              <span style="margin-right: 3px">采购单号 :</span>{{ item.billNo }}</div>
            <div style="font-size:16px">
              {{ item.readflag }}</div>
          </div>
          <div class="item">
            <span style="margin-right: 3px">制单日期 :</span>{{ item.dateStr }}</div>
          <div class="item">
            <span style="margin-right: 3px">采购日期 :</span>{{ item.askDateStr }}</div>
          <div class="item">
            <span style="margin-right: 3px">到货日期 :</span>{{ item.requiredDateStr }}</div>
          <div class="item" v-if="item.status == 1">
            <span style="margin-right: 3px">审批人 :</span>{{ item.auditerName }}
          </div>
          <div class="item" v-if="item.status == 1">
            <span style="margin-right: 3px">审批日期 :</span>{{ item.auditDateStr }}
          </div>

          <div @click="onClick('/p81_2', item)" class="detailsInfo">查看详情</div>
        </div>
      </div>
    </div>
  </van-pull-refresh>
</template>
<script>
import { getBhList } from '@/api/bh.js'
import dayjs from 'dayjs'
import { mapGetters } from 'vuex'
export default {
  name: `ListItem`,
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
  computed: {
    ...mapGetters(['partnerId'])
  },
  methods: {
    onRefresh() {
      this.list = []
      this.getList()
    },
    getList() {
      getBhList({ type: this.type, partnerId: this.partnerId })
        .then(({ code, data, message }) => {
          if (code == 200) {
            this.list = Array.from(new Set(data.map(f => f.id)))
              .map(f => {
                let m = data.filter(m => m.id == f)[0]
                return {
                  id: f,
                  partnerName: m.partnerName,
                  billNo: m.billNo,
                  dateStr: dayjs(m.date).format('YYYY-MM-DD'),
                  askDateStr: dayjs(m.askDate).format('YYYY-MM-DD'),
                  requiredDateStr: dayjs(m.requiredDate).format('YYYY-MM-DD'),
                  auditDateStr: dayjs(m.auditDate).format('YYYY-MM-DD HH:mm:ss'),
                  isDeleted: m.isDeleted == 1,
                  readflag: m.readflag == '未读' ? '未读' : '已读',
                  allIsOk: data.filter(ff => ff.id == f).every(s => s.quantity <= s.finishQuantity)
                }
              })
              .filter(f => f.allIsOk == this.type)
          } else {
            this.$toast({ type: 'fail', message })
          }
          this.isLoading = false
        })
        .catch(() => {
          this.isLoading = false
        })
    },
    onClick(path, item) {
      this.$emit('handlerClick', { path, item })
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