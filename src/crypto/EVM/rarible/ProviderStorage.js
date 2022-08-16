/*
* Storage for selected in rarible provider like:
* 'injected' - for MetaMask
* 'walletConnect' - for walletConnect
* */

const storeName = 'saved_provider'

export default {
    getValue() {
        return localStorage.getItem(storeName) || undefined
    },
    setValue(value) {
        localStorage.setItem(storeName, value || '')
    }
}