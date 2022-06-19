<!-- home -->
<template>
  <div class="about-container">
    <div class="warpper">
      <div class="logo">
        <van-image round width="2rem" height="2rem" :src="avator" />
      </div>
      <p class="info">{{ userName }}({{ proTitle }})</p>
      <van-cell-group inset>
        <van-cell title="修改密码" is-link @click="changepwd" />
        <van-cell v-if="!wechatBind" title="绑定微信" is-link @click="bind" />
        <van-cell v-if="wechatBind" title="解绑微信" is-link @click="unbind" />
      </van-cell-group>
      <van-cell-group inset style="margin-top: 8px">
        <van-cell title="清除缓存" is-link @click="clear" />
      </van-cell-group>
      <van-row type="flex" justify="center">
        <van-col span="20">
          <van-button type="warning" size="small" @click="doLogOut">退出账号</van-button>
        </van-col>
      </van-row>
    </div>
  </div>
</template>

<script>
// 请求接口
import { getUserInfo } from '@/api/user.js'
import { mapGetters, mapActions } from 'vuex'
import { setToken, setStorage } from '@/utils/index.js'
import { mounted } from '@/mix/mounted.js'
import { unBindWechat } from '@/api/bind.js'
export default {
  mixins: [mounted],
  data() {
    return {
      wechat: `${this.$cdn}/wx/640.gif`,
      wechatBind: false,
      authUrl: ''
    }
  },
  computed: {
    ...mapGetters(['userName', 'proTitle', 'avator', 'userId'])
  },
  mounted() {
    this.initData()
  },
  methods: {
    ...mapActions(['setUserInfo']),
    initData() {
      getUserInfo()
        .then(({ code, data, message }) => {
          this.setUserInfo(data)
          this.wechatBind = data.wechatBind
          this.authUrl = data.bindUrl
          setStorage('userInfo', JSON.stringify(data))
        })
        .catch(() => {})
    },
    changepwd() {
      this.$router.push({
        path: `/pwd`
      })
    },
    bind() {
      if (this.authUrl != '') {
        this.$dialog
          .confirm({
            title: '提示',
            message: '您正在绑定账号到微信身份,是否继续操作'
          })
          .then(() => {
            window.location.href = this.authUrl
          })
      } else {
        this.$toast({ type: 'fail', message: '系统尚未配置绑定授权地址，请联系管理员' })
      }
    },
    unbind() {
      this.$dialog
        .confirm({
          title: '提示',
          message: '解绑微信您将无法收到推送消息?'
        })
        .then(() => {
          unBindWechat({ userId: this.userId }).then(({ code, data, message }) => {
            if (code == 200) {
              this.$dialog
                .alert({
                  title: '提示',
                  message: message
                })
                .then(() => {
                  setToken('')
                  this.$router.replace({
                    path: `/login`
                  })
                })
            }
          })
        })
        .catch(() => {})
    },
    clear() {
      this.$dialog
        .confirm({
          title: '提示',
          message: '清除缓存后将重新登录,是否继续操作'
        })
        .then(() => {
          window.localStorage.clear()
          this.$router.replace({
            path: `/login`
          })
        })
        .catch(() => {})
    },
    doLogOut() {
      this.$dialog
        .confirm({
          title: '提示',
          message: '确定要退出账号吗?'
        })
        .then(() => {
          setToken('')
          setStorage('userInfo', '')
          this.$router.replace({
            path: `/login`
          })
        })
        .catch(() => {})
    }
  }
}
</script>
<style lang="scss">
.about-container {
  /* 你的命名空间 */
  background: #fff;
  height: 100%;
  box-sizing: border-box;
  .warpper {
    position: absolute;
    left: 0;
    right: 0;
    top: 46px;
    bottom: 0px;
    overflow: hidden;
    height: calc(100vh - 46px);

    .logo {
      width: 100%;
      text-align: center;
      padding-top: 5px;
    }
    .info {
      font-size: 18px;
      text-align: center;
    }
    .van-button {
      /* vant-ui 元素*/
      background: #ff5500;
      margin-top: 18px;
      width: 100%;
    }
  }
}
</style>
