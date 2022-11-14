import {StorageAPI} from "@/utils/API";
import {ErrorList} from '@/crypto/helpers'

export default {
    async save(file, id = null){
        if(!(file instanceof File)){
            file = new Blob([JSON.stringify(file)], {type: 'application/json'});

            // const file_1 = new File([file], 'metadata.json', {
            //     lastModified: new Date(),
            //     type: 'application/json'
            // })
            //
            // console.log(URL.createObjectURL(file))
            // console.log(URL.createObjectURL(file_1))
        }

        const formData = new FormData();
        formData.append('file', file)
        formData.append('file_type', file.type)
        if(id) formData.append('file_id', id)
        const result = await StorageAPI.post('', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        return `${process.env.VUE_APP_STORAGE_ENDPOINT}/${result.data}`
    },

    /*
    * Put JSON to IPFS
    * @param {data} - js object
    * @return {string} cid
    * */
    async loadJSON(data = {}){
        try{
            // let file = new Blob([JSON.stringify(data)], {type: 'application/json'});
            return await this.save(data)
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
            return await this.save(file)
        }
        catch (e){
            console.log('Error while loadingJSON to back', e)
            throw Error(ErrorList.LOAD_MEDIA_ERROR)
        }
    },

    async changeFile(file, id){
        try{
            return await this.save(file, id)
        }
        catch (e){
            console.log('Error while loadingJSON to back', e)
            throw Error(ErrorList.LOAD_MEDIA_ERROR)
        }
    },
}