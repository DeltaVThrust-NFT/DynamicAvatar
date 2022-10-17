import ProviderStorage from "@/crypto/EVM/rarible/ProviderStorage";
import ConnectionSteps from "@/crypto/EVM/rarible/ConnectionSteps";

import {Connector, InjectedWeb3ConnectionProvider} from "@rarible/connector";
import {WalletConnectConnectionProvider} from "@rarible/connector-walletconnect";
import {mapEthereumWallet} from "@rarible/connector-helper";
import {stringCompare} from "@/utils/string";
import router from "@/router";
import {Etherium} from "@/crypto/helpers";
import {Networks, ConnectionStore, ErrorList} from '@/crypto/helpers'
import {AppStorage} from '@/crypto/helpers'
import alert from "@/utils/alert";

export default {
    controllerClass: null,

    // connector instance from Rarible
    _RaribleConnector: null,
    _connectingOptions: [],
    _connectToNetworkId: null,

    // to disconnect when user connect to unsupported network
    _disconnectMethod: null,

    _waitingForUserConnected: [],

    _status: '',

    // for use inside this class only
    _connectedOptions: {
        blockchain: null,
        chainId: null,
        address: null,
        provider: null,
        wallet: null
    },

    setStatus(value){
        this._status = value
    },
    getStatus(){
        return this._status
    },

    makeConnectedCallbackFunction(){
        const add = {};
        const promise = new Promise((resolve, reject) => {
            add.resolve = resolve
            add.reject = reject
        })
        this._waitingForUserConnected.push(add)
        return promise
    },
    getConnectedCallbackFunction(){
        return this._waitingForUserConnected
    },
    clearConnectedCallbackFunctions(){
        this._waitingForUserConnected = []
    },

    async disconnect(){
        localStorage.removeItem('walletconnect')
        location.reload()
    },

    async init(controllerClass = null){
        if(this._RaribleConnector) return true

        if(controllerClass) this.controllerClass = controllerClass

        const injected = mapEthereumWallet(new InjectedWeb3ConnectionProvider())
        const walletConnect = mapEthereumWallet(new WalletConnectConnectionProvider({
            rpc: {
                1: 'https://mainnet.infura.io/v3/6c3a9507f03a49589e3cb762331f2026',
                3: 'https://ropsten.infura.io/v3/6c3a9507f03a49589e3cb762331f2026',
                4: 'https://rinkeby.infura.io/v3/6c3a9507f03a49589e3cb762331f2026',
                80001: 'https://rpc-mumbai.matic.today',
                1666700000: 'https://api.s0.b.hmny.io',
                77: 'https://sokol.poa.network',
            },
            qrcodeModal: {
                open: (uri, closeTrigger) => {

                    const closeWrapper = () => {
                        const status = this.getStatus()
                        // user was connected, then lost session (in walletConnect), and cancel to reconnect
                        if(status === 'connected'){
                            if(this._disconnectMethod) this._disconnectMethod()
                            location.reload()
                        }
                        closeTrigger()
                    }

                    const store = AppStorage.getStore()
                    store.openWalletConnectQR(uri, closeWrapper)
                },
                close: () => {
                    const store = AppStorage.getStore()
                    store.closeWalletConnectQR({isAutomatic: true})
                }
            }
        }))

        this._RaribleConnector = Connector.create(injected, ProviderStorage).add(walletConnect)

        this._connectingOptions = await this._RaribleConnector.getOptions()

        this._RaribleConnector.connection.subscribe(async (con) => {
            this.setStatus(con.status)

            if(con.status === ConnectionSteps.connected && con.connection){
                const connection = con.connection
                this._disconnectMethod = con.disconnect || null

                // skip repeated callback (when using walletConnect)
                if(
                    this._connectedOptions.blockchain === connection.blockchain &&
                    stringCompare(this._connectedOptions.address, connection.address) &&
                    this._connectedOptions.chainId === await connection.wallet.ethereum.getChainId()
                ) {
                    return
                }

                let provider = connection.wallet.ethereum.config.web3.currentProvider
                if(!('request' in provider)) provider = connection.wallet.ethereum.config.web3.givenProvider

                try{
                    const isSwitched = await this.switchNetwork(provider, this._connectToNetworkId)
                    // return because after network switched lib fired new connection event
                    if(isSwitched) {
                        window.location.reload()
                        return
                    }
                }
                catch (e) {
                    console.log('try to switch error', e);
                    const viewErrors = [ErrorList.NETWORK_IN_NOT_INSTALLED, ErrorList.CHANGE_NETWORK_REJECTED, ErrorList.SWITCH_NETWORK_ERROR]
                    const errorType = viewErrors.includes(e.message)? e.message : 'Error to connecting'
                    alert.open(errorType)
                    this.getConnectedCallbackFunction().forEach(promise => promise.reject())
                    this.clearConnectedCallbackFunctions()
                    if(this._disconnectMethod) this._disconnectMethod()
                    return
                }

                this._connectedOptions.blockchain = connection.blockchain
                this._connectedOptions.chainId = await connection.wallet.ethereum.getChainId()
                this._connectedOptions.address = connection.address
                this._connectedOptions.provider = provider
                this._connectedOptions.wallet = connection.wallet

                const updateUserTokensAction = () => {
                    router.push({name: 'Gallery'})
                }

                let connectedNetworkName = Networks.getNameByChainID(this._connectedOptions.chainId)

                if(connectedNetworkName !== 'unknown'){
                    const needToUpdateUserTokens = !!ConnectionStore.getProvider()

                    ConnectionStore.setConnection({
                        network: {
                            name: connectedNetworkName,
                            id: this._connectedOptions.chainId
                        },
                        userIdentity: this._connectedOptions.address,
                        disconnectMethod: this._disconnectMethod,
                        provider: Etherium.getProvider(this._connectedOptions.provider),
                        providerType: 'Web3Provider',
                        blockchain: this._connectedOptions.blockchain,
                        wallet: this._connectedOptions.wallet
                    })

                    this.getConnectedCallbackFunction().forEach(promise => promise.resolve(this._connectedOptions.address))
                    this.clearConnectedCallbackFunctions()

                    // update only if user change network
                    if(needToUpdateUserTokens) updateUserTokensAction()

                    // update tokens after connected
                    // fetchCollectionsWithTokens
                    if(this.controllerClass) this.controllerClass.fetchCollectionsWithTokens()
                }
                else {
                    // if connecting to unsupported networks not allowed
                    this.getConnectedCallbackFunction().forEach(promise => promise.reject())
                    this.clearConnectedCallbackFunctions()
                    this.controllerClass.tryToConnectToUnsupportedNetwork()
                    if(this._disconnectMethod) this._disconnectMethod()
                }
            }
            else if(con.status === ConnectionSteps.disconnected) {
                const reloadPage = !!ConnectionStore.getProvider()

                // clear connection data
                ConnectionStore.clearConnection()
                this._connectedOptions.blockchain =
                this._connectedOptions.chainId =
                this._connectedOptions.address =
                this._connectedOptions.provider =
                this._connectedOptions.wallet = null

                this.getConnectedCallbackFunction().forEach(promise => promise.reject())
                this.clearConnectedCallbackFunctions()

                if(reloadPage) location.reload()
            }
        })

        return await this.makeConnectedCallbackFunction()
    },

    clearConnectedSettings(){
        this._connectToNetworkId = null
    },

    async switchNetwork(provider, chainId = null){
        // chainId is null when user already connected, and reload page
        if(!chainId) return;

        const chainHEX = `0x${chainId.toString(16)}`

        // if chain is the same dont return true (because we didn`t switch network)
        if(Number(provider.chainId) === chainId) {
            this.clearConnectedSettings()
            return
        }

        try {
            await provider.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: chainHEX }],
            });

            this.clearConnectedSettings()
            return true
        }
        catch (error) {
            console.log('Switch error', error);
            // @todo mobile metamask return error with no reason, so skip this error
            if(provider.walletMeta.name === 'MetaMask'){
                if(error.message === 'JSON RPC response format is invalid'){
                    this.clearConnectedSettings()
                    return true
                }
                else if(error.message.includes('Unrecognized chain ID')){
                    throw Error(ErrorList.NETWORK_IN_NOT_INSTALLED)
                }
            }
            else{
                if(error.code === 4902) throw Error(ErrorList.NETWORK_IN_NOT_INSTALLED)
                else if(error.code === 4001) throw Error(ErrorList.CHANGE_NETWORK_REJECTED)
                throw Error(ErrorList.SWITCH_NETWORK_ERROR)
            }
        }
    },

    async connectToWallet(walletName, networkID){
        if(!this._RaribleConnector) throw new Error(ErrorList.CONNECTOR_NOT_INIT)

        if(this.getStatus() === ConnectionSteps.connected) return this.getStatus()

        const provider = this._connectingOptions.find(option => option.option === walletName)
        if(!provider) throw new Error(ErrorList.PROVIDER_NOT_FOUND)

        this._connectToNetworkId = networkID
        await this._RaribleConnector.connect(provider)
        return await this.makeConnectedCallbackFunction()
    },

    async isUserConnected(){
        const status = this.getStatus()
        if(status === ConnectionSteps.connected) return ConnectionStore.getUserIdentity()
        else if(status === ConnectionSteps.initializing || status === ConnectionSteps.connecting) return await this.makeConnectedCallbackFunction()
        else throw new Error(ErrorList.USER_NOT_CONNECTED)
    }
}