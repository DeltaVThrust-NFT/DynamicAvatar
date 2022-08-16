<template>
  <Sketch class="token-page-cover">
    <div class="sketch__title">Create bundle</div>
    <div class="token-page">
      <div class="token-page__media">
        <div class="token-page__img">
          <TokenMediaLoader ref="TokenMediaLoaderComponent"/>
        </div>
      </div>
      <div class="token-page__data">
        <div class="token-page__field">
          <div>Name*</div>
          <div>
            <input type="text" class="input" v-model.trim="meta.name">
          </div>
        </div>
        <div class="token-page__field">
          <div>External link</div>
          <div>
            <input type="text" class="input" v-model.trim="meta.link">
          </div>
        </div>
        <div class="token-page__field">
          <div>Description</div>
          <div>
            <input type="text" class="input" v-model.trim="meta.description">
          </div>
        </div>
      </div>
      <div class="token-page__inside">
        <div
          v-for="token in selectedForBundle.tokens"
          :style="computeTokenImgStyle(token.image)"
        ></div>
      </div>
      <div>
        <span
          class="btn"
          :class="{na: !isSubmitAvailable}"
          @click="isSubmitAvailable? mint() : null"
        >
          Create bundle
        </span>
      </div>
    </div>
    <PageBlockActionLoading v-if="isLoading || selectedForBundle.loading"/>
  </Sketch>
</template>

<script setup>
    import Sketch from '@/components/UI/Sketch'
    import LoaderElement from '@/components/UI/Loader'
    import ToggleElement from '@/components/UI/Toggle'
    import PageBlockActionLoading from '@/components/UI/PageBlockActionLoading'
    import {computeTokenImgStyle} from "@/utils/styles"
    import TokenMediaLoader from '@/components/UI/TokenMediaLoader'
    import {useStore} from "@/store/main";
    import {computed, onMounted, reactive, ref} from "vue";
    import AppConnector from "@/crypto/AppConnector";
    import {storeToRefs} from "pinia";
    import alert from "@/utils/alert";
    import {useRouter} from "vue-router";
    import TrnView from "@/utils/TrnView";
    import {getErrorTextByCode} from "@/crypto/helpers";
    import {log} from "@/utils/AppLogger";

    const router = useRouter()

    const store = useStore()
    const {
        selectedForBundle
    } = storeToRefs(store);

    const isLoading = ref(false)

    const meta = reactive({
        name: '',
        link: '',
        description: '',
    })

    const errorGettingSavedTokens = reason => {
        alert.open(`${reason}. You will be redirected to gallery page.`)
            .onClose(() => {
                router.replace({name: 'Gallery'})
            })
    }

    onMounted(async () => {
        const savedTokenIdentities = await store.restoreSavedTokensForBundle()
        if(savedTokenIdentities){
            try{
                store.changeLoadingTokensForBundleState(true)
                const tokens = await AppConnector.connector.getTokenListByIdentity(savedTokenIdentities)
                store.saveTokensForBundle(tokens)
            }
            catch (e) {
                log(e);
                errorGettingSavedTokens('Error getting tokens for bundle.')
            }
            finally {
                store.changeLoadingTokensForBundleState(false)
            }
        }
        else errorGettingSavedTokens('Tokens for bundle not selected.')
    })

    const TokenMediaLoaderComponent = ref(null)

    const isSubmitAvailable = computed(() => {
        return meta.name.trim().length && !isLoading.value && TokenMediaLoaderComponent.value.file
    })

    const mint = async () => {
        try{
            isLoading.value = true

            let contractsNeedToUpdate = selectedForBundle.value.tokens.map(t => t.contractAddress)

            const {
                transactionHash: hash,
                issuedContractAddress
            } = await AppConnector.connector.createBundle(meta, TokenMediaLoaderComponent.value.file, selectedForBundle.value.tokens)

            contractsNeedToUpdate.push(issuedContractAddress)
            contractsNeedToUpdate = [...new Set(contractsNeedToUpdate)]

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
