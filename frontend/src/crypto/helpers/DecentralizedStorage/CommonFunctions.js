import {HTTP} from "@/utils/API";

export async function readData(url){
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
                    meta.uri = fetchURL
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