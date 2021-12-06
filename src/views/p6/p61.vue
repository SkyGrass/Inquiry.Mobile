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
      <van-empty v-if="!list.length > 0" description="没有发现记录"></van-empty>

      <div class="lists_item">
        <van-cell v-for="(ele, i) in list" :key="i" :title="ele.name" :value="ele.code"></van-cell>
      </div>
    </div>
  </div>
</template>
<script>
import { mounted } from '@/mix/mounted.js'
import { getBaseList } from '@/api/base.js'

export default {
  name: `p61`,
  mixins: [mounted],
  data() {
    return {
      isLoading: false,
      list: [],
      listCopy: [],
      freshHeight: '',
      keyword: ''
    }
  },
  computed: {
    type() {
      return this.$route.query.id
    }
  },
  methods: {
    getList() {
      getBaseList({ type: this.type })
        .then(({ code, data, message }) => {
          if (code == 200) {
            this.list = data
            this.listCopy = data
          } else {
            this.$toast({ type: 'fail', message })
          }
          this.isLoading = false
        })
        .catch(() => {
          this.isLoading = false
        })
    },
    onSearch(val) {
      if (val != '') {
        this.list = this.listCopy.filter(f => {
          return f.code.indexOf(val) > -1 || f.name.indexOf(val) > -1
        })
      } else {
        this.list = this.listCopy
      }
    },
    onCancel() {
      this.list = this.listCopy
    }
  },
  mounted() {
    this.getList()
    this.freshHeight = document.documentElement.clientHeight - this.$refs.fresh.getBoundingClientRect().top
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