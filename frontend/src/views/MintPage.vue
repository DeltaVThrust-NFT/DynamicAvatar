<template>
  <Sketch class="token-page-cover">
    <div class="sketch__title">Create new NFT</div>
    <div class="token-page">
      <div class="token-page__media">
        <div class="token-page__img">
          <TokenMediaLoader ref="TokenMediaLoaderComponent"/>
        </div>
      </div>
      <div class="token-page__data">
        <div class="token-page__field">
          <div>Collection</div>
          <div>
            <select class="input" v-model="contractAddress">
              <option :value="null" disabled>Choose collection</option>
              <option v-for="option in contractOptions" :key="option.address" :value="option.address" v-text="option.name"></option>
            </select>
          </div>
        </div>
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
      <div></div>
      <div>
        <span
          class="btn"
          :class="{na: !isSubmitAvailable}"
          @click="isSubmitAvailable? mint() : null"
        >
          Create NFT
        </span>
      </div>
    </div>
    <PageBlockActionLoading v-if="isLoading"/>
  </Sketch>
</template>

<script setup>
    import Sketch from '@/components/UI/Sketch'
    import LoaderElement from '@/components/UI/Loader'
    import PageBlockActionLoading from '@/components/UI/PageBlockActionLoading'

    import TokenMediaLoader from '@/components/UI/TokenMediaLoader'

    import {useStore} from "@/store/main";
    import {computed, onMounted, reactive, ref, watch} from "vue";
    import AppConnector from "@/crypto/AppConnector";
    import {storeToRefs} from "pinia";
    import alert from "@/utils/alert";
    import {useRouter} from "vue-router";
    const router = useRouter()
    import TrnView from "@/utils/TrnView";
    import {ConnectionStore, getErrorTextByCode, Networks} from "@/crypto/helpers";
    import {Traits} from "@/crypto/helpers/Token";

    const store = useStore()
    const {
        collections
    } = storeToRefs(store);

    const setAvailableCollections = () => {
        contractOptions.value = collections.value.map(contract => ({
            name: contract.name,
            address: contract.address
        }))
    }

    watch(collections, setAvailableCollections)

    const isLoading = ref(false)

    const meta = reactive({
        name: '',
        link: '',
        description: '',
        attributes: [
            {
                trait_type: 'age',
                value: Traits.age.baby
            },
            {
                trait_type: 'mood',
                value: Traits.mood.general
            }
        ]
    })
    const contractAddress = ref('')
    const contractOptions = ref([])

    onMounted(() => {
        // const {
        //     testContract,
        //     effectsContract
        // } = Networks.getSettings(ConnectionStore.getNetwork().name)
        // contractAddress.value = testContract
        // contractOptions.value = [
        //     {
        //         name: 'Test collection',
        //         address: testContract
        //     },
        //     {
        //         name: 'Effect collection',
        //         address: effectsContract
        //     }
        // ]
        setAvailableCollections()
    })

    const TokenMediaLoaderComponent = ref(null)

    const isSubmitAvailable = computed(() => {
        return meta.name.trim().length && !isLoading.value && TokenMediaLoaderComponent.value.file && contractAddress.value.length
    })

    const mint = async () => {
        try{
            isLoading.value = true

            const {
                transactionHash: hash,
                issuedContractAddress
            } = await AppConnector.connector.createNewToken(meta, TokenMediaLoaderComponent.value.file, contractAddress.value)

            TrnView
                .open({hash})
                .onClose(() => {
                    router.push({name: 'Gallery'})
                    AppConnector.connector.updateContractTokensList([issuedContractAddress])
                })
        }
        catch (e) {
            alert.open(getErrorTextByCode(e.message) || e.message, 'Error:')
        }
        finally {
            isLoading.value = false
        }
    }
</script>
