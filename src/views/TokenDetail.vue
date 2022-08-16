<template>
  <Sketch class="gallery">
    <LoaderElement class="collections" v-if="isLoading">Loading...</LoaderElement>
    <template v-else-if="token">
      <div class="token-page">
        <div class="token-page__media">
          <div class="token-page__img">
            <div :style="computeTokenImgStyle(token.image)"></div>
          </div>
        </div>
        <div class="token-page__data">
          <div class="token-page__field" v-for="field in token.fieldsForView">
            <div v-text="field.key + ':'"></div>
            <div v-text="field.value"></div>
          </div>
          <div class="token-page__actions">
            <span class="btn">Unbundle</span>
          </div>
        </div>
        <div class="token-page__inside">
          <div v-for="nft in token.structure" :key="nft.id" :style="computeTokenImgStyle(nft.image)"></div>
        </div>
        <div></div>
      </div>
    </template>
    <template v-else>
      Token not found
    </template>
  </Sketch>
  <PreviewToken/>
</template>

<script setup>
    import Sketch from '@/components/UI/Sketch'
    import LoaderElement from '@/components/UI/Loader'
    import ToggleElement from '@/components/UI/Toggle'
    import PreviewToken from '@/components/preview/Modal'

    import {useStore} from "@/store/main";
    import {useRoute} from "vue-router";
    import {onMounted, ref} from "vue";
    import AppConnector from "@/crypto/AppConnector";
    import {computeTokenImgStyle} from "@/utils/styles";

    const isLoading = ref(true)
    const token = ref(null)
    const tokenNotFound = ref(false)

    const route = useRoute()
    onMounted(async () => {
        try{
            const tokenIdentity = `${route.params.contractAddress}:${route.params.tokenID}`
            token.value = await AppConnector.connector.getTokenByIdentity(tokenIdentity, true, true)
        }
        catch (e) {
            tokenNotFound.value = true
        }
        finally {
            isLoading.value = false
        }
    })

    const store = useStore()
</script>
