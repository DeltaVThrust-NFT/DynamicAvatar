import {IpnsAPI} from "@/utils/API";
import {randomBytes} from "ethers/lib/utils";
import {ErrorList} from "@/crypto/helpers";

const FileCoinStorage = {
    async save(file, key = null) {
        if(!(file instanceof File)) {
            file = new Blob([JSON.stringify(file)], {type: 'application/json'});
        }
        const formData = new FormData();
        formData.append('payload', file)
        const result = await IpnsAPI.post('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        let ipfs = ''
        if(result.data && result.data.startsWith('ipfs://')) {
            ipfs = result.data.split('://').pop()
        }
        else throw Error('IPFS value not valid')

        if(!key) ({value: key} = await this.keyGen())

        const ipns = await this.publish(ipfs, key)

        return ipns
    },
    async publish(ipfsHash, ipnsKey) {
        let ipnsHash = null
        let i = 0
        while (i < +process.env.VUE_APP_IPNS_ATTEMPTS || 10) {
            try {
                const response = await IpnsAPI.post('/publish', `hash=${ipfsHash}&key_name=${ipnsKey}`)
                console.log(response);
                if(Array.isArray(response.data) && response.data.length === 2 && response.data[0] && response.data[1]) {
                    ipnsHash = response.data[0]
                    break;
                }
                else throw Error('IPFS value not valid')
            }
            catch (e) {}
            finally{
                i++
            }
        }
        if(ipnsHash && ipnsHash === ipnsKey) return `https://ipfs.io/ipns/${ipnsHash}`
        else throw Error('Could not publish to IPNS')
    },
    async keyGen() {
        const bytes = randomBytes(10)
        const keyName = bytes.join('') + Date.now();
        let keyValue = ''

        const response = await IpnsAPI.post('/key_gen', `name=${keyName}`)
        if(Array.isArray(response.data) && response.data.length === 2 && response.data[1]) {
            keyValue = response.data[1]
        }
        else throw Error('IPNS key pail failed')

        return {
            name: keyName,
            value: keyValue
        }
    },

    async loadJSON(data = {}){
        try{
            return await this.save(data)
        }
        catch (e){
            console.log('Error while loadingJSON to back', e)
            throw Error(ErrorList.LOAD_MEDIA_ERROR)
        }
    },
    async loadFile(file){
        try{
            return await this.save(file)
        }
        catch (e){
            console.log('Error while loadingJSON to back', e)
            throw Error(ErrorList.LOAD_MEDIA_ERROR)
        }
    },
    async changeFile(newData, key) {
        try{
            return await this.save(newData, key)
        }
        catch (e){
            console.log('Error while loadingJSON to back', e)
            throw Error(ErrorList.LOAD_MEDIA_ERROR)
        }
    },
}

export default FileCoinStorage