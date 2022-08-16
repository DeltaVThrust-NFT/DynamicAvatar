<template>
  <div class="input default">
    <input
      type="text"
      :value="props.modelValue" @input="emits('update:modelValue', $event.target.value)"
      :placeholder="props.placeholder || ''"
    />
  </div>
</template>

<script setup>
    const props = defineProps(['modelValue', 'placeholder'])
    const emits = defineEmits(['update:modelValue'])
</script>
