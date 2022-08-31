<template>
  <Modal
    class="wallet"
    v-if="isWalletConnectModalOpen"
    @close="close"
  >
    <template #title>Connect Wallet</template>
    <template #default>
      <div class="wallet__qr-code">
        <qrcode-vue
          :value="walletConnectCode"
          level="M"
          background="#3C165C"
          foreground="#ffffff"
          render-as="svg"
        />
      </div>
    </template>
    <template #controls>
      <span class="btn" @click="copyBTN">Copy to clipboard</span>
    </template>
  </Modal>
</template>

<script setup>
  import Modal from '@/components/UI/Modal'
  import {useStore} from "@/store/main";
  import {storeToRefs} from "pinia";
  import copy from 'copy-to-clipboard';
  import QrcodeVue from 'qrcode.vue'
  const store = useStore()
  const {
      isWalletConnectModalOpen,
      walletConnectCode
  } = storeToRefs(store);

  const copyBTN = () => {
      copy(walletConnectCode.value)
  }
  const close = () => store.closeWalletConnectQR()
</script>