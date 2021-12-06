<template>
  <div id="app">
    <van-nav-bar
      :left-text="canShowLeft ? '返回' : ''"
      :left-arrow="canShowLeft"
      :title="title"
      v-if="canShow"
      safe-area-inset-top
      fixed
      @click-left="onClickLeft"
      @click-right="onClickRight"
    >
      <template #right v-if="canShowRight"> <van-icon :name="rightIcon[index]" size="18" /> </template
    ></van-nav-bar>
    <transition
      :name="transitionName"
      :duration="duration"
      enter-class="van-enter-class"
      enter-active-class="van-enter-active-class"
      leave-active-class="van-leave-active-class"
      leave-to-class="van-leave-to-class"
    >
      <router-view />
    </transition>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
export default {
  name: 'App',
  data() {
    return {
      index: 0,
      hideLeftPath: ['/', '/home', '/list', '/about', '/bind', '/p32'],
      showRightPath: ['/p10', '/p20', '/p40', '/p50'],
      rightIcon: ['plus', 'plus', 'plus', 'plus'],
      duration: { enter: 300, leave: 1000 },
      transitionName: 'van-slide-right'
    }
  },
  computed: {
    ...mapGetters(['title']),
    canShow() {
      return this.$route.path != '/login'
    },
    canShowLeft() {
      return this.hideLeftPath.findIndex(f => f == this.$route.path) < 0
    },
    canShowRight() {
      this.index = this.showRightPath.findIndex(f => f == this.$route.path)
      return this.index > -1
    }
  },
  methods: {
    onClickLeft() {
      if (!this.canShowLeft) return
      this.$router.back()
    },
    onClickRight() {
      if (!this.canShowRight) return
      let path = ''
      switch (this.$route.path) {
        case '/p10':
          path = '/p11'
          break
        case '/p20':
          path = '/p21'
          break
        case '/p40':
          path = '/p41'
          break
        case '/p50':
          path = '/p51'
          break
      }
      this.$router.push({
        path,
        query: { group: new Date() * 1 }
      })
    }
  },
  watch: {
    $route(to, from) {
      //获取当前路由数据，并转化为数组，没有就默认为空
      let routersArr = (sessionStorage.getItem('routers') && sessionStorage.getItem('routers').split(',')) || []
      //如果当前的路由数组为空那么添加 from 的路径以及 to 的路径
      if (routersArr.length == 0) {
        routersArr.push(from.path)
        routersArr.push(to.path)
      } else {
        //检查即 to 的路径，如果存在在当前路由数组，那么是返回操作，删除此路径及以后的路径
        if (routersArr.indexOf(to.path) != -1) {
          this.transitionName = 'van-slide-left'
          routersArr.splice(routersArr.indexOf(to.path) + 1, 100)
          //如果不存在，那么添加该路径到路由数组中
        } else {
          this.transitionName = 'van-slide-right'
          routersArr.push(to.path)
        }
      }
      //存入本地sessionStorage,并转为字符串
      sessionStorage.setItem('routers', routersArr.join(','))
    }
  }
}
</script>
<style lang="scss">
.van-enter-active-class,
.van-leave-active-class {
  transition-property: background-color, transform;
}

.van-enter-class,
.van-leave-to-class {
  background-color: red;
  transform: rotate(-360deg) translate3d(-100%, -100%, 0);
}
</style>
