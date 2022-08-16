import AppAPI, {HTTP} from "@/utils/API";
import ConnectionStore from "@/crypto/helpers/ConnectionStore";

export const Roles = {
    NoRole: 0,
    Original: 1,
    Modifier: 2,
    nonRemoved: [1, 2]
}

export async function applyAssets(serverURL, original, modifier){
    const sendBody = {
        original: {
            contract: original.contractAddress,
            tokenId: original.id,
            contentUrl: original.image
        },
        modificator: {
            contract: modifier.contractAddress,
            tokenId: modifier.id,
            contentUrl: modifier.image
        },
        sender: ConnectionStore.getUserIdentity()
    }

    const {headers, data: blobImage} = await HTTP.post(
        serverURL,
        sendBody,
        {
            responseType: 'blob'
        }
    )

    return {
        url: `https://ipfs.io/${headers.contenturl.replace(':/', '')}`,
        blob: URL.createObjectURL(blobImage),
        cid: headers.contenturl.split('://').pop()
    }
}

export function transformIdentityToObject(identity){
    const [token, tokenId] = identity.split(':')
    return {token, tokenId}
}

export function transformIdentitiesToObjects(identitiesList){
    return identitiesList.map(transformIdentityToObject)
}

export function computeModifyObject(token){
    return {
        contractAddress: token.contractAddress,
        tokenID: token.id,
        contentUrl: token.image,
    }
}

export function addRole(tokenList, {original = [], modifier = []} = {}){
    tokenList.forEach(token => {
        const tokenIdentity = `${token.token}:${token.tokenId}`
        token.role = original.includes(tokenIdentity) && Roles.Original || modifier.includes(tokenIdentity) && Roles.Modifier || Roles.NoRole
    })
}