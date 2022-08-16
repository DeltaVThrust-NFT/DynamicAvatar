<template>
  <Modal
    class="size-s"
    v-if="TrnView.active"
    @close="() => TrnView.close()"
  >
    <template #title>{{ TrnView.title }}</template>
    <template #default>
      <TransactionHash :hash="TrnView.hash"/>
    </template>
    <template #controls>
      <span class="btn" @click="TrnView.close">Ok</span>
    </template>
  </Modal>
</template>

<script setup>
    import Modal from "@/components/UI/Modal";
    import TransactionHash from "@/components/modals/TransactionHash";
    import TrnView from "@/utils/TrnView";
</script>