import {useStore} from "@/store/main";
import {storeToRefs} from "pinia";
import {computed, ref} from "vue";

export function useWalletConnection(){
    const store = useStore()

    const {
        connection,
        networks,
        wallets
    } = storeToRefs(store);

    const network = ref(null)
    const wallet = ref(null)

    const networkAssets = '/img/connect/'

    const submitAvailable = computed(() => network.value && wallet.value)

    const isOpen = computed(() => !connection.value.userIdentity)
    return {
        isOpen,
        networks,
        wallets,
        selectedNetwork: network,
        selectedWallet: wallet,
        networkAssets,
        close: () => {
            // can`t close
        },
        setNetwork: value => {
            network.value = value
        },
        setWallet: value => wallet.value = value,
        submitAvailable
    }
}
