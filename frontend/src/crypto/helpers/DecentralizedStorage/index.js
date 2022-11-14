import StorageBack from "./StorageBack";
import FileCoinStorage from "./FileCoinStorage";
import {readData} from "@/crypto/helpers/DecentralizedStorage/CommonFunctions";

export default {
    ...FileCoinStorage,
    readData,
    async changeFile(newData, key){
        if(isFinite(key)) return await StorageBack.changeFile(newData, key);
        return await FileCoinStorage.changeFile(newData, key);
    }
}