<template>
  <div class="form">
    <van-form @submit="onSubmit">
      <van-field
        v-model="form.password"
        type="password"
        name="password"
        label="旧密码"
        placeholder="请填写旧密码"
        :rules="[{ required: true, message: '请填写旧密码' }]"
      />
      <van-field
        v-model="form.newpassword"
        type="password"
        name="newpassword"
        label="新密码"
        placeholder="请填写新密码"
        :rules="[{ required: true, message: '请填写新密码' }]"
      />
      <van-field
        v-model="form.confirmpassword"
        type="password"
        name="confirmpassword"
        label="确认新密码"
        placeholder="请再次填写新密码"
        :rules="[{ required: true, message: '请再次填写新密码' }]"
      />

      <div style="margin: 16px">
        <van-button round block type="info" native-type="submit">提交</van-button>
      </div>
    </van-form>
  </div>
</template>
<script>
import { updatePwd } from '@/api/user.js'
import { setStorage } from '@/utils/index.js'
import { mounted } from '@/mix/mounted.js'
export default {
  name: `pwd`,
  data() {
    return {
      form: {
        password: '',
        newpassword: '',
        confirmpassword: ''
      }
    }
  },
  mixins: [mounted],
  methods: {
    onSubmit(values) {
      if (this.form.newpassword == this.form.confirmpassword) {
        updatePwd(values)
          .then(({ code, message, data }) => {
            if (code == 200) {
              this.$dialog
                .alert({
                  title: '提示',
                  message: '修改成功,请重新登录!'
                })
                .then(() => {
                  window.localStorage.clear()
                  this.$router.replace({
                    path: `/`
                  })
                })
            } else {
              this.$toast({ type: 'fail', message })
            }
          })
          .catch(() => {
            this.$toast({ type: 'fail', message: '密码修改失败!' })
          })
      } else {
        this.$toast({ type: 'fail', message: '两次密码不一致!' })
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