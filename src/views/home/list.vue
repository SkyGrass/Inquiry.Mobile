<template>
  <div class="wrapper">
    <van-tabs v-model="active" @change="onChange">
      <van-tab name="0" title="未处理"> <list-item type="0" @handlerClick="goToDetails" /></van-tab>
      <van-tab name="1" title="已处理"> <list-item type="1" @handlerClick="goToDetails" /></van-tab>
    </van-tabs>
  </div>
</template>
<script>
import { mounted } from '@/mix/mounted.js'
import ListItem from './listitem.vue'
import { setStorage, getStorage } from '@/utils/index.js'
export default {
  mixins: [mounted],
  name: 'list',
  components: {
    ListItem
  },
  data() {
    return {
      active: 0
    }
  },
  methods: {
    goToDetails({ path, item }) {
      this.$router.push({ path: path, query: { id: item.id } })
    },
    onChange(name) {
      setStorage('tab_list', name)
    }
  },
  mounted() {
    const index = getStorage('tab_list')
    if (index != null) {
      this.active = index
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
  bottom: 0px;
  overflow: hidden;
  height: calc(100vh - 46px);
  .search {
    height: 50px;
  }
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