<template>
  <div class="form">
    <van-form @submit="onSubmit">
      <van-field
        readonly
        v-model="form.username"
        name="username"
        label="用户名"
        placeholder="用户名"
        autocomplete="off"
        :rules="[{ required: true, message: '请填写用户名' }]"
      />
      <div style="margin: 16px">
        <van-button round block type="info" v-if="haveOpenId && !noUser" native-type="submit">绑定</van-button>
      </div>
    </van-form>
    <van-popup v-model="show" safe-area-inset-bottom round position="bottom" :style="{ height: '80%' }">
      <van-tabs>
        <van-tab title="请先登录">
          <van-field
            v-model="form.username"
            name="username"
            label="用户名"
            placeholder="用户名"
            autocomplete="off"
            :rules="[{ required: true, message: '请填写用户名' }]"
          />
          <van-field
            v-model="form.password"
            type="password"
            name="password"
            label="密码"
            placeholder="密码"
            :rules="[{ required: true, message: '请填写密码' }]"
          />
          <div style="margin: 16px">
            <van-button round block type="info" @click="onLogin">登录</van-button>
          </div>
        </van-tab>
      </van-tabs>
    </van-popup>
  </div>
</template>
<script>
import { mounted } from '@/mix/mounted.js'
import { login, getUserInfo } from '@/api/user.js'
import { bindWechat } from '@/api/bind.js'
import { setToken } from '@/utils/index.js'
import { mapActions, mapGetters } from 'vuex'
export default {
  name: `login`,
  mixins: [mounted],
  data() {
    return {
      form: {
        username: '',
        password: ''
      },
      userId: '',
      token: '',
      openId1: '',
      noUser: false,
      show: false
    }
  },
  computed: {
    haveOpenId() {
      return this.$route.query.openId != void 0 && this.$route.query.openId != null && this.$route.query.openId != ''
    },
    openId() {
      return this.$route.query.openId || ''
    }
  },
  watch: {
    token(newVal) {
      if (newVal != '') {
        getUserInfo()
          .then(({ code, data, message }) => {
            this.form.username = data.user_name
            this.openId1 = data.openId
            this.userId = data.user_guid
            this.noUser = false
          })
          .catch(e => {
            this.noUser = true
            this.show = true
          })
      }
    }
  },
  mounted() {
    const openId = this.$route.query.openId
    if (openId == '' || openId == void 0) {
      this.$dialog.alert({
        title: '提示',
        message: '没有查询到微信身份,无法绑定!'
      })
    } else {
      getUserInfo()
        .then(({ code, data, message }) => {
          this.form.username = data.user_name
          this.openId1 = data.openId
          this.userId = data.user_guid
          this.noUser = false
        })
        .catch(e => {
          this.noUser = true
          this.show = true
        })
    }
  },
  methods: {
    ...mapActions(['setUserToken']),
    onSubmit() {
      bindWechat({ userId: this.userId, openId: this.openId })
        .then(({ code, message, data }) => {
          if (code == 200) {
            this.$dialog
              .alert({
                title: '提示',
                message: message
              })
              .then(() => {
                this.$router.replace({
                  path: `/`
                })
              })
          } else {
            this.$toast({ type: 'fail', message })
          }
        })
        .catch(() => {
          this.$toast({ type: 'fail', message: '登录失败,网络连接错误!' })
        })
    },
    onLogin() {
      if (this.form.username == '' || this.form.password == '') {
        this.$toast({ type: 'fail', message: '登录信息不完整!' })
      } else {
        login(this.form)
          .then(({ code, message, data }) => {
            if (code == 200) {
              this.show = false
              this.token = data
              setToken(data)
              this.setUserToken(data)
            } else {
              this.$toast({ type: 'fail', message })
            }
          })
          .catch(() => {
            this.$toast({ type: 'fail', message: '登录失败,网络连接错误!' })
          })
      }
    }
  }
}
</script>
<style lang="scss">
.form {
  margin-top: 45px;
  h1 {
    text-align: center;
    font-size: 24px;
  }
}
</style>