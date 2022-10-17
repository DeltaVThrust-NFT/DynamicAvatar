import { createRouter, createWebHistory } from 'vue-router'
import GalleryPage from '@/views/GalleryPage.vue'
import TokenDetail from '@/views/TokenDetail.vue'
import ApplyPage from '@/views/ApplyPage.vue'
import MintPage from '@/views/MintPage.vue'
import BundlePage from '@/views/BundlePage.vue'
import LoginPage from '@/views/LoginPage.vue'
import AppConnector from '@/crypto/AppConnector'
import {ConnectionStore} from '@/crypto/helpers'

const routes = [
  {
    path: '/',
    name: 'Gallery',
    component: GalleryPage,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/asset/:contractAddress/:tokenID',
    name: 'TokenDetail',
    component: TokenDetail,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/mint',
    name: 'MintPage',
    component: MintPage,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/apply',
    name: 'ApplyPage',
    component: ApplyPage,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/bundle',
    name: 'BundlePage',
    component: BundlePage,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/login',
    name: 'LoginPage',
    component: LoginPage
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach(async (to, from) => {
  const loginPage = {
    name: 'LoginPage',
    query: {
      need_auth: true,
      redirect: to.fullPath
    }
  }
  try{
    const {connector} = await AppConnector.init()

    if(to.meta.requiresAuth){
      try{
        await connector.isUserConnected()
        ConnectionStore.getUserIdentity()
      }
      catch (e) {
        return loginPage
      }
    }
    else if(to.name === 'LoginPage') {
      try{
        await connector.isUserConnected()
        ConnectionStore.getUserIdentity()
        return {name: 'Gallery'}
      }
      catch (e) {}
    }
    return true
  }
  catch (e) {
    return loginPage
  }
})

export default router
