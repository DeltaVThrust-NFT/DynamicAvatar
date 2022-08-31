<template>
  <LoaderElement class="absolute with-bg">{{ processStatus.code }}</LoaderElement>
</template>

<script setup>
    import LoaderElement from '@/components/UI/Loader'
    import {useStore} from "@/store/main";
    import {storeToRefs} from "pinia";

    const store = useStore()
    const {
        processStatus
    } = storeToRefs(store);
</script>