<template>
  <div class="form">
    <h1>欢迎登录</h1>
    <van-form @submit="onSubmit">
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
      <van-field name="switch" label="记住账号">
        <template #input>
          <van-switch v-model="remember" size="24" />
        </template>
      </van-field>
      <div style="margin: 16px">
        <van-button round block type="info" native-type="submit">提交</van-button>
      </div>
    </van-form>
  </div>
</template>
<script>
import { login } from '@/api/user.js'
import { setToken, setStorage, getStorage } from '@/utils/index.js'
import { mapActions } from 'vuex'
export default {
  name: `login`,
  data() {
    return {
      form: {
        username: '',
        password: ''
      },
      remember: true
    }
  },
  computed: {},
  mounted() {
    const reason = this.$route.query.reason
    if (reason) {
      this.$toast({ type: 'fail', message: '您的登录已超期,请重新登录!' })
    }
    let account = getStorage('account')
    if (account != '' && account != null) {
      account = JSON.parse(account)
      this.form.username = account.username
      this.form.password = account.password
    }
  },
  methods: {
    ...mapActions(['setUserToken', 'setUserName']),
    onSubmit(values) {
      setStorage('account', this.remember ? JSON.stringify(this.form) : '')
      login(values)
        .then(({ code, message, data }) => {
          if (code == 200) {
            setToken(data)
            this.setUserToken(data)
            this.$router.replace({
              path: `/`
            })
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
</script>
<style lang="scss">
.form {
  margin-top: 150px;
  h1 {
    text-align: center;
    font-size: 24px;
  }
}
</style>