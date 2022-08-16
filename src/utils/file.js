const acceptedTypes = ['image/png', 'image/jpeg']
const maxSize = 5

export function checkFile(file){
    const type = file.type.toLowerCase()
    const size = (file.size / 1024 / 1024).toFixed(2)

    if(!acceptedTypes.includes(type)) throw new Error('TYPE')
    if(size > maxSize) throw new Error('SIZE')

    return true
}