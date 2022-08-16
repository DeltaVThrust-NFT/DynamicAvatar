<template>
  <div class="trn-hash">
    <a target="_blank" :href="getExplorerLink('transaction', props.hash)" v-text="catToFixed(props.hash)"></a>
    <a target="_blank" :href="getExplorerLink('transaction', props.hash)">
      <component :is="Icons.newTab" title="Open in explorer"/>
    </a>
    <CopyIcon :value="props.hash"/>
  </div>
</template>

<script setup>
    import {useStore} from "@/store/main";
    import {storeToRefs} from "pinia";
    import Icons from "@/components/UI/icons";
    import CopyIcon from "@/components/UI/CopyIcon";
    import {catToFixed} from "@/utils/string";

    const props = defineProps({
        hash: String
    })

    const store = useStore()
    const {getExplorerLink} = storeToRefs(store);
</script>