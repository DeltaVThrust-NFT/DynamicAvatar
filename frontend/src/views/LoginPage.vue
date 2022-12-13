<template>
  <div class="lp-intro-cover">
    <div class="lp-intro">
      <div>
        <h1>
          Welcome to DoCharacter demo by DoNFT
        </h1>
        <div>
          Use power of neural network algorithms to create new unique combinations of digital art
        </div>
        <div>
          <span class="btn" @click="openModal">Connect wallet</span>
        </div>
      </div>
      <div>
        <div class="lp-intro__logo">
          <div></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {useStore} from "@/store/main";
const store = useStore()
import {onMounted} from "vue";

onMounted(() => {
  store.onLoginPageModalChange(false)
})

const openModal = () => store.onLoginPageModalChange(true)
</script>