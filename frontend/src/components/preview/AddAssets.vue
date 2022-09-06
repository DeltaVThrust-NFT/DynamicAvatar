<template>
  <div class="choose-assets">
    <div class="preview__sub-title">
      Choose assets
    </div>
    <div class="preview__modifiers">

      <ContractElement
        v-for="contract in collectionsToChoose"
        :contract="contract"
        :selectedTokens="selectedIdentities"
        :notAvailable="[preview.token.identity]"
        :byAvailable="true"
        @chooseToken="chooseToken"
      />

    </div>
    <div class="preview__controls">
      <span></span>
      <div
        class="btn"
        v-show="selected.length"
        @click="confirm"
      >Add</div>
    </div>
    <LoaderElement v-if="applying" class="absolute with-bg">Adding...</LoaderElement>
  </div>
</template>

<script setup>
import {computed, ref} from "vue"
import {useStore} from "@/store/main"
import {storeToRefs} from "pinia"
import ContractElement from '@/components/gallery/Contract'
import LoaderElement from '@/components/UI/Loader'
import alert from "@/utils/alert"
import {getErrorTextByCode} from "@/crypto/helpers"
import {useRouter} from "vue-router"
import AppConnector from "@/crypto/AppConnector";
import TrnView from "@/utils/TrnView";

const store = useStore()
const {
    preview,
    collections
} = storeToRefs(store);

const collectionsToChoose = computed(() => collections.value.filter(c => c.address !== preview.value.contract.address))

const selected = ref([])
const selectedIdentities = computed(() => selected.value.map(token => token.identity))
const chooseToken = (token) => {
    if(selected.value.find(t => t.identity === token.identity)) selected.value = selected.value.filter(t => t.identity !== token.identity)
    else selected.value.push(token)
}

const emits = defineEmits(['close'])

const applying = ref(false)
const router = useRouter()
const confirm = async () => {
    try{
        applying.value = true

        const contractsNeedToUpdate = [preview.value.token.contractAddress, ...selected.value.map(token => token.contractAddress)]

        const {
            transactionHash: hash,
        } = await AppConnector.connector.addTokensToBundle(preview.value.token, selected.value)

        TrnView
            .open({hash})
            .onClose(async () => {
                selected.value = []
                await AppConnector.connector.updateContractTokensList(contractsNeedToUpdate)
                await AppConnector.connector.getWrappedTokensObjectList(preview.value.token.contractAddress, preview.value.token.id)
            })
    }
    catch (e) {
        alert.open(getErrorTextByCode(e.message) || e.message, 'Error:')
    }
    finally {
        applying.value = false
    }
}
</script>
