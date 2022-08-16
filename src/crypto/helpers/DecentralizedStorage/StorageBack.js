import AppAPI, {HTTP} from "@/utils/API";
import {ErrorList} from '@/crypto/helpers'

export default {
    async save(file){
        const formData = new FormData();
        formData.append('payload', file);
        const result = await AppAPI.post('/ipfs/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        return result.data.split('://')[1]
    },

    /*
    * Put JSON to IPFS
    * @param {data} - js object
    * @return {string} cid
    * */
    async loadJSON(data = {}){
        try{
            let file = new Blob([JSON.stringify(data)], {type: 'application/json'});
            return await this.save(file)
        }
        catch (e){
            console.log('Error while loadingJSON to back', e)
            throw Error(ErrorList.LOAD_MEDIA_ERROR)
        }
    },

    /*
    * Put file to IPFS
    * @param {object} file - instance of Blob/File
    * @return {string} file_url
    * */
    async loadFile(file){
        try{
            const cid = await this.save(file)
            return `https://ipfs.io/ipfs/${cid}`;
        }
        catch (e){
            console.log('Error while loadingJSON to back', e)
            throw Error(ErrorList.LOAD_MEDIA_ERROR)
        }
    },

    async readData(url){
        let meta = null
        try{
            if(!url.startsWith('ipfs://') && !url.startsWith('http')) url = 'ipfs://'+url
            let fetchURL = null
            if(url.startsWith('ipfs://')) fetchURL = `https://ipfs.io/ipfs/${url.replace('ipfs://', '')}`
            else if(url.startsWith('http')) fetchURL = url
            if(fetchURL){

                const fetchWithPlainRequest = async () => {
                    const response = await HTTP.get(fetchURL, {headers: {'accept': 'application/json'}})
                    if(response.headers['content-type'].indexOf('application/json') !== -1 && response.data) {
                        meta = response.data
                    }
                }

                await fetchWithPlainRequest()
            }
        } catch (e) {
            meta = null
            if(e.message === 'Network Error'){
                throw e
            }
        }
        return meta
    }
}