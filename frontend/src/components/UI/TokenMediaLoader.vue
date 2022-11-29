<template>
  <div class="token-media-loader">
    <div
      class="token-media-loader__img"
      v-if="image"
      :style="computeTokenImgStyle(image)"
    ></div>
    <div
      class="token-media-loader__selfie"
      v-if="isTransportSelfie"
    >

    </div>
    <TakePhoto
      v-if="isTransportSelfie"
      @fireError="($event) => null"
      @setMedia="setFileFromSelfie"
    />
    <div
      class="token-media-loader__input"
      v-else
      :class="{active: !image}"
      @click="loadFile"
    >
      <div>
        <svg viewBox="0 0 66 61" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M32.6569 34.2835L26.2926 40.442C25.9025 40.82 25.9025 41.4329 26.2926 41.8105C26.6832 42.1885 27.3165 42.1885 27.7072 41.8105L32.3639 37.3039L32.3638 61H34.3639V37.3039L39.0206 41.8105C39.4113 42.1885 40.0446 42.1885 40.4352 41.8105C40.6578 41.595 40.7535 41.3025 40.7218 41.0209C40.7091 40.906 40.6749 40.7926 40.6198 40.6872C40.5734 40.5989 40.5118 40.5162 40.4352 40.442L34.0709 34.2835C33.6803 33.9055 33.0475 33.9055 32.6569 34.2835Z" fill-opacity="0.5"></path><path d="M54 21C54 9.40186 44.5981 0 33 0C21.4019 0 12 9.40186 12 21C12 21.6747 12.0318 22.342 12.094 23.0004C12.0627 23.0001 12.0314 23 12 23C5.37258 23 0 28.3726 0 35C0 41.6274 5.37258 47 12 47C13.6491 47 15.2205 46.6673 16.6508 46.0655L15.2021 44.4763C14.1968 44.8159 13.1199 45 12 45C6.47715 45 2 40.5229 2 35C2 29.4772 6.47715 25 12 25C12.1279 25 12.2552 25.0024 12.3819 25.0072C13.1076 25.0344 13.8135 25.139 14.4916 25.3129C14.4533 25.1481 14.4173 24.9825 14.3833 24.8162C14.2685 24.2687 14.1974 23.837 14.1246 23.1875C14.0423 22.4697 14 21.7398 14 21C14 10.5063 22.5063 2 33 2C43.4937 2 52 10.5063 52 21C52 21.7398 51.9577 22.4697 51.8755 23.1875C51.7927 23.909 51.6696 24.6183 51.5084 25.3129C52.1865 25.139 52.8924 25.0344 53.6181 25.0072C53.7448 25.0024 53.8721 25 54 25C59.5229 25 64 29.4772 64 35C64 40.5229 59.5229 45 54 45C52.8801 45 51.8032 44.8159 50.7979 44.4763L49.3492 46.0655C50.7795 46.6673 52.3509 47 54 47C60.6274 47 66 41.6274 66 35C66 28.3726 60.6274 23 54 23C53.9686 23 53.9373 23.0001 53.906 23.0004C53.9682 22.342 54 21.6747 54 21Z" fill-opacity="0.5"></path></svg>
        <div>Browse to choose a file *</div>
      </div>
    </div>
  </div>

  <ToggleElement v-if="isSelfieAvailable" v-model="isTransportSelfie">
    {{ isTransportSelfie? 'Make selfie' : 'Load file'}}
  </ToggleElement>
</template>

<script setup>
    import {ref} from "vue";
    import {computeTokenImgStyle} from "@/utils/styles";
    import {checkFile, checkFileSize} from "@/utils/file";
    import alert from "@/utils/alert";
    import ToggleElement from '@/components/UI/Toggle'
    import TakePhoto from '@/components/UI/TakePhoto'

    const props = defineProps(['mode'])
    const emits = defineEmits(['addFile'])

    const isTransportSelfie = ref(false)

    const isSelfieAvailable = +process.env.VUE_APP_IS_SELFIE_AVAILABLE

    const isLoading = ref(false)
    const image = ref(null)
    const file = ref(null)

    const loadFile = () => {
        const input = document.createElement('input')
        input.setAttribute('type', 'file');
        if (!props.mode) input.setAttribute('accept', 'image/png,image/jpeg');
        document.getElementById('tempInjectedElements').appendChild(input);
        input.onchange = (e) => {
            e.preventDefault()
            const fileForLoad = e.target.files[0]
            if(!fileForLoad) return

            try{
                isLoading.value = true
                if (!props.mode) {
                  checkFile(fileForLoad)
                  file.value = fileForLoad
                  image.value = URL.createObjectURL(fileForLoad)
                }
                else if (props.mode === 'loadOnly') {
                  checkFileSize(fileForLoad)
                  emits('addFile', fileForLoad)
                }
            }
            catch (e){
                let message = ''
                if(e.message === 'TYPE') message = 'This file type is not supported'
                else if(e.message === 'SIZE') message = 'The file is to large'
                else message = 'Unnamed error'
                alert.open(message)
            }
            finally {
                isLoading.value = false
            }
        }
        input.click()
    }

    const setFileFromSelfie = ({photo, file: fileBlob}) => {
        image.value = photo
        file.value = fileBlob
        isTransportSelfie.value = false
    }

    defineExpose({
        image,
        file
    })
</script>