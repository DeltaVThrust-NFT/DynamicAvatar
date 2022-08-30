import {defineStore} from "pinia";
import {CollectionType} from "@/utils/collection";
import {catToFixed, stringCompare} from "@/utils/string";
import ModalController from "@/components/helpers/ModalController";
import {Networks} from "@/crypto/helpers";
import {log} from "@/utils/AppLogger";
import {Traits} from "@/crypto/helpers/Token";

export const useStore = defineStore('main', {
    state: () => ({
        isAppReady: false,
        collections: [],
        isCollectionsLoading: false,
        searchInput: '',
        preview: {
            isOpen: false,
            uniqueKey: '',
            token: null,
            contract: null,
            modifiers: []
        },
        isWalletConnectModalOpen: false,
        walletConnectCode: '',
        walletConnectCloseHandler: null,

        isBundleMode: false,
        selectedForBundle: {
            tokens: [],
            identities: [],
            loading: false
        },

        networks: [
            {id: 1, name: 'Ethereum', key: 'ether', color: '#627EEA', available: true}
        ],
        wallets: [
            {id: 1, name: 'MetaMask', key: 'Metamask', color: '#FFFFFF', available: true},
            {id: 3, name: 'WalletConnect', key: 'walletconnect', color: '#D9ECFF', available: true},
            {id: 2, name: '1inch', key: '1inch', color: '#0E131D', available: true},
        ],

        connection: {
            userIdentity: null,
            userNetworkName: null,
            userNetworkSupported: false
        },

        explorers: {
            transaction: '',
            account: '',
            block: ''
        },
        shopURL: '',

        processStatus: {
            code: '',
            addition: []
        },

        buyTokens: {
            [CollectionType.BUNDLE]: [
                /*{
                    "image":"https://ipfs.io/ipfs/bafybeicakwvqjaaodbeemresxcctnexfqgwj5ygty2qcn6ewg3iu4z7nj4/file",
                    "name":"Blue Fish",
                    "link":"https://pixabay.com/ru/",
                    "description":"This is blue fish",
                    "attributes": [
                        {
                            trait_type: 'age',
                            value: Traits.age.baby
                        },
                        {
                            trait_type: 'mood',
                            value: Traits.mood.general
                        }
                    ],
                    id: '123432',
                    contractAddress: 'gdfjhgjhkljgkfj',
                    identity: `123432:gdfjhgjhkljgkfj`,
                    fieldsForView: [
                        {key: 'name', value: 'Blue Fish'}
                    ],
                    inner: [],
                    innerLoading: false
                },*/
                {
                    isForBuy: true,
                    image: '/img/characters/baby-general.png',
                    name: 'Baby',
                    description: 'Baby general',
                    link: null,
                    attributes: [
                        {
                            trait_type: 'age',
                            value: Traits.age.baby
                        },
                        {
                            trait_type: 'mood',
                            value: Traits.mood.general
                        }
                    ],
                },
                {
                    isForBuy: true,
                    image: '/img/characters/child-general.png',
                    name: 'Child',
                    description: 'Child general',
                    link: null,
                    attributes: [
                        {
                            trait_type: 'age',
                            value: Traits.age.child
                        },
                        {
                            trait_type: 'mood',
                            value: Traits.mood.general
                        }
                    ],
                },
                {
                    isForBuy: true,
                    image: '/img/characters/teen-general.png',
                    name: 'Teen',
                    description: 'Teen general',
                    link: null,
                    attributes: [
                        {
                            trait_type: 'age',
                            value: Traits.age.teen
                        },
                        {
                            trait_type: 'mood',
                            value: Traits.mood.general
                        }
                    ],
                },

                /*{
                    isForBuy: true,
                    image: '/img/test-tokens/mountains_2.jpeg',
                    name: 'Mountains 2',
                    cid: 'bafybeie4cexpij2k6px4cprqektt6alkdvv2p7w4ujdnocmxs67dv75rpe/file'
                },
                {
                    isForBuy: true,
                    image: '/img/test-tokens/mountains_3.jpeg',
                    name: 'Mountains 3',
                    cid: 'bafybeigdiwy2iay2nnmxemzdfnvbbedmiwzg5pppnl2jcptbv4c3c4yxbe/file'
                }*/
            ],
            [CollectionType.EFFECT]: [
                {
                    isForBuy: true,
                    image: '/img/test-tokens/mountains_1.jpeg',
                    name: 'Mountains 1',
                    cid: 'bafybeihoistczqwg3xyzebwjp2vtjtem3qryuukr5skwng2fcrhumvkdea/file'
                },
                {
                    isForBuy: true,
                    image: '/img/test-tokens/mountains_2.jpeg',
                    name: 'Mountains 2',
                    cid: 'bafybeie4cexpij2k6px4cprqektt6alkdvv2p7w4ujdnocmxs67dv75rpe/file'
                },
                {
                    isForBuy: true,
                    image: '/img/test-tokens/mountains_3.jpeg',
                    name: 'Mountains 3',
                    cid: 'bafybeigdiwy2iay2nnmxemzdfnvbbedmiwzg5pppnl2jcptbv4c3c4yxbe/file'
                }
            ],
            [CollectionType.NONE]: [
                {
                    isForBuy: true,
                    image: '/img/test-tokens/mountains_1.jpeg',
                    name: 'Mountains 1',
                    cid: 'bafybeihoistczqwg3xyzebwjp2vtjtem3qryuukr5skwng2fcrhumvkdea/file'
                },
                {
                    isForBuy: true,
                    image: '/img/test-tokens/mountains_2.jpeg',
                    name: 'Mountains 2',
                    cid: 'bafybeie4cexpij2k6px4cprqektt6alkdvv2p7w4ujdnocmxs67dv75rpe/file'
                },
                {
                    isForBuy: true,
                    image: '/img/test-tokens/mountains_3.jpeg',
                    name: 'Mountains 3',
                    cid: 'bafybeigdiwy2iay2nnmxemzdfnvbbedmiwzg5pppnl2jcptbv4c3c4yxbe/file'
                }
            ]
        },

        apply: {
            origin: {
                token: null,
                identity: null
            },
            style: {
                token: null,
                identity: null
            }
        }
    }),
    getters: {
        getFilteredCollections: state => type => state.collections.filter(collection => collection.type === type),
        userIdentityShort: state => catToFixed(state.connection.userIdentity || ''),
        getExplorerLink: state => (type, hash = '') => state.explorers[type]? state.explorers[type] + hash : state.explorers.transaction + hash,
        findContractObject: state => contractAddress => state.collections.find(collection => stringCompare(collection.address, contractAddress)),
        getShopTokens: state => (type, contractAddress) => {
            return (state.buyTokens[type]? [...state.buyTokens[type]] : []).map(token => {
                token.contractAddress = contractAddress
                return token
            })
        },
        getSearchCollectionsAndTokens: state => {
            return state.collections
        }
    },
    actions: {
        updateTokenImageAndAttributes(token, newAttributed){
            // console.log(token);
            const collection = this.collections.find(contract => stringCompare(contract.address, token.contractAddress))
            const tokenInCollection = collection.tokens.find(t => stringCompare(t.id, token.id))

            // console.log(this.preview.token);

            const currentImage = new URL(this.preview.token.image)
            currentImage.hash = `#${Date.now()}`

            this.preview.token.image = currentImage.toString()
            this.preview.token.attributes = newAttributed

            tokenInCollection.image = currentImage.toString()
            tokenInCollection.attributes = newAttributed
        },
        toggleTokenForBundle(token){
            if(this.selectedForBundle.identities.includes(token.identity)) this.selectedForBundle.identities = this.selectedForBundle.identities.filter(t => !stringCompare(t, token.identity))
            else this.selectedForBundle.identities.push(token.identity)
        },
        updateContractTokens(contractAddress, tokens){
            const isExist = this.findContractObject(contractAddress)
            if(isExist) isExist.tokens = tokens
        },
        changeContractUpdating(contractAddress, value){
            const isExist = this.findContractObject(contractAddress)
            if(isExist) isExist.isUpdating = value
        },
        changeCollectionLoadingState(value){
            this.isCollectionsLoading = value
        },
        setCollections(collections){
            this.collections = collections
            log('setCollections', collections)
        },
        setProcessStatus(statusCode = '', ...additionParams){
            this.processStatus.code = statusCode
            this.processStatus.addition.splice(0, this.processStatus.addition.length, ...additionParams)
        },
        openWalletConnectQR(copyCode, closeHandler){
            this.walletConnectCode = copyCode
            this.walletConnectCloseHandler = closeHandler
            this.isWalletConnectModalOpen = true
        },
        closeWalletConnectQR({isAutomatic = false} = {}){
            if(!isAutomatic && this.walletConnectCloseHandler) this.walletConnectCloseHandler()
            this.isWalletConnectModalOpen = false
            this.walletConnectCloseHandler = null
        },
        setAppReady(){
            this.isAppReady = true
        },
        setUserIdentity(value = null){
            this.connection.userIdentity = value
        },
        setUserNetworkName(value = null){
            this.connection.userNetworkName = value
            if(value){
                const {
                    transactionExplorer,
                    accountExplorer,
                    blockExplorer
                } = Networks.getData(value)
                this.explorers.transaction = transactionExplorer
                this.explorers.account = accountExplorer
                this.explorers.block = blockExplorer
                const {store} = Networks.getSettings(value)
                this.shopURL = store
            }
        },
        openPreview(token) {
            const contract = this.findContractObject(token.contractAddress)
            if(contract){
                const modifiers = CollectionType.canApplyEffect(contract.type)? this.getFilteredCollections(CollectionType.EFFECT) : []

                this.preview.token = token
                this.preview.contract = contract
                this.preview.modifiers = modifiers
                this.preview.isOpen = true

                ModalController.open(this.preview.uniqueKey = Symbol('preview'))
            }
        },
        setTokenInside(contractAddress, tokenID, insideTokenList){
            const contract = this.findContractObject(contractAddress)
            if(contract){
                const token = contract.tokens.find(t => t.id === tokenID)
                if(token) token.inner = insideTokenList
                if(this.preview.token && this.preview.token.identity === `${contractAddress}:${tokenID}`){
                    this.preview.token.inner = insideTokenList
                }
            }
        },
        changeLoadingInnerTokens(contractAddress, tokenID, newState){
            const contract = this.findContractObject(contractAddress)
            if(contract){
                const token = contract.tokens.find(t => t.id === tokenID)
                if(token) token.innerLoading = newState
            }
        },
        closePreview(){
            this.preview.isOpen = false
            setTimeout(() => {
                this.preview.token = this.preview.contract = null
                this.preview.modifiers = []
                ModalController.close(this.preview.uniqueKey)
            }, 300)
        },
        saveApplyEffect(originToken, styleToken){
            const config = {
                origin: originToken.identity,
                style: styleToken.identity
            }
            window.localStorage.setItem('apply-effect-config', JSON.stringify(config))
            this.apply.origin.token = originToken
            this.apply.origin.identity = originToken.identity
            this.apply.style.token = styleToken
            this.apply.style.identity = styleToken.identity
        },
        saveMakeBundle(){
            const config = this.selectedForBundle.identities
            window.localStorage.setItem('make-bundle-config', JSON.stringify(config))
        },
        restoreSavedTokensForBundle(){
            try{
                const config = JSON.parse(window.localStorage.getItem('make-bundle-config') || '[]')
                if(config && config.length){
                    this.selectedForBundle.identities = config
                    return config
                }
            }
            catch (e) {
                log('restoreApplyIdentities error', e)
            }
            return false
        },
        changeLoadingTokensForBundleState(newState){
            this.selectedForBundle.loading = newState
        },
        saveTokensForBundle(tokens){
            this.selectedForBundle.tokens = tokens
        },
        cleanSavedTokensForBundle(){
            window.localStorage.removeItem('make-bundle-config')
            this.selectedForBundle.tokens = []
            this.selectedForBundle.identities = []
        },
        restoreApplyIdentities(){
            try{
                const config = JSON.parse(window.localStorage.getItem('apply-effect-config') || '{}')
                if(config && config.origin && config.style){
                    this.apply.origin.identity = config.origin
                    this.apply.style.identity = config.style
                    return true
                }
            }
            catch (e) {
                log('restoreApplyIdentities error', e)
            }
            return false
        },
        saveRestoredTokensForApply(origin, style){
            this.apply.origin.token = origin
            this.apply.style.token = style
        },
        cleanSavedTokensForApply(){
            window.localStorage.removeItem('apply-effect-config')
            this.apply.origin.token = null
            this.apply.style.token = null
        }
    }
})