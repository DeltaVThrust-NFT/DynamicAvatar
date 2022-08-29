<template>
  <div class="sketch">
    <div class="sketch__logo">
      <router-link :to="{name: 'Gallery'}">
        <svg viewBox="0 0 98 22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15.7149 0V21.8527H13.71V18.7898C13.081 19.8304 12.2456 20.6256 11.2039 21.1754C10.1818 21.7251 9.02207 22 7.72478 22C6.27024 22 4.95329 21.6662 3.77394 20.9987C2.59458 20.3311 1.67075 19.3985 1.00245 18.2008C0.334151 17.0031 0 15.6386 0 14.1071C0 12.5756 0.334151 11.2111 1.00245 10.0134C1.67075 8.81571 2.59458 7.8929 3.77394 7.24498C4.95329 6.57742 6.27024 6.24364 7.72478 6.24364C8.98276 6.24364 10.113 6.5087 11.1154 7.03882C12.1375 7.54931 12.9729 8.30522 13.6216 9.30656V0H15.7149ZM7.90168 20.1446C8.98276 20.1446 9.95573 19.8992 10.8206 19.4083C11.7051 18.8978 12.3931 18.1812 12.8845 17.2584C13.3955 16.3356 13.651 15.2851 13.651 14.1071C13.651 12.9291 13.3955 11.8786 12.8845 10.9558C12.3931 10.033 11.7051 9.32619 10.8206 8.83534C9.95573 8.32485 8.98276 8.06961 7.90168 8.06961C6.80095 8.06961 5.80833 8.32485 4.92381 8.83534C4.05895 9.32619 3.37099 10.033 2.85994 10.9558C2.36854 11.8786 2.12284 12.9291 2.12284 14.1071C2.12284 15.2851 2.36854 16.3356 2.85994 17.2584C3.37099 18.1812 4.05895 18.8978 4.92381 19.4083C5.80833 19.8992 6.80095 20.1446 7.90168 20.1446Z" fill="#555"></path>
          <path d="M27.8839 22C26.3901 22 25.0436 21.6662 23.8446 20.9987C22.6456 20.3115 21.7021 19.369 21.0142 18.1714C20.3262 16.9737 19.9822 15.6189 19.9822 14.1071C19.9822 12.5953 20.3262 11.2405 21.0142 10.0428C21.7021 8.84516 22.6456 7.91254 23.8446 7.24498C25.0436 6.57742 26.3901 6.24364 27.8839 6.24364C29.3778 6.24364 30.7242 6.57742 31.9232 7.24498C33.1222 7.91254 34.0559 8.84516 34.7242 10.0428C35.4121 11.2405 35.7561 12.5953 35.7561 14.1071C35.7561 15.6189 35.4121 16.9737 34.7242 18.1714C34.0559 19.369 33.1222 20.3115 31.9232 20.9987C30.7242 21.6662 29.3778 22 27.8839 22ZM27.8839 20.1446C28.9847 20.1446 29.9675 19.8992 30.8323 19.4083C31.7168 18.8978 32.4048 18.1812 32.8962 17.2584C33.3876 16.3356 33.6333 15.2851 33.6333 14.1071C33.6333 12.9291 33.3876 11.8786 32.8962 10.9558C32.4048 10.033 31.7168 9.32619 30.8323 8.83534C29.9675 8.32485 28.9847 8.06961 27.8839 8.06961C26.7832 8.06961 25.7906 8.32485 24.9061 8.83534C24.0412 9.32619 23.3532 10.033 22.8422 10.9558C22.3508 11.8786 22.1051 12.9291 22.1051 14.1071C22.1051 15.2851 22.3508 16.3356 22.8422 17.2584C23.3532 18.1812 24.0412 18.8978 24.9061 19.4083C25.7906 19.8992 26.7832 20.1446 27.8839 20.1446Z" fill="#555"></path>
          <path d="M58.4863 1.23706V21.8529H54.5649L44.275 9.33613V21.8529H39.5576V1.23706H43.5085L53.7689 13.7538V1.23706H58.4863Z" fill="#000"></path>
          <path d="M68.1457 5.06571V10.5142H77.6985V14.3428H68.1457V21.8529H63.3693V1.23706H78.9663V5.06571H68.1457Z" fill="#000"></path>
          <path d="M86.619 5.12461H80.0146V1.23706H97.9998V5.12461H91.3954V21.8529H86.619V5.12461Z" fill="#000"></path></svg>
      </router-link>
    </div>
    <div class="sketch__header">
      <div class="header">
        <div>
          <!--<span class="header__return">
            <span>
              <svg viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.73633 13.5039C7.01462 13.7722 7.45776 13.7642 7.72611 13.4859C7.99447 13.2076 7.98641 12.7645 7.70812 12.4961L6.73633 13.5039ZM1 7L0.514105 6.49611C0.377288 6.62804 0.3 6.80994 0.3 7C0.3 7.19007 0.377288 7.37196 0.514105 7.50389L1 7ZM7.70812 1.50389C7.98641 1.23554 7.99447 0.792396 7.72611 0.514105C7.45776 0.235814 7.01462 0.227757 6.73633 0.496109L7.70812 1.50389ZM17 7.7C17.3866 7.7 17.7 7.3866 17.7 7C17.7 6.6134 17.3866 6.3 17 6.3L17 7.7ZM7.70812 12.4961L1.48589 6.49611L0.514105 7.50389L6.73633 13.5039L7.70812 12.4961ZM1.48589 7.50389L7.70812 1.50389L6.73633 0.496109L0.514105 6.49611L1.48589 7.50389ZM1 7.7L17 7.7L17 6.3L1 6.3L1 7.7Z"></path></svg>
            </span>
            <span>
              Return
            </span>
          </span>-->
        </div>
        <div>
          <div class="header__right">
            <div>
              <div class="search box" v-show="route.name === 'Gallery'">
                <input type="text" class="input" v-model="searchInput" placeholder="Search NFT or collection">
                <span class="search__icon">
                  <svg viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21.5 21.5L15.5 15.5M17.5 10.5C17.5 14.366 14.366 17.5 10.5 17.5C6.63401 17.5 3.5 14.366 3.5 10.5C3.5 6.63401 6.63401 3.5 10.5 3.5C14.366 3.5 17.5 6.63401 17.5 10.5Z" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                </span>
              </div>
            </div>
            <div>
              <div class="identity box" v-if="connection.userIdentity">
                <a
                  class="identity__wallet"
                  target="_blank"
                  :href="getExplorerLink('account', connection.userIdentity)"
                >
                  <div v-text="userIdentityShort"></div>
                  <div v-text="connection.userNetworkName || ''"></div>
                </a>
                <div class="identity__logout" @click="logout">
                  <svg viewBox="0 0 24 24"><path d="M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z"></path></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="sketch__nav">
      <router-link
        v-if="route.name !== 'Gallery'"
        :to="{name: 'Gallery'}"
      >
        <span class="header__return">
          <span>
            <svg viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.73633 13.5039C7.01462 13.7722 7.45776 13.7642 7.72611 13.4859C7.99447 13.2076 7.98641 12.7645 7.70812 12.4961L6.73633 13.5039ZM1 7L0.514105 6.49611C0.377288 6.62804 0.3 6.80994 0.3 7C0.3 7.19007 0.377288 7.37196 0.514105 7.50389L1 7ZM7.70812 1.50389C7.98641 1.23554 7.99447 0.792396 7.72611 0.514105C7.45776 0.235814 7.01462 0.227757 6.73633 0.496109L7.70812 1.50389ZM17 7.7C17.3866 7.7 17.7 7.3866 17.7 7C17.7 6.6134 17.3866 6.3 17 6.3L17 7.7ZM7.70812 12.4961L1.48589 6.49611L0.514105 7.50389L6.73633 13.5039L7.70812 12.4961ZM1.48589 7.50389L7.70812 1.50389L6.73633 0.496109L0.514105 6.49611L1.48589 7.50389ZM1 7.7L17 7.7L17 6.3L1 6.3L1 7.7Z"></path></svg>
          </span>
          <span>Back</span>
        </span>
      </router-link>
      <router-link
        class="btn sketch__nav-item"
        exact-active-class="active"
        v-else
        :to="{name: 'MintPage'}"
      >
        Mint new NFT
      </router-link>

      <!--<ToggleElement
        v-if="route.name === 'Gallery'"
        v-model="isBundleMode"
      >
        Choose NFT for bundle
      </ToggleElement>-->
      <div></div>
      <div></div>
    </div>
    <div class="sketch__main" :class="$attrs.class">
      <slot></slot>
    </div>
    <div class="sketch__footer">
      © 2022 doNFT, All Rights Reserved.
    </div>
  </div>
</template>

<script>
    export default {
        inheritAttrs: false
    }
</script>
<script setup>
    import {useStore} from "@/store/main";
    import {storeToRefs} from "pinia";
    import {ConnectionStore} from '@/crypto/helpers'
    import {useRoute} from "vue-router";
    import {ref} from "vue";
    import ToggleElement from '@/components/UI/Toggle'

    const store = useStore()
    const {
        connection,
        userIdentityShort,
        getExplorerLink,
        isBundleMode,
        searchInput
    } = storeToRefs(store);

    const logout = async () => {
        await ConnectionStore.logOut()
    }

    const route = useRoute()
</script>