<template>
  <div class="token-data__visual">
    <div>Age:</div>
    <div>
      <input type="range" :min="0" :max="Object.keys(Traits.age).length - 1" v-model="tokenAge">
      {{ ageSelected }}
    </div>
    <div>Mood:</div>
    <div>
      <input type="range" :min="1" :max="Object.keys(Traits.mood).length" v-model="tokenMood">
      {{ moodSelected }}
    </div>
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
    import LoaderElement from '@/components/UI/Loader'

    const propKeys = {
        name: 'Name',
        description: 'Description',
        link: 'Outer link'
    }

    const props = defineProps(['token'])
    const emits = defineEmits(['setTempImage'])

    const age = props.token.attributes.find(attribute => attribute.trait_type === 'age')?.value || Traits.age.baby
    const mood = props.token.attributes.find(attribute => attribute.trait_type === 'mood')?.value || Traits.mood.general

    const tokenAge = ref(age)
    const tokenMood = ref(mood)

    const ageSelected = computed(() => {
        return Object.entries(Traits.age).find(([name, id]) => id === +tokenAge.value)[0]
    })

    const moodSelected = computed(() => {
        return Object.entries(Traits.mood).find(([name, id]) => id === +tokenMood.value)[0]
    })

    const haveAttributesChanges = ref(false)

    let dontApplyChanges = false
    watch([tokenAge, tokenMood], async () => {
        if(dontApplyChanges) {
            dontApplyChanges = false
            return
        }
        haveAttributesChanges.value = true

        // emits('setTempImage', '/img/characters/' + AppConnector.connector.generateNewTokenImage({age: tokenAge.value, mood: tokenMood.value}))
        const {tempURL} = await AppConnector.connector.generateNewTokenImage({age: tokenAge.value, mood: tokenMood.value}, props.token)
        emits('setTempImage', tempURL)
    })

    const isLoading = ref(false)

    const saveNewAttributes = async () => {
        isLoading.value = true
        try{
            await AppConnector.connector.saveNewAttributes(props.token, {age: tokenAge.value, mood: tokenMood.value})
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
        dontApplyChanges = true
        tokenAge.value = props.token.attributes.find(attribute => attribute.trait_type === 'age')?.value || Traits.age.baby
        tokenMood.value = props.token.attributes.find(attribute => attribute.trait_type === 'mood')?.value || Traits.mood.general
        emits('setTempImage', null)
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
