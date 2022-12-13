import {HTTP} from "@/utils/API";

export const Roles = {
    NoRole: 0,
    Original: 1,
    Modifier: 2,
    nonRemoved: [1, 2]
}

export const Traits = {
    age: {
        baby: 0,
        child: 1,
        teen: 2,
        adult: 3,
        senior: 4
    },
    mood: {
        angry: 1,
        sad: 2,
        general: 3,
        happy: 4
    },
    getAgeNameById(inputId) {
        return Object.entries(this.age).find(([, id]) => id === inputId)?.[0]
    },
    getMoodNameById(inputId) {
        return Object.entries(this.mood).find(([, id]) => id === inputId)?.[0]
    },

    sex: {
        male: 0,
        female: 1,
    },
    emoji: {
        im_perfect_anime: 0,
        angel_anime: 1,
        im_sick_anime: 2,
        camera_anime: 3,
        dont_understand_anime: 4,
        evil_laugh_anime: 5
    },
    getSexNameById(inputId) {
        return Object.entries(this.sex).find(([, id]) => id === inputId)?.[0]
    },
    getEmojiNameById(inputId) {
        return Object.entries(this.emoji).find(([, id]) => id === inputId)?.[0]
    },
}

export async function getTokenImageFileByName(inputName) {
    const imageName = inputName.split('/').slice(-2).join('/')
    const imageBytes = await fetch(`/img/characters/${imageName}`).then(r => r.blob())

    return new File([imageBytes], imageName, {
        lastModified: new Date(),
        type: imageBytes.type
    })
}

export function getBaseFileURL(url){
    return url.split('#').shift()
}

export function getFileIdByURL(url){
    return url.split('#').shift().split('/').pop()
}

export async function applyAssets(serverURL, original_url, modificator_urls = []){
    const sendBody = {
        original_url,
        modificator_urls
    }

    const {data: blobImage} = await HTTP.post(
        serverURL,
        sendBody,
        {
            responseType: 'blob'
        }
    )

    const newImage = new File([blobImage], 'image', {
        lastModified: new Date(),
        type: blobImage.type
    })

    return {
        file: newImage,
        blob: URL.createObjectURL(blobImage),
    }
}

export function transformIdentityToObject(identity){
    const [token, tokenId] = identity.split(':')
    return {token, tokenId}
}

export function transformIdentitiesToObjects(identitiesList){
    return identitiesList.map(transformIdentityToObject)
}

export function addRole(tokenList, {original = [], modifier = []} = {}){
    tokenList.forEach(token => {
        const tokenIdentity = `${token.token}:${token.tokenId}`
        token.role = original.includes(tokenIdentity) && Roles.Original || modifier.includes(tokenIdentity) && Roles.Modifier || Roles.NoRole
    })
}