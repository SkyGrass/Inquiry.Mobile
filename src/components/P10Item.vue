<template>
  <van-panel title="标题" desc="描述信息" status="状态">
    <div>内容</div>
    <template #footer class="foot">
      <van-button size="small">按钮</van-button>
      <van-button size="small" type="danger">按钮</van-button>
    </template>
  </van-panel>
</template>
<script>
export default {
  name: `p10item`
}
</script>
<style lang="scss" scoped>
.foot {
  text-align: right;
}
</style>