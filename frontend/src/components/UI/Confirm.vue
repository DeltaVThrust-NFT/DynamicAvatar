<template>
  <Modal
    class="size-s no-title"
    v-if="confirm.active"
    @close="confirm.close()"
  >
    <template #default>{{ confirm.message }}</template>
    <template #controls>

      <div v-if="confirm.customActions.length">
        <span
          class="btn"
          v-for="action in confirm.customActions"
          :key="action.buttonName"
          v-text="action.buttonName"
          @click="confirm.selectAction(action)"
        ></span>
      </div>
      <div v-else class="modal__two-btn">
        <span class="btn red" @click="confirm.cancel">Cancel</span>
        <span class="btn" @click="confirm.accept">Ok</span>
      </div>

    </template>
  </Modal>
</template>

<script setup>
    import Modal from "@/components/UI/Modal";
    import confirm from "@/utils/confirm";
</script>