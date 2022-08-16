<template>
  <div class="token-data__visual">
    <template v-for="prop in viewProps">
      <div v-text="prop.name + ':'"></div>
      <div v-text="prop.value"></div>
    </template>
  </div>
</template>

<script setup>
    import {computed} from "vue";

    const propKeys = {
        name: 'Name',
        description: 'Description',
        link: 'Outer link'
    }

    const props = defineProps(['props'])
    const viewProps = computed(() => {
        return [...props.props].map(prop => {
            prop.name = propKeys[prop.key]
            return prop
        })
    })
</script>
