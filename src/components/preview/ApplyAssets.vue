<template>
  <div class="choose-assets">
    <template v-if="step === 'select'">
      <div class="preview__sub-title">
        Choose effect
      </div>
      <div class="preview__modifiers">

        <ContractElement
          v-for="contract in preview.modifiers"
          :contract="contract"
          :selectedTokens="selected? [selected.identity] : []"
          :byAvailable="true"
          @chooseToken="chooseToken"
        />

      </div>
      <div class="preview__controls">
        <span></span>
        <div
          class="btn"
          v-show="selected"
          @click="confirm"
        >Apply</div>
      </div>
    </template>
    <LoaderElement v-if="applying" class="absolute with-bg">Applying...</LoaderElement>
  </div>
</template>

<script setup>
import {ref} from "vue"
import {useStore} from "@/store/main"
import {storeToRefs} from "pinia"
import ContractElement from '@/components/gallery/Contract'
import LoaderElement from '@/components/UI/Loader'
import alert from "@/utils/alert"
import {getErrorTextByCode} from "@/crypto/helpers"
import {useRouter} from "vue-router"

const store = useStore()
const {
    preview,
    collections
} = storeToRefs(store);

const step = ref('select')
const selected = ref(null)
const chooseToken = (token) => {
    selected.value = token
}

const emits = defineEmits(['close'])

const applying = ref(false)
const router = useRouter()
const confirm = () => {
    try{
        applying.value = true

        store.saveApplyEffect(preview.value.token, selected.value)

        emits('close')

        router.push({name: 'ApplyPage'})
    }
    catch (e) {
        alert.open(getErrorTextByCode(e.message) || e.message, 'Error:')
    }
    finally {
        applying.value = false
    }
}
</script>
