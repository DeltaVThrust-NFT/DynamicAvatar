<template>
  <div class="token-data__visual">
    <template v-if="isAttributesAvailable">
      <div>Sex:</div>
      <div>
        <select v-model="tokenSex">
          <option :value="0">Male</option>
          <option :value="1">Female</option>
        </select>
      </div>
      <div>Emoji:</div>
      <div>
        <select v-model="tokenEmoji">
          <option v-for="item in Object.keys(Traits.emoji).length" :value="item - 1">{{ emojiItemName(item - 1) }}</option>
        </select>
      </div>
    </template>
    <template v-for="prop in viewProps">
      <div v-text="prop.name + ':'"></div>
      <div v-text="prop.value"></div>
    </template>
    <template v-if="haveAttributesChanges">
      <div class="btn" @click="saveNewAttributes">Save</div>
      <div>
        <div class="btn btn_inline red" @click="cancelAttributesChange">Cancel</div>
      </div>
    </template>
  </div>
  <LoaderElement v-if="isLoading" class="absolute with-bg">Saving...</LoaderElement>
</template>

<script setup>
    import {computed, nextTick, watch} from "vue";
    import {ref} from "vue";
    import {Traits} from "@/crypto/helpers/Token";
    import AppConnector from "@/crypto/AppConnector";
    import alert from "@/utils/alert";
    import {getErrorTextByCode} from "@/crypto/helpers";
    import {CollectionType} from "@/utils/collection";
    import LoaderElement from '@/components/UI/Loader'
    import {useStore} from "@/store/main";

    const store = useStore()

    const propKeys = {
        name: 'Name',
        description: 'Description',
        link: 'Outer link'
    }

    const props = defineProps(['token'])
    const emits = defineEmits(['setTempImage'])

    const isAttributesAvailable = computed(() => {
        const contract = store.findContractObject(props.token.contractAddress)
        return CollectionType.isBundle(contract.type)
    })

    const sex = props.token.attributes.find(attribute => attribute.trait_type === 'sex')?.value || Traits.sex.male
    const emoji = props.token.attributes.find(attribute => attribute.trait_type === 'emoji')?.value || Traits.emoji.im_perfect_anime

    const tokenSex = ref(sex)
    const tokenEmoji = ref(emoji)

    const sexSelected = computed(() => {
        return Object.entries(Traits.sex).find(([name, id]) => id === +tokenSex.value)[0]
    })

    const emojiItemName = computed(() => itemId => {
      return Object.entries(Traits.emoji).find(([name, id]) => id === +itemId)[0]
    })

    const emojiSelected = computed(() => {
        return Object.entries(Traits.emoji).find(([name, id]) => id === +tokenEmoji.value)[0]
    })

    const haveAttributesChanges = ref(false)

    // let dontApplyChanges = false
    watch([tokenSex, tokenEmoji], async () => {
        // if(dontApplyChanges) {
        //     dontApplyChanges = false
        //     return
        // }
        haveAttributesChanges.value = true

        // emits('setTempImage', '/img/characters/' + AppConnector.connector.generateNewTokenImage({age: tokenAge.value, mood: tokenMood.value}))
        // const {tempURL} = await AppConnector.connector.generateNewTokenImage({age: tokenAge.value, mood: tokenMood.value}, props.token)
        // emits('setTempImage', tempURL)
    })

    const isLoading = ref(false)

    const saveNewAttributes = async () => {
        isLoading.value = true
        try{
            await AppConnector.connector.saveNewAttributes(props.token, {sex: tokenSex.value, emoji: tokenEmoji.value})
            await nextTick(() => {
                haveAttributesChanges.value = false
            })
        }
        catch (e) {
            alert.open(getErrorTextByCode(e.message) || e.message, 'Error:')
        }
        finally {
            isLoading.value = false
        }
    }

    const cancelAttributesChange = () => {
        // dontApplyChanges = true
        tokenSex.value = props.token.attributes.find(attribute => attribute.trait_type === 'sex')?.value || Traits.sex.male
        tokenEmoji.value = props.token.attributes.find(attribute => attribute.trait_type === 'emoji')?.value || Traits.emoji.im_perfect_anime
        // emits('setTempImage', null)
        nextTick(() => {
            haveAttributesChanges.value = false
        })
    }

    const viewProps = computed(() => {
        return [...props.token.fieldsForView].map(prop => {
            prop.name = propKeys[prop.key]
            return prop
        })
    })
</script>
