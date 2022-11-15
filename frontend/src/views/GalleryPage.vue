<template>
  <Sketch class="gallery">
    <LoaderElement class="collections" v-if="isCollectionsLoading">Loading...</LoaderElement>
    <template v-else>

      <div class="token-page__field storage-select">
        <div>Storage</div>
        <div>
          <select class="input" v-model="storageTypeActive">
            <option :value="null" disabled>Choose storage</option>
            <option v-for="option in storageTypeList" :key="option" :value="option" v-text="option"></option>
          </select>
        </div>
      </div>

      <ContractElement
        v-for="collection in getSearchCollectionsAndTokens"
        :contract="collection"
        :byAvailable="true"
        :selectedTokens="selectedForBundle.identities"
        @chooseToken="chooseToken"
      />
    </template>
    <div
      class="gallery__center-btn btn"
      v-if="isMakeBundleAvailable"
      @click="makeBundle"
    >
      Make bundle
    </div>
    <LoaderElement class="fixed with-bg" v-if="isLoading">Loading...</LoaderElement>
  </Sketch>
  <PreviewToken/>
</template>

<script setup>
    import {storeToRefs} from "pinia";
    import Sketch from '@/components/UI/Sketch'
    import PreviewToken from '@/components/preview/Modal'
    import ContractElement from '@/components/gallery/Contract'
    import LoaderElement from '@/components/UI/Loader'

    import {useStore} from "@/store/main";
    import AppConnector from "@/crypto/AppConnector";
    import {log} from "@/utils/AppLogger";
    import {CollectionType} from "@/utils/collection";
    import {useRouter} from "vue-router";
    import {computed, ref, watch} from "vue";
    import alert from "@/utils/alert";
    import TrnView from "@/utils/TrnView";
    import {getErrorTextByCode} from "@/crypto/helpers";
    import {storageTypeActive, storageTypeList} from "@/crypto/helpers/DecentralizedStorage";

    const store = useStore()

    const {
        isCollectionsLoading,
        collections,
        isBundleMode,
        selectedForBundle,
        getSearchCollectionsAndTokens
    } = storeToRefs(store)

    watch(isBundleMode, (newState) => {
        if(!newState) store.cleanSavedTokensForBundle()
    })

    const isMakeBundleAvailable = computed(() => {
        const addedTokensTypes = selectedForBundle.value.identities.map(t => store.findContractObject(t.split(':').shift())?.type).filter(Boolean)
        return addedTokensTypes.length > 1 && addedTokensTypes.includes(CollectionType.BUNDLE)
    })

    const chooseToken = async (token, contract) => {
        if(isBundleMode.value) {
            const addTokenContract = store.findContractObject(token.contractAddress);
            if(addTokenContract.type === CollectionType.BUNDLE && !selectedForBundle.value.identities.includes(token.identity)){
                const isCharacterAlreadyAdded = selectedForBundle.value.identities.map(i => i.split(':').shift()).includes(addTokenContract.address)
                if(isCharacterAlreadyAdded) alert.open(`You can't add more than one character in bundle`)
                else store.toggleTokenForBundle(token)
            }
            else store.toggleTokenForBundle(token)
        }
        else{
            store.openPreview(token)
            try{
                if(CollectionType.isBundle(contract.type)) {
                    await AppConnector.connector.getWrappedTokensObjectList(token.contractAddress, token.id)
                }
            }
            catch (e) {
                log(e);
            }
        }
    }

    const router = useRouter()

    const isLoading = ref(false)
    const makeBundle = async () => {
        const tokensForBundle = selectedForBundle.value.identities.map(i => store.getTokenWithCollectionByIdentity(i)).filter(Boolean)

        try{
            isLoading.value = true
            const contractsNeedToUpdate = [...new Set(tokensForBundle.map(t => t.contract.address))]

            const {
                transactionHash: hash,
            } = await AppConnector.connector.createBundle(tokensForBundle)

            store.cleanSavedTokensForBundle()

            TrnView
                .open({hash})
                .onClose(() => {
                    log('contractsNeedToUpdate', contractsNeedToUpdate);
                    router.push({name: 'Gallery'})
                    AppConnector.connector.updateContractTokensList(contractsNeedToUpdate)
                })
        }
        catch (e) {
            log('Bundle', e);
            alert.open(getErrorTextByCode(e.message) || e.message, 'Error:')
        }
        finally {
            isLoading.value = false
        }
    }
</script>
