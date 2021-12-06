<template>
  <div class="wrapper">
    <van-tabs v-model="active">
      <van-tab name="0" title="未审批"> <list-item type="0" @handlerClick="goToDetails" /></van-tab>
      <van-tab name="1" title="已审批"> <list-item type="1" @handlerClick="goToDetails" /></van-tab>
      <van-tab name="3" title="已作废"> <list-item type="3" @handlerClick="goToDetails" /></van-tab>
    </van-tabs>
  </div>
</template>
<script>
import { mounted } from '@/mix/mounted.js'
import ListItem from './listitem.vue'
import { setStorage, getStorage } from '@/utils/index.js'
export default {
  name: `p50`,
  mixins: [mounted],
  components: {
    ListItem
  },
  data() {
    return {
      active: 0,
      freshHeight: ''
    }
  },
  methods: {
    goToDetails({ path, item }) {
      setStorage('tab_p41', this.active)
      this.$router.push({ path: path, query: { id: item.id, partnerId: item.partnerId, group: item.group } })
    }
  },
  created() {},
  mounted() {
    const index = getStorage('tab_p41')
    if (index != null) {
      this.active = index
    }
  },
  beforeRouteLeave(to, from, next) {
    if (to.path == '/home') {
      setStorage('tab_p41', null)
    }
    next()
  }
}
</script>
<style lang="scss" scoped>
.wrapper {
  position: absolute;
  left: 0;
  right: 0;
  top: 46px;
  bottom: 0px;
  overflow: hidden;
  height: calc(100vh - 46px);
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
      justify-content: space-between;
      // line-height: 30px;
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