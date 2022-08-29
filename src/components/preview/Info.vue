<template>
  <div class="token-data">
    <div>
      <InfoVisual :token="props.token"/>
    </div>
  </div>
</template>

<script setup>
    import InfoVisual from '@/components/preview/InfoVisual'
    const props = defineProps(['token'])
</script>
