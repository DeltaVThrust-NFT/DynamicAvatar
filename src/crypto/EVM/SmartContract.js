import { Contract } from "ethers";
import {stringCompare} from "@/utils/string";
import {log} from "@/utils/AppLogger";

import {
    DecentralizedStorage,
    Formatters,
    ConnectionStore,
    ErrorList,
    TokensABI,
    ActionTypes, Networks
} from '@/crypto/helpers'
import {getData} from "@/crypto/helpers/Networks";


class SmartContract {

    _address = null
    _type = null

    //  ethers contract instance
    _instance = null
    _provider = null

    metaData = {
        address: null,
        name: null,
        symbol: null,
        tokens: [],
        balance: 0
    }

    /*
    * @param options: object, address = string in hex, type = CollectionType
    * */
    constructor({address, type = 'common'}){
        this._address = address
        this._type = type
        this.metaData.address = address
    }

    async getObjectForUser(userIdentity){
        log(`[SmartContract] get contract: ${this._address}, for user: ${userIdentity}`)
        await this.fetchMetadata()
        await this.fetchUserBalance(userIdentity)
        await this.fetchTokensForUser(userIdentity)
        return this.metaData
    }

    async fetchMetadata(){
        const Contract = await this._getInstance()
        try{
            this.metaData.name = await Contract.name()
            this.metaData.symbol = await Contract.symbol() || ''
        }
        catch (e){
            log('[SmartContract] Error get contract meta from contract ' + this._address, e);
        }
    }

    async fetchUserBalance(userIdentity){
        const Contract = await this._getInstance()
        try {
            this.metaData.balance = Number(await Contract.balanceOf(userIdentity))
        }
        catch (e) {
            log(`[SmartContract] Error get user balance for contract ${this._address}`, e);
        }
        return this.metaData.balance
    }

    async fetchTokensForUser(userIdentity){
        const Contract = await this._getInstance()
        const balance = this.metaData.balance || await this.fetchUserBalance(userIdentity)

        try{

            //  get token ids
            let arrayOfTokens = await Promise.all([...new Array(balance)].map((_, index) => Contract.tokenOfOwnerByIndex(userIdentity, index)))
            log('[SmartContract] plain token ids', arrayOfTokens);

            //  convert them into string
            arrayOfTokens = arrayOfTokens.map(id => (typeof id === 'object')? String(id) : id)
            log('[SmartContract] computed token ids', arrayOfTokens);

            //  save token ids in separate var
            const arrayOfTokensIds = [...arrayOfTokens]

            //  get each token URI
            arrayOfTokens = await Promise.all(arrayOfTokens.map(id => Contract.tokenURI(id)))
            log('[SmartContract] token URI`s', arrayOfTokens);

            const arrayOfTokensURI = arrayOfTokens;

            arrayOfTokens = await Promise.all(arrayOfTokens.map(uri => DecentralizedStorage.readData(uri)))
            log('[SmartContract] plain tokens meta data', arrayOfTokens);

            //  approach each token object to app format
            arrayOfTokens = arrayOfTokens.map((tokenObject, index) => {
                return Formatters.tokenFormat({
                    id: arrayOfTokensIds[index],
                    contractAddress: this._address,
                    address: arrayOfTokensIds[index],
                    uri: arrayOfTokensURI[index],
                    ...tokenObject
                })
            })
            log('[SmartContract] computed tokens meta data', arrayOfTokens);

            this.metaData.tokens = arrayOfTokens
        }
        catch (e) {
            console.log(`fetchTokensForUser ${this._address} error`, e)
            log('[SmartContract] Error in fetchTokensForUser', e, Contract);
        }

        return this.metaData.tokens
    }

    async getTokenById(tokenID){
        const Contract = await this._getInstance()

        const tokenURI = await Contract.tokenURI(tokenID)
        const tokenObject = await DecentralizedStorage.readData(tokenURI)

        return Formatters.tokenFormat({
            id: tokenID,
            contractAddress: this._address,
            uri: tokenURI,
            ...tokenObject
        })
    }

    async getWrappedTokenList(tokenID){
        const Contract = await this._getInstance()
        const tokensInside = await Contract.bundeledTokensOf(tokenID)
        return tokensInside.map(token => ({
            contractAddress: token.token,
            tokenID: token.tokenId.toString(),
            role: token.role
        }))
    }

    async unwrapToken(tokenID){
        const Contract = await this._getInstance()
        try{
            const transactionResult = await Contract.unbundle(tokenID)
            const result = await transactionResult.wait()
            if(result.status !== 1) throw Error()
            return result
        }
        catch (e){
            log('unwrapToken error', e);
            if(e.code === 4001) throw Error(ErrorList.USER_REJECTED_TRANSACTION)
            throw Error(ErrorList.TRN_COMPLETE)
        }
    }

    async sendToken(tokenID, fromAddress, toAddress){
        try{
            const Contract = await this._getInstance()
            const transactionResult = await Contract['safeTransferFrom(address,address,uint256)'](fromAddress, toAddress, tokenID)
            return await transactionResult.wait()
        }
        catch (e){
            log('mint error', e);
            if(e.code === 4001) throw Error(ErrorList.USER_REJECTED_TRANSACTION)
            throw Error(ErrorList.TRN_COMPLETE)
        }
    }

    async approveTokenList(tokenList, setProcessStatus = null){
        for await (const identityForApplying of tokenList){
            if(typeof setProcessStatus === 'function') setProcessStatus(ActionTypes.approving_token, identityForApplying.tokenId)
            const contract = new this.constructor({
                address: identityForApplying.token
            })
            await contract.approve(this._address, identityForApplying.tokenId)
        }
        return true
    }

    /*
    * @param tokensForBundle: Array<{token: contractAddress, tokenId}>
    * @param bundleDataCID: String from object {...meta, ...tokensInBundleDetails, image: bundleImage}, (bundleImage like: https://ipfs.io/Qm...)
    * */
    async makeBundle(tokensForBundle, bundleDataCID, setProcessStatus){
        const Contract = await this._getInstance()

        //  approve all tokens
        await this.approveTokenList(tokensForBundle, setProcessStatus)

        setProcessStatus(ActionTypes.minting_bundle)

        try{
            const transactionResult = await Contract.bundleWithTokenURI(tokensForBundle, bundleDataCID)
            return await transactionResult.wait()
        }
        catch (e){
            console.log(e);
            log('mint error', e);
            if(e.code === 4001) throw Error(ErrorList.USER_REJECTED_TRANSACTION)
            throw Error(ErrorList.TRN_COMPLETE)
        }
    }

    async mint(userIdentity, metaCID){
        const Contract = await this._getInstance()
        const {gasLimit} = Networks.getData(ConnectionStore.getNetwork().name)
        try{
            const transactionResult = await Contract.mintItem(userIdentity, metaCID, {gasLimit})
            log(transactionResult)
            return await transactionResult.wait()
        }
        catch (e){
            console.log('mint error', e);
            if(e.code === 4001) throw Error(ErrorList.USER_REJECTED_TRANSACTION)
            throw Error(ErrorList.TRN_COMPLETE)
        }
    }

    async addToBundle(addToTokenID, tokenList){
        const tokenURI = await this.getTokenURI(addToTokenID)
        return await this.callMethod('addNFTsToBundle', addToTokenID, tokenList, tokenURI)
    }

    async removeFromBundle(fromTokenID, tokenList){
        const tokenURI = await this.getTokenURI(fromTokenID)
        return await this.callMethod('removeNFTsFromBundle', fromTokenID, tokenList, tokenURI)
    }

    async getTokenURI(tokenID){
        const Contract = await this._getInstance()
        return await Contract.tokenURI(tokenID)
    }

    async callWithoutSign(method, ...args){
        const Contract = await this._getInstance()
        try{
            return await Contract[method](...args)
        }
        catch (e){
            log(`callWithoutSign ${method} error`, e);
            throw Error(ErrorList.TRN_COMPLETE)
        }
    }

    /*
    * General definition of interact with contract methods
    * */
    async callMethod(method, ...args){
        log(`callMethod ${method}`, args);
        const Contract = await this._getInstance()
        try{
            const transactionResult = await Contract[method](...args)
            return await transactionResult.wait()
        }
        catch (e){
            log(`callMethod ${method} error`, e);
            if(e.code === 4001) throw Error(ErrorList.USER_REJECTED_TRANSACTION)
            else if(e.message.includes('E03')) throw Error(ErrorList.HAVE_SPECIAL_ROLE)
            throw Error(ErrorList.TRN_COMPLETE)
        }
    }

    async approve(forAddress, tokenID){
        const Contract = await this._getInstance()
        const approvedFor = await this.getApproved(tokenID)
        if(approvedFor && stringCompare(approvedFor, forAddress)) return
        try{
            const tx = await Contract.approve(forAddress, tokenID)
            return await tx.wait()
        }
        catch (e){
            log('mint error', e);
            if(e.code === 4001) throw Error(ErrorList.USER_REJECTED_TRANSACTION)
            throw Error(ErrorList.TRN_COMPLETE)
        }
    }

    async getApproved(tokenID){
        const Contract = await this._getInstance()
        return await Contract.getApproved(tokenID)
    }

    async getWhiteList(){
        const Contract = await this._getInstance()
        const list = await Contract.getEffectInfos() || []
        return list.map(item => ({
            contractAddress: item.modificatorsContract,
            serverUrl: item.serverUrl,
            owner: item.owner,
            onlyFor: Number(item.originalContract) && item.originalContract || null
        }))
    }

    async _getInstance(){
        if(!this._instance){

            const type = String(this._type).toLowerCase()
            const config = (type in TokensABI)? TokensABI[type] : TokensABI.default
            const ABI = config.ABI

            this._instance = new Contract(this._address, ABI, this._getProvider())
        }
        return this._instance
    }

    _getProvider(){
        if(!this._provider) this._provider = ConnectionStore.getProvider();
        return this._provider
    }

}

export default SmartContract