<template>
  <div class="send-form">
    <div class="preview__sub-title">
      Enter wallet address
    </div>
    <InputElement v-model="address" placeholder="Address..."/>
    <div class="send-form__actions">
      <span class="btn" @click="send">Send</span>
    </div>
    <LoaderElement v-if="isSending" class="absolute with-bg">Sending...</LoaderElement>
  </div>
</template>

<script setup>
    import InputElement from '@/components/UI/InputElement'
    import LoaderElement from '@/components/UI/Loader'
    import {ref} from "vue";
    import AppConnector from "@/crypto/AppConnector";
    import TrnView from "@/utils/TrnView";
    import alert from "@/utils/alert";
    import {getErrorTextByCode} from "@/crypto/helpers";

    const address = ref('')

    const emits = defineEmits(['close'])

    const props = defineProps(['token'])

    const isSending = ref(false)
    const send = async () => {
        try{
            isSending.value = true
            const {transactionHash: hash} = await AppConnector.connector.sendNFT(props.token, address.value)
            TrnView
                .open({hash})
                .onClose(async () => {
                    emits('close')
                    await AppConnector.connector.updateContractTokensList([props.token.contractAddress])
                })
        }
        catch (e) {
            alert.open(getErrorTextByCode(e.message) || e.message, 'Error:')
        }
        finally {
            isSending.value = false
        }
    }
</script>
