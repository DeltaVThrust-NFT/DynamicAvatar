<template>
  <div
    class="token"
    :class="{selected: isSelected, token_na:!isAvailable}"
    @click="choose"
  >
    <div class="token__img" :style="computeTokenImgStyle(token.image)"></div>
    <div class="token__name" v-text="token.name"></div>
    <div class="token__buy btn" v-if="token.isForBuy" @click="mint">Mint</div>
    <LoaderElement v-if="isLoading" class="absolute with-bg">Minting...</LoaderElement>
  </div>
</template>

<script setup>
    import {computeTokenImgStyle} from "@/utils/styles";
    import AppConnector from "@/crypto/AppConnector";
    import alert from "@/utils/alert";
    import LoaderElement from '@/components/UI/Loader'
    import {ref} from "vue";
    import TrnView from "@/utils/TrnView";
    import {getErrorTextByCode} from "@/crypto/helpers";

    const props = defineProps({
        token: Object,
        isSelected: {
            type: Boolean,
            default: false
        },
        isAvailable: {
            type: Boolean,
            default: true
        }
    })
    const emits = defineEmits(['choose'])
    const choose = () => {
        if(!props.token.isForBuy && props.isAvailable) emits('choose')
    }
    const isLoading = ref(false)
    const mint = async () => {
        try{
            isLoading.value = true
            const {transactionHash} = await AppConnector.connector.mintTestToken(props.token)
            TrnView
                .open({hash: transactionHash})
                .onClose(async () => {
                    await AppConnector.connector.updateContractTokensList([props.token.contractAddress])
                })
        }
        catch (e) {
            alert.open(getErrorTextByCode(e.message) || e.message, 'Error:')
        }
        finally {
            isLoading.value = false
        }
    }
</script>
