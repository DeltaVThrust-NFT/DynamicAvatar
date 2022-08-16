import {
    Networks,
    ConnectionStore,
    Formatters,
    AppStorage,
    Token,
    DecentralizedStorage,
    ActionTypes
} from '@/crypto/helpers'
import SmartContract from '@/crypto/EVM/SmartContract.js'
import {CollectionType} from "@/utils/collection";
import {stringCompare} from "@/utils/string";
import alert from "@/utils/alert";
import {ethers} from "ethers";
import {log} from "@/utils/AppLogger";

class EVM {

    constructor(){

    }


    /* ---------- Connected methods ON  ----------  */
    async init(){
        return await this.connector.init(this)
    }
    async connectToWallet(value){
        return await this.connector.connectToWallet(value)
    }
    async disconnect(){
        return await this.connector.disconnect()
    }
    async isUserConnected(){
        return await this.connector.isUserConnected()
    }
    /*  ----------  Connected methods OFF  ----------  */


    async fetchCollectionsWithTokens(){
        const storage = AppStorage.getStore()
        storage.changeCollectionLoadingState(true)

        const {
            bundleContract,
            effectsContract,
            testContract
        } = Networks.getSettings(ConnectionStore.getNetwork().name)

        const contractsList = [bundleContract, effectsContract, testContract]

        const collections = await Promise.all(contractsList.map(contractAddress => this.getContractWithTokens(contractAddress)))

        storage.changeCollectionLoadingState(false)
        storage.setCollections(collections)
    }

    async getContractWithTokens(address){
        const userIdentity = ConnectionStore.getUserIdentity()
        const contract = new SmartContract({
            address
        })

        const checkContractTypes = {
            isBundle: null,
            isEffect: null
        }
        const contractInstance = await contract._getInstance()

        checkContractTypes.isBundle = await contractInstance.supportsInterface(process.env.VUE_APP_BUNDLE_INTERFACE_ID)

        //  check for effect
        if(!checkContractTypes.isBundle){
            const whiteList = await this.getWhiteList()
            checkContractTypes.isEffect = whiteList.find(contract => stringCompare(contract.contractAddress, address))
        }

        const plainContractObject = await contract.getObjectForUser(userIdentity)

        if(checkContractTypes.isBundle) plainContractObject.type = CollectionType.BUNDLE
        else if(checkContractTypes.isEffect) plainContractObject.type = CollectionType.EFFECT
        else plainContractObject.type = CollectionType.NONE

        return Formatters.contractFormat(plainContractObject)
    }

    whiteList = []
    async getWhiteList({withUpdate = false} = {}){
        if(!withUpdate && this.whiteList.length) return this.whiteList

        const {
            whiteListContract: address,
        } = Networks.getSettings(ConnectionStore.getNetwork().name)

        const contract = new SmartContract({
            address,
            type: CollectionType.WHITE_LIST
        })

        return this.whiteList = await contract.getWhiteList()
    }

    async getApplyEffectServerURLByContractAddress(contractAddress) {
        const whiteList = await this.getWhiteList()
        return whiteList.find(item => stringCompare(item.contractAddress, contractAddress))?.serverUrl
    }

    async getContractTokens(contractAddress){
        const contract = new SmartContract({
            address: contractAddress
        })
        return await contract.fetchTokensForUser(ConnectionStore.getUserIdentity())
    }

    async getWrappedTokensObjectList(contractAddress, tokenID){
        const storage = AppStorage.getStore()
        storage.changeLoadingInnerTokens(contractAddress, tokenID, true)
        const contract = new SmartContract({
            address: contractAddress,
            type: CollectionType.BUNDLE
        })
        const wrappedTokens = await contract.getWrappedTokenList(tokenID)
        const wrappedTokenIdentities = wrappedTokens.map(token => `${token.contractAddress}:${token.tokenID}`)
        const tokens = await this.getTokenListByIdentity(wrappedTokenIdentities)

        // add roles
        tokens.forEach(token => {
            const originToken = wrappedTokens.find(t => t.contractAddress === token.contractAddress && t.tokenID === token.id)
            token.role = originToken? originToken.role : Token.Roles.NoRole
        })

        storage.setTokenInside(contractAddress, tokenID, tokens)
        storage.changeLoadingInnerTokens(contractAddress, tokenID, false)
        return tokens
    }

    async getTokenListByIdentity(identityList){
        return await Promise.all(identityList.map(identity => this.getTokenByIdentity(identity)))
    }

    async getTokenByIdentity(identity){
        const [address, tokenID] = identity.split(':')
        const contract = new SmartContract({
            address
        })
        return await contract.getTokenById(tokenID)
    }






    async updateContractTokensList(list) {
        try{
            await Promise.all(list.map(address => this.updateContractTokens(address)))
        }
        catch (e) {
            console.log('updateContractTokensList', e);
        }
    }

    async updateContractTokens(contractAddress){
        const storage = AppStorage.getStore()
        try{
            storage.changeContractUpdating(contractAddress, true)
            const tokens = await this.getContractTokens(contractAddress, true)
            storage.updateContractTokens(contractAddress, tokens)
        }
        catch (e) {
            console.log('updateContractTokens', e);
        }
        finally {
            storage.changeContractUpdating(contractAddress, false)
        }
    }




    async mintTestToken({cid, contractAddress}){
        const contract = new SmartContract({
            address: contractAddress
        })
        return await contract.mint(ConnectionStore.getUserIdentity(), cid)
    }

    async createBundle(meta, image, tokens){
        const storage = AppStorage.getStore()

        storage.setProcessStatus(ActionTypes.uploading_meta_data)
        const {
            metaCID
        } = await this.createTokenMeta(meta, image)

        const tokensList = Token.transformIdentitiesToObjects(tokens.map(t => t.identity))
        Token.addRole(tokensList)

        const {
            bundleContract: address
        } = Networks.getSettings(ConnectionStore.getNetwork().name)

        return {
            address,
            metaCID,
            tokensList
        }
    }

    async createTokenMeta(meta, image){
        const storage = AppStorage.getStore()

        storage.setProcessStatus(ActionTypes.uploading_media)
        meta.image = await DecentralizedStorage.loadFile(image)

        storage.setProcessStatus(ActionTypes.uploading_meta_data)
        const metaCID = await DecentralizedStorage.loadJSON(meta)

        return {
            metaCID
        }
    }

    async applyEffectToToken({name, link, description}, original, effect){
        const storage = AppStorage.getStore()

        storage.setProcessStatus(ActionTypes.generating_media)

        const serverURL = await this.getApplyEffectServerURLByContractAddress(effect.contractAddress)

        let {url: image, blob} = await Token.applyAssets(serverURL, original, effect)

        storage.setProcessStatus(ActionTypes.uploading_meta_data)
        const metaCID = await DecentralizedStorage.loadJSON({
            name,
            description,
            image,
            link
        })

        const computedTokenList = Token.transformIdentitiesToObjects([original.identity, effect.identity])
        Token.addRole(computedTokenList, {
            original: [original.identity],
            modifier: [effect.identity]
        })

        const {
            bundleContract: contractAddress
        } = Networks.getSettings(ConnectionStore.getNetwork().name)

        return {
            resultTokenCID: metaCID,
            contractAddress,
            tokensList: computedTokenList,
            tempImage: blob,
            permanentImage: image
        }
    }





    async addTokensToBundle(tokenList){
        const addingTokenIdentities = tokenList.map(t => t.identity)
        const computedTokenList = Token.transformIdentitiesToObjects(addingTokenIdentities)
        computedTokenList.forEach(token => {
            token.role = Token.Roles.NoRole
        })

        return {
            addingTokenList: computedTokenList
        }
    }

    isRemoveFromBundleAllow(token){
        return !Token.Roles.nonRemoved.includes(token.role)
    }

    async removeAssetsFromBundle(tokenList){
        const addingTokenIdentities = tokenList.map(t => t.identity)
        const computedTokenList = Token.transformIdentitiesToObjects(addingTokenIdentities)
        computedTokenList.forEach(token => {
            token.role = Token.Roles.NoRole
        })
        return {
            removingTokens: computedTokenList
        }
    }





    async sendNFT(tokenObject, toAddressPlain) {
        const {realAddress: toAddress} = await this.checkForENSName(toAddressPlain)
        const [contractAddress, tokenID] = tokenObject.identity.split(':')
        const fromAddress = ConnectionStore.getUserIdentity()
        if(stringCompare(fromAddress, toAddress)) throw Error('THE_SAME_ADDRESS_ERROR')

        return {
            contractAddress,
            tokenID,
            fromAddress,
            toAddress
        }
    }


    async checkForENSName(address){
        if(ethers.utils.isAddress(address)){
            return {
                realAddress: address,
                ensName: address
            }
        }
        else{
            let realAddress;
            try{
                realAddress = await ConnectionStore.getProviderForENS().resolveName(address)
            }
            catch (e){
                log(e)
                throw new Error('CONTRACT_ADDRESS_ERROR')
            }
            if(realAddress && ethers.utils.isAddress(realAddress)){
                return {
                    realAddress: realAddress,
                    ensName: address
                }
            }
            else {
                throw new Error('CONTRACT_ADDRESS_ERROR')
            }
        }
    }

    tryToConnectToUnsupportedNetwork(){
        log('network not supported')
        alert.open('Sorry, we did not support this network')
    }

    async approve(tokenObject, toAddressPlain) {
        const {realAddress: forAddress} = await this.checkForENSName(toAddressPlain)
        const [contractAddress, tokenID] = tokenObject.identity.split(':')
        const fromAddress = ConnectionStore.getUserIdentity()
        if(stringCompare(fromAddress, forAddress)) throw Error('THE_SAME_ADDRESS_ERROR')

        const Contract = new SmartContract({
            address: contractAddress
        })
        const trnResult = await Contract.approve(forAddress, tokenID)
        if(!trnResult) throw Error('ALREADY_APPROVED')
        return trnResult
    }

    async isApproved(tokenObject){
        const [contractAddress, tokenID] = tokenObject.identity.split(':')
        const Contract = new SmartContract({
            address: contractAddress
        })
        const approvedFor = await Contract.getApproved(tokenID)
        return approvedFor && stringCompare(approvedFor, ConnectionStore.getUserIdentity())
    }
}

export default EVM