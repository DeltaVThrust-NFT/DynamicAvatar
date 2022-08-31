<template>
  <template v-if="isAppReady">
    <router-view/>

    <TransactionViewModal/>
    <ChooseWalletModal/>
  </template>
  <LoaderElement v-else class="absolute with-bg"/>

  <WalletConnectQRModal/>
  <ConfirmModal/>
  <AlertModal/>
</template>

<script setup>
    import AlertModal from '@/components/UI/Alert'
    import ConfirmModal from '@/components/UI/Confirm'
    import ChooseWalletModal from '@/components/modals/chooseWallet/Modal'
    import LoaderElement from '@/components/UI/Loader'
    import WalletConnectQRModal from '@/components/modals/walletConnectQR/Modal'
    import TransactionViewModal from '@/components/modals/TransactionView'

    import AppConnector from "@/crypto/AppConnector";
    import {useStore} from "@/store/main";
    import {storeToRefs} from "pinia";
    import {onMounted} from "vue";
    import {log} from "@/utils/AppLogger";
    const store = useStore()
    const {
        isAppReady
    } = storeToRefs(store);

    onMounted(async () => {
        try{
            await AppConnector.init()
        }
        catch (e){
            log(e)
        }
        finally {
            store.setAppReady()
        }
    })
</script>