import Rarible from "@/crypto/EVM/rarible";
import {ErrorList} from "@/crypto/helpers";
import {log} from "@/utils/AppLogger";

const AppConnector = {
    type: '',
    connector: null,

    getSavedConnectorName(){
        return localStorage.getItem('global-app-connector') || 'rarible'
    },
    setSavedConnectorName(name){
        localStorage.setItem('global-app-connector', name)
        return name
    },
    clearConnectorName(){
        localStorage.setItem('global-app-connector', '')
    },

    async init(withType = null){
        if(this.connector && !withType) return this

        const connectorType = withType? this.setSavedConnectorName(withType) : this.getSavedConnectorName()

        if(connectorType === 'rarible'){
            this.type = 'rarible'
            this.connector = new Rarible()
            await this.connector.init()
        }

        if(!this.connector) throw new Error(ErrorList.CONNECTOR_NAME_NOT_SPECIFIED)

        return this
    },

    async connect(wallet){
        try{
            await this.connector.isUserConnected()
            return true
        }
        catch (e){
            log(e)
            try{
                return await this.connector.connectToWallet(wallet)
            }
            catch (e) {
                log(e)
            }
        }
        return false
    }
}

export default AppConnector