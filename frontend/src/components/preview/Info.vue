<template>
  <div class="token-data">
    <div>
      <InfoVisual :token="props.token" @setTempImage="setTempImage"/>
    </div>
  </div>
</template>

<script setup>
    import InfoVisual from '@/components/preview/InfoVisual'
    const props = defineProps(['token'])
    const emits = defineEmits(['setTempImage'])

    const setTempImage = (image) => emits('setTempImage', image)
</script>
