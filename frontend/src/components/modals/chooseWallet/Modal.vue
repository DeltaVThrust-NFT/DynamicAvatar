<template>
  <Modal
    class="wallet"
    v-if="isOpen && walletConnectModalOpen"
    :options="modalOptions"
    @close="close"
  >
    <template #title>Connect to wallet</template>
    <template #default>
      <div class="wallet__step">
        <div class="wallet__step-title">
          <div>Step 1</div>
          <div>Choose Network</div>
        </div>
        <div class="wallet__step-items">
          <div
            v-for="option in networks"
            :key="option.id"
            :class="{'selected': selectedNetwork === option.id, 'na': !option.available}"
            @click="option.available? setNetwork(option.id) : null"
          >
            <div>
              <img
                alt=""
                :src="networkAssets+'network/'+option.key+'.svg'"
              />
            </div>
            <div>{{ option.name }}</div>
            <svg viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11.75" cy="11.75" r="10.25" stroke-width="2"/>
              <path d="M7.375 12.375L9.875 14.875L16.125 8.625" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
      <div class="wallet__step">
        <div class="wallet__step-title">
          <div>Step 2</div>
          <div>Choose Wallet</div>
        </div>
        <div class="wallet__step-items">
          <div
            v-for="option in wallets"
            :key="option.key"
            :class="{'selected': selectedWallet === option.key, 'na': !option.available}"
            @click="option.available? setWallet(option.key) : null"
          >
            <div>
              <img
                alt=""
                :src="networkAssets+'wallet/'+option.key+'.svg'"
              />
            </div>
            <div>{{ option.name }}</div>
            <svg viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11.75" cy="11.75" r="10.25" stroke-width="2"/>
              <path d="M7.375 12.375L9.875 14.875L16.125 8.625" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
      <LoaderElement v-if="isConnecting" class="absolute with-bg">Connecting...</LoaderElement>
    </template>
    <template #controls>
      <span
        class="btn"
        :class="{na: !submitAvailable}"
        @click="submitAvailable? submit() : null"
      >Connect</span>
    </template>
  </Modal>
</template>

<script setup>
  import Modal from '@/components/UI/Modal'
  import LoaderElement from '@/components/UI/Loader'
  import {useWalletConnection} from "@/components/helpers/WalletConnect";
  import {reactive, ref, watchEffect} from "vue";
  import AppConnector from '@/crypto/AppConnector'
  import {ConnectorTypes} from '@/crypto/helpers'
  import {useRouter, useRoute} from "vue-router";
  import {log} from "@/utils/AppLogger";
  import {useStore} from "@/store/main";
  import {storeToRefs} from "pinia";

  const store = useStore()
  const {
    walletConnectModalOpen
  } = storeToRefs(store)

  const router = useRouter()
  const route = useRoute()
  const {
      isOpen,
      networks,
      wallets,
      selectedNetwork,
      selectedWallet,
      networkAssets,
      close,
      setNetwork,
      setWallet,
      submitAvailable
  } = useWalletConnection()

  const isConnecting = ref(false)

  const submit = async () => {
      isConnecting.value = true
      try{
          const selected = (selectedWallet.value === '1inch')? 'walletconnect' : selectedWallet.value
          await (await AppConnector.init(ConnectorTypes.RARIBLE)).connect(selected, selectedNetwork.value)

          const heedRedirect = route.query && route.query.redirect || '/'
          await router.push({path: heedRedirect})
      }
      catch (e) {
          log(e)
      }
      finally {
          isConnecting.value = false
      }
  }

  const modalOptions = reactive({
    withoutClose: true
  })

  watchEffect(() => {
    modalOptions.withoutClose = router.currentRoute.value.name !== 'Login'
  })
</script>