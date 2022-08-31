<template>
  <div class="toggle" :class="{active: props.modelValue}">
    <div class="toggle__icon" @click="change"></div>
    <div class="toggle__text" @click="change"><slot></slot></div>
  </div>
</template>

<script setup>
    const props = defineProps(['modelValue'])
    const emits = defineEmits(['update:modelValue'])

    const change = () => emits('update:modelValue', !props.modelValue)
</script>