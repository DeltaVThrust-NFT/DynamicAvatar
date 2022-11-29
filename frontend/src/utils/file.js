const acceptedTypes = ['image/png', 'image/jpeg']
const maxSize = 5

export function checkFile(file){
    const type = file.type.toLowerCase()
    const size = (file.size / 1024 / 1024).toFixed(2)

    if(!acceptedTypes.includes(type)) throw new Error('TYPE')
    if(size > maxSize) throw new Error('SIZE')

    return true
}

export function checkFileSize(file, maxSize = +process.env.VUE_APP_IPFS_MAX_SIZE) {
    const fileSize = (file.size / 1024 / 1024).toFixed(2)
    if (fileSize <= maxSize) return true
    throw new Error('SIZE')
}