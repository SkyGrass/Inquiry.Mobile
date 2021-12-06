<template>
  <div class="app-container">
    <div class="layout-content">
      <keep-alive v-if="$route.meta.keepAlive">
        <router-view></router-view>
      </keep-alive>
      <router-view v-else></router-view>
    </div>
    <div class="layout-footer">
      <TabBar :data="tabbars" @change="handleChange" />
    </div>
  </div>
</template>

<script>
import { getAuditCount } from '@/api/home.js'
import TabBar from '@/components/TabBar'
import { mapActions } from 'vuex'
export default {
  name: 'AppLayout',

  data() {
    return {
      tabbars: [
        {
          title: '首页',
          to: {
            name: 'Home'
          },
          icon: 'home-o'
        },
        {
          title: '待办',
          to: {
            name: 'List'
          },
          icon: 'orders-o'
        },
        {
          title: '关于我',
          to: {
            name: 'About'
          },
          icon: 'user-o'
        }
      ]
    }
  },

  components: {
    TabBar
  },
  methods: {
    ...mapActions(['setCount']),
    handleChange(v) {
      //console.log('tab value:', v)
    }
  },
  mounted() {
    getAuditCount().then(({ code, data, message }) => {
      if (code == 200) {
        this.setCount(data.count);
      }
    })
  }
}
</script>
