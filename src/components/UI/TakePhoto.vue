<template>
  <div class="take-photo">
    <div class="take-photo__stream">
      <video ref="video" playsinline>Video stream not available.</video>
    </div>
    <canvas ref="canvas"></canvas>
    <img v-show="lastShot" :src="lastShot" alt="">

    <div class="take-photo__controls">
      <template v-if="lastShot">
        <span @click.prevent="useLastShot">Use this</span>
        <span @click.prevent="clearShot">Clear</span>
      </template>
      <span v-else-if="openCamera" @click.prevent="clickHandle">Take shot</span>
    </div>
  </div>
</template>

<script setup>

import {ref, onMounted, onBeforeUnmount, watch, nextTick, defineEmits} from "vue"
const emit = defineEmits(['fireError', 'setMedia'])
const lastShot = ref(null)
const lastBlob = ref(null)
const clearShot = () => {
  lastShot.value = null
  lastBlob.value = null
  emit('setMedia', {photo: null, file: null})
}
watch(lastShot, (_, prevURL) => {
  if(prevURL) URL.revokeObjectURL(prevURL)
})

const openCamera = ref(false)

const video = ref(null)
const canvas = ref(null)

let mediaSize = 0
let longerSide = null

const startRecord = async () => {
  try{
    lastShot.value = null
    video.value.srcObject = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    video.value.play()
    openCamera.value = true
  }
  catch (e){
    console.log(e)
    emit('fireError', 'MEDIA_NOT_ALLOWED')
  }
}

const takePhoto = () => {
  if(canvas.value && mediaSize){
    canvas.value.width = mediaSize
    canvas.value.height = mediaSize

    const context = canvas.value.getContext('2d')
    if(longerSide === 'same'){
      context.drawImage(video.value, 0, 0, mediaSize, mediaSize, 0, 0, mediaSize, mediaSize)
    }
    else if(longerSide === 'width'){
      context.drawImage(video.value, Math.floor((video.value.videoWidth - mediaSize) / 2), 0, mediaSize, mediaSize, 0, 0, mediaSize, mediaSize)
    }
    else {
      context.drawImage(video.value, 0, Math.floor((video.value.videoHeight - mediaSize) / 2), mediaSize, mediaSize, 0, 0, mediaSize, mediaSize)
    }

    canvas.value.toBlob(blob => {
      lastShot.value = URL.createObjectURL(blob)
      lastBlob.value = blob
    })
  }
}

const useLastShot = () => {
  emit('setMedia', {photo: lastShot.value, file: lastBlob.value})
}

const canPlayListener = (e) => {
  if(video.value.videoHeight < video.value.videoWidth){
    longerSide = 'width'
    mediaSize = video.value.videoHeight
  }
  else{
    longerSide = 'height'
    mediaSize = video.value.videoWidth
  }
  if(video.value.videoHeight === video.value.videoWidth) longerSide = 'same'
}

onMounted(() => {
  video.value.addEventListener('canplay', canPlayListener)
})
onBeforeUnmount(() => {
  video.value.removeEventListener('canplay', canPlayListener)
})

const clickHandle = () => {
  if(openCamera.value) takePhoto()
  else startRecord()
}

nextTick().then(() => startRecord())

</script>