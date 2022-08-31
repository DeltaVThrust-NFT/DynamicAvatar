<template>
  <Sketch class="token-page-cover">
    <template v-if="apply.origin.token && apply.style.token">
      <div class="sketch__title">Apply effect</div>
      <div class="token-page">
        <div class="token-page__media">
          <div class="token-page__img">
            <div :style="computeTokenImgStyle(apply.origin.token.image)"></div>
          </div>
        </div>
        <div class="token-page__data">
          <div class="token-page__field">
            <div>Name*</div>
            <div>
              <input type="text" class="input" v-model.trim="bundleMeta.name">
            </div>
          </div>
          <div class="token-page__field">
            <div>External link</div>
            <div>
              <input type="text" class="input" v-model.trim="bundleMeta.link">
            </div>
          </div>
          <div class="token-page__field">
            <div>Description</div>
            <div>
              <input type="text" class="input" v-model.trim="bundleMeta.description">
            </div>
          </div>
        </div>
        <div class="token-page__inside">
          <div :style="computeTokenImgStyle(apply.style.token.image)"></div>
        </div>
        <div>
          <span
            class="btn"
            :class="{na: !isSubmitAvailable}"
            @click="isSubmitAvailable? confirmEffect() : null"
          >
            Confirm effect
          </span>
        </div>
      </div>
    </template>
    <LoaderElement class="collections" v-else>Loading...</LoaderElement>
    <PageBlockActionLoading v-if="isLoading"/>
  </Sketch>
</template>

<script setup>
    import Sketch from '@/components/UI/Sketch'
    import LoaderElement from '@/components/UI/Loader'
    import ToggleElement from '@/components/UI/Toggle'
    import PageBlockActionLoading from '@/components/UI/PageBlockActionLoading'

    import {useStore} from "@/store/main";
    import {computed, onMounted, reactive, ref} from "vue";
    import AppConnector from "@/crypto/AppConnector";
    import {computeTokenImgStyle} from "@/utils/styles";
    import {storeToRefs} from "pinia";
    import alert from "@/utils/alert";
    import {useRouter} from "vue-router";
    const router = useRouter()
    import TrnView from "@/utils/TrnView";
    import {getErrorTextByCode} from "@/crypto/helpers";

    const store = useStore()
    const {
        apply
    } = storeToRefs(store);

    const isLoading = ref(false)

    const initError = (reason) => {
        alert.open(`${reason}. You will be redirected to gallery page.`)
            .onClose(() => {
                router.replace({name: 'Gallery'})
            })
    }

    onMounted(async () => {
        if(!apply.value.origin.token || !apply.value.style.token){
            const isRestoreSuccess = store.restoreApplyIdentities()
            if(isRestoreSuccess){
                try{
                    const restoredTokens = await Promise.all([
                        AppConnector.connector.getTokenByIdentity(apply.value.origin.identity),
                        AppConnector.connector.getTokenByIdentity(apply.value.style.identity)
                    ])
                    store.saveRestoredTokensForApply(restoredTokens.shift(), restoredTokens.shift())
                }
                catch (e) {
                    console.log('restoredTokens error', e)
                    return initError('Restore token objects error.')
                }
            }
            else return initError('Restore token identities error.')
        }
    })

    const bundleMeta = reactive({
        name: '',
        link: '',
        description: '',
    })

    const isSubmitAvailable = computed(() => {
        return bundleMeta.name.trim().length && !isLoading.value
    })

    const confirmEffect = async () => {
        try{
            isLoading.value = true
            let contractsNeedToUpdate = [apply.value.origin.token.contractAddress, apply.value.style.token.contractAddress]

            const {
                transactionHash: hash,
                issuedContractAddress
            } = await AppConnector.connector.applyEffectToToken(bundleMeta, apply.value.origin.token, apply.value.style.token)

            contractsNeedToUpdate.push(issuedContractAddress)
            contractsNeedToUpdate = [...new Set(contractsNeedToUpdate)]

            TrnView
                .open({hash})
                .onClose(() => {
                    console.log('contractsNeedToUpdate', contractsNeedToUpdate);
                    router.push({name: 'Gallery'})
                    store.cleanSavedTokensForApply()
                    AppConnector.connector.updateContractTokensList(contractsNeedToUpdate)
                })
        }
        catch (e) {
            console.log('Apply effect', e);
            alert.open(getErrorTextByCode(e.message) || e.message, 'Error:')
        }
        finally {
            isLoading.value = false
        }
    }
</script>
