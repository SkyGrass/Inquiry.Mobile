<!-- home -->
<template>
  <div class="index-container">
    <div class="warpper">
      <van-grid :column-num="3">
        <van-grid-item v-for="menu in menus" :key="menu.guid" :text="menu.mobileName" @click="navPage(menu)">
          <van-image slot="icon" :src="menu.mobileIcon" />
        </van-grid-item>
      </van-grid>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import { getUserInfo, getMenu } from '@/api/user.js'

import { mounted } from '@/mix/mounted.js'
import { setToken, setStorage } from '@/utils/index.js'
export default {
  mixins: [mounted],
  data() {
    return {
      menus: []
    }
  },
  computed: {},
  mounted() {
    getMenu().then(res => {
      this.menus = res
        .filter(f => f.allowMobile == 1)
        .map(m => {
          if (m.mobileIcon == '' || m.mobileIcon == null) {
            m.mobileIcon = `icon_default.png`
          }
          m.mobileIcon = require('../../../static/img/' + m.mobileIcon)
          return m
        })
    })

    getUserInfo()
      .then(({ code, data, message }) => {
        this.setUserInfo(data)
        setStorage('userInfo', JSON.stringify(data))
        if (!data.isSuperAdmin && data.billerId == -1 && data.partnerId == -1) {
          this.$dialog
            .alert({
              title: '提示',
              message: '您的账号尚未进行绑定操作,暂时无法使用!'
            })
            .then(() => {
              setToken('')
              this.$router.replace({
                path: `/login`
              })
            })
        }
      })
      .catch(() => {})
  },

  methods: {
    ...mapActions(['setUserInfo']),
    navPage(menu) {
      this.$router.push({
        path: menu.mobileUrl
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.index-container {
  .warpper {
    background: #fff;
    position: absolute;
    left: 0;
    right: 0;
    top: 46px;
    bottom: 0px;
    overflow: hidden;
    height: calc(100vh - 46px);
    .demo-home__title {
      margin: 0 0 6px;
      font-size: 32px;
      .demo-home__title img,
      .demo-home__title span {
        display: inline-block;
        vertical-align: middle;
      }
      img {
        width: 32px;
      }
      span {
        margin-left: 16px;
        font-weight: 500;
      }
    }
    .demo-home__desc {
      margin: 0 0 20px;
      color: rgba(69, 90, 100, 0.6);
      font-size: 14px;
    }
  }
}
</style>
