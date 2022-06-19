<template>
  <div class="wrapper">
    <div
      ref="fresh"
      :style="{
        height: freshHeight + 'px',
        'overflow-y': 'scroll',
        'box-sizing': 'border-box'
      }"
    >
      <van-search show-action v-model="keyword" placeholder="请输入搜索关键词" @search="onSearch" @cancel="onCancel" />
      <van-empty v-if="!dataList.length > 0" description="没有发现记录"></van-empty>

      <div class="lists_item">
        <van-cell
          v-for="(ele, i) in dataList"
          :label="'规格:' + ele.specification"
          :key="i"
          :title="ele.name"
          :value="ele.code"
        >
          <template>
            <van-button @click="onClickChoose(ele)" type="primary" size="small">选取</van-button>
          </template>
        </van-cell>
      </div>
    </div>
  </div>
</template>
<script>
import { mounted } from '@/mix/mounted.js'
import { searchInv } from '@/api/base.js'
import bus from '@/utils/bus'
export default {
  name: `p0`,
  mixins: [mounted],
  data() {
    return {
      keyword: '',
      freshHeight: '',
      dataList: []
    }
  },
  methods: {
    onSearch(val) {
      if (val != '') {
        searchInv({ keyword: val })
          .then(({ code, data, message }) => {
            if (code == 200) {
              this.dataList = data
            } else {
              this.$dialog.alert({
                title: '提示',
                message: '没有查询到存货!'
              })
            }
          })
          .catch(err => {
            this.$dialog.alert({
              title: '提示',
              message: '查询过程发生异常!'
            })
          })
      }
    },
    onCancel() {
      this.dataList = []
    },
    onClickChoose(ele) {
      bus.$emit('searchResult', ele)
      this.$router.go(-1)
    }
  },
  beforeDestroy() {
    bus.$off('searchResult')
  },
  mounted() {
    this.freshHeight = document.documentElement.clientHeight - 100//this.$refs.fresh.getBoundingClientRect().top
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
    padding-bottom: 6px;

    border-radius: 8px;
  }
}
</style> 