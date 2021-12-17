<template>
    <van-field v-bind="$attrs" :value="value" type="number" @input="inputHandler" autocomplete='off' />
</template>
<script>
export default {
    name: 'number-input',
    props: {
        value: {
            default: '',
            type: [Number, String],
        },
        max: {
            default: 0,
            type: [Number, String],
        },
        min: {
            default: 0,
            type: [Number, String],
        }
    },
    methods: {
        inputHandler(value) {
            value = this.max > 0 ? Math.min(value, this.max || 0) : value
            value = Math.max(value, this.min || 0)
            value = (value + '').replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3')
            this.$emit('input', Number(value))
        },
    }
}
</script>