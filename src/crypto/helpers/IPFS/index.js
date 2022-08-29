// const loadIPFS = () => import(/* webpackChunkName: "ipfs" */ 'ipfs-core')
//
// let waiting = []
// let isStarted = false

// let ipfs = null
export async function getIPFS() {
    // if(ipfs) return ipfs
    //
    // if(!isStarted){
    //     isStarted = true
    //     try{
    //         const loadedScript = await loadIPFS()
    //         isStarted = false
    //         ipfs = await loadedScript.create()
    //         if(waiting.length) waiting.forEach(promise => promise.resolve(ipfs))
    //     }
    //     catch (e) {
    //         if(waiting.length) waiting.forEach(promise => promise.reject(ipfs))
    //     }
    //     waiting = []
    //
    //     return ipfs
    // }
    // return makeCallbackFunction()
}

// function makeCallbackFunction(){
//     const add = {};
//     const promise = new Promise((resolve, reject) => {
//         add.resolve = resolve
//         add.reject = reject
//     })
//     waiting.push(add)
//     return promise
// }