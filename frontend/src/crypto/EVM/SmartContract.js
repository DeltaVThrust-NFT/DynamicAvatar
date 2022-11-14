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

            // const arrayOfTokensURI = arrayOfTokens;

            arrayOfTokens = (await Promise.allSettled(arrayOfTokens.map(uri => DecentralizedStorage.readData(uri)))).filter(f => f.status === 'fulfilled' && f.value).map(f => f.value)
            log('[SmartContract] plain tokens meta data', arrayOfTokens);

            //  approach each token object to app format
            arrayOfTokens = arrayOfTokens.map((tokenObject, index) => {
                return Formatters.tokenFormat({
                    id: arrayOfTokensIds[index],
                    contractAddress: this._address,
                    address: arrayOfTokensIds[index],
                    // uri: arrayOfTokensURI[index],
                    origin: tokenObject,
                    ...tokenObject
                })
            })
            log('[SmartContract] computed tokens meta data', arrayOfTokens);

            this.metaData.tokens = arrayOfTokens
        }
        catch (e) {
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
            origin: tokenObject,
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
            const trnParams = await this._trnBaseParams('unbundle')
            const transactionResult = await Contract.unbundle(tokenID, trnParams)
            const result = await transactionResult.wait()
            if(result.status !== 1) throw Error()
            return result
        }
        catch (e){
            log('unwrapToken error', e);
            if(e.code === 4001) throw Error(ErrorList.USER_REJECTED_TRANSACTION)
            else if(e.message.includes('insufficient funds')) throw Error(ErrorList.INSUFFICIENT_FUNDS)
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
            const trnParams = await this._trnBaseParams('bundleWithTokenURI')
            const transactionResult = await Contract.bundleWithTokenURI(tokensForBundle, bundleDataCID, trnParams)
            return await transactionResult.wait()
        }
        catch (e){
            log('mint error', e);
            if(e.code === 4001) throw Error(ErrorList.USER_REJECTED_TRANSACTION)
            throw Error(ErrorList.TRN_COMPLETE)
        }
    }

    async mint(userIdentity, metaCID){
        const Contract = await this._getInstance()
        try{
            const trnParams = await this._trnBaseParams('mintItem(address,string)')
            const transactionResult = await Contract['mintItem(address,string)'](userIdentity, metaCID, trnParams)
            return await transactionResult.wait()
        }
        catch (e){
            log('mint error', e);
            if(e.code === 4001) throw Error(ErrorList.USER_REJECTED_TRANSACTION)
            throw Error(ErrorList.TRN_COMPLETE)
        }
    }

    async checkPermissionToModifyBundle(tokenId) {
        const Contract = await this._getInstance()
        const isAllowed = await Contract.allowedToAddNFTs(tokenId)
        if(!isAllowed) throw Error(ErrorList.HAVE_NOT_PERMISSION)
        return true
    }

    async addToBundle(addToTokenID, tokenList){
        const tokenURI = await this.getTokenURI(addToTokenID)
        await this.checkPermissionToModifyBundle(addToTokenID)
        const trnParams = await this._trnBaseParams('addNFTsToBundle')
        return await this.callMethod('addNFTsToBundle', addToTokenID, tokenList, tokenURI, trnParams)
    }

    async removeFromBundle(fromTokenID, tokenList){
        const tokenURI = await this.getTokenURI(fromTokenID)
        await this.checkPermissionToModifyBundle(fromTokenID)
        const trnParams = await this._trnBaseParams('removeNFTsFromBundle')
        return await this.callMethod('removeNFTsFromBundle', fromTokenID, tokenList, tokenURI, trnParams)
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

    async setCorrectContractType(){
        await this._getInstance()
        return this._type
    }

    async _getInstance(){
        if(!this._instance){
            this._instance = await new Promise( async (resolve) => {
                let abi;
                if(this._type === 'bundle') abi = TokensABI.bundle.ABI
                else if(this._type === 'allowList') abi = TokensABI.whiteList.ABI
                else abi = TokensABI.default.ABI
                let contract = new Contract(this._address, abi, this._getProvider())

                try{
                    const isBundle = await contract.supportsInterface(process.env.VUE_APP_BUNDLE_INTERFACE_ID)
                    if (isBundle && this._type !== 'bundle') {
                        this._type = 'bundle'
                        contract = new Contract(this._address, TokensABI.bundle.ABI, this._getProvider())
                    }
                    else if (!isBundle && this._type !== 'allowList') {
                        this._type = 'common'
                        contract = new Contract(this._address, TokensABI.default.ABI, this._getProvider())
                    }
                }
                catch (e) {}
                resolve(contract)
            })
        }
        return this._instance
    }

    async _trnBaseParams(forMethod){
        if (this._type !== 'bundle') return {}
        const payMethods = {
            'mintItem(address,string)': 'MintFeeCoeff',
            'bundleWithTokenURI': 'CreateBundleFeeCoeff',
            'removeNFTsFromBundle': 'RemoveFromBundleFeeCoeff',
            'addNFTsToBundle': 'AddToBundleFeeCoeff',
            'unbundle': 'UnbundleFeeCoeff'
        }
        if(Object.keys(payMethods).includes(forMethod)){
            const Contract = await this._getInstance()

            // only if contract accept
            try{
                if(Contract.bundleBaseFee && Contract.MintFeeCoeff){
                    const baseFee = await Contract.bundleBaseFee()
                    const feeCoeff = await Contract[payMethods[forMethod]]()
                    const resultFee = +baseFee * +feeCoeff + ''
                    return {
                        value: resultFee
                    }
                }
            }
            catch (e) {
                log(`Contract ${this._address} dont support bundle interface`)
            }
        }
        return {}
    }

    _getProvider(){
        if(!this._provider) this._provider = ConnectionStore.getProvider();
        return this._provider
    }

}

export default SmartContract