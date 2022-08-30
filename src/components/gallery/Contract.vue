<template>
  <div class="contract">
    <div class="contract__name" v-text="contract.name"></div>
    <div class="contract__tokens" :class="{loading: contract.isUpdating}" v-if="tokensView.length">
      <LoaderElement class="contract" v-if="contract.isUpdating">Loading...</LoaderElement>
      <template v-else>
        <TokenElement
          v-for="token in tokensView"
          :token="token"
          :isSelected="selectedTokens.includes(token.identity)"
          :isAvailable="!notAvailable.includes(token.identity)"
          @choose="chooseToken(token, contract)"
        />
      </template>
    </div>
    <template v-else>
      Tokens from this collection were not found. They will appear here after the bundle is minted.
    </template>
  </div>
</template>

<script setup>
    import TokenElement from '@/components/gallery/Token'
    import LoaderElement from '@/components/UI/Loader'
    import {computed} from "vue";
    import {useStore} from "@/store/main";

    const props = defineProps({
        contract: {
            type: Object,
            required: true
        },
        loading: {
            type: Boolean,
            required: false,
            default: false
        },
        selectedTokens: {
            type: Array,
            default: []
        },
        tokens: {
            type: Array,
            default: []
        },
        byAvailable: {
            type: Boolean,
            default: false
        },
        notAvailable: {
            type: Array,
            required: false,
            default: []
        }
    })
    const emits = defineEmits(['chooseToken'])
    const chooseToken = (...props) => emits('chooseToken', ...props)
    const store = useStore()

    const tokensView = computed(() => {
        // return (props.contract.tokens.length || !props.byAvailable)? props.contract.tokens : store.getShopTokens(props.contract.type, props.contract.address)
        return [...props.contract.tokens, ...store.getShopTokens(props.contract.type, props.contract.address)]
    })
</script>
