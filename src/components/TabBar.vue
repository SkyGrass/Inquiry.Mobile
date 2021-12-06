<template>
  <div>
    <van-tabbar safe-area-inset-bottom fixed route v-model="active" @change="handleChange">
      <van-tabbar-item
        :dot="index == 1 ? count > 0 : false"
        v-for="(item, index) in data"
        :to="item.to"
        :icon="item.icon"
        :key="index"
      >
        {{ item.title }}
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
export default {
  name: 'TabBar',
  props: {
    defaultActive: {
      type: Number,
      default: 0
    },
    data: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data() {
    return {
      active: this.defaultActive
    }
  },
  computed: {
    ...mapGetters(['count'])
  },
  methods: {
    handleChange(value) {
      this.$emit('change', value)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
