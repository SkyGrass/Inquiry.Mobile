<template>
  <div class="wrapper">
    <van-cell :title="ele.label" is-link v-for="ele in list" :key="ele.value" @click="go(ele)" />
  </div>
</template>
<script>
import { mounted } from '@/mix/mounted.js'
export default {
  name: `p60`,
  mixins: [mounted],
  data() {
    return {
      list: [
        { id: 0, value: 'vInverntory', label: '存货档案', path: '/p61' },
        { id: 1, value: 'vInverntoryCls', label: '存货分类档案', path: '/p61' },
        { id: 2, value: 'vPartner', label: '供应商档案', path: '/p61' },
        { id: 3, value: 'vPerson', label: '职员档案', path: '/p61' },
        { id: 4, value: 'vDepartment', label: '部门档案', path: '/p61' }
      ]
    }
  },
  methods: {
    go({ path, id }) {
      this.$router.push({ path: path, query: { id } })
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