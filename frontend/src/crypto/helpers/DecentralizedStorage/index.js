import StorageBack from "./StorageBack";
import FileCoinStorage from "./FileCoinStorage";
import {readData} from "@/crypto/helpers/DecentralizedStorage/CommonFunctions";
import {reactive, ref, watch} from "vue";

export const storageTypeActive = ref(window.localStorage.getItem('metadata-storage') || 'own')
watch(() => storageTypeActive.value, (newValue) => {
    window.localStorage.setItem('metadata-storage', newValue)
})
export const storageTypeList = reactive(['own', 'IPNS'])
const storageControllerList = {
    own: StorageBack,
    IPNS: FileCoinStorage
}

export default {
    getStorage: () => storageControllerList[storageTypeActive.value],
    async loadJSON(data = {}) {
        const controller = this.getStorage()
        return await controller.loadJSON(data)
    },
    async loadFile(file) {
        const controller = this.getStorage()
        return await controller.loadFile(file)
    },
    // ...FileCoinStorage,
    readData,
    async changeFile(newData, key){
        if(isFinite(key)) return await StorageBack.changeFile(newData, key);
        return await FileCoinStorage.changeFile(newData, key);
    }
}