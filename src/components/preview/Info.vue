<template>
  <div class="token-data">
    <div>
      <InfoVisual :props="props.token.fieldsForView"/>
    </div>
  </div>
</template>

<script setup>
    import InfoVisual from '@/components/preview/InfoVisual'

    const props = defineProps(['token'])
</script>
