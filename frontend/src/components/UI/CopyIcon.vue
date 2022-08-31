<template>
  <component :is="isCopied? Icons.copySuccess : Icons.copy" title="Copy address" @click="copyAddress"/>
</template>

<script setup>
    import copy from "copy-to-clipboard";
    import {ref} from "vue";
    import Icons from "@/components/UI/icons";

    const prop = defineProps(['value'])

    const isCopied = ref(false)
    const copyAddress = () => {
        isCopied.value = copy(prop.value)
        setTimeout(() => {
            isCopied.value = false
        }, 3000)
    }
</script>