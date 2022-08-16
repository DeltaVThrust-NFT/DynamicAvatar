import {reactive} from "vue";

const confirm = reactive({
    active: false,
    message: '',
    handlers: {
        accept: null,
        cancel: null
    },
    customActions: [],
    open(message = '', accept = null, cancel = null){
        this.message = message
        this.handlers.accept = accept
        this.handlers.cancel = cancel
        this.active = true
    },
    close(){
        this.active = false
        this.handlers.accept = null
        this.handlers.cancel = null
        this.customActions = []
    },
    accept(){
        if(this.handlers.accept) this.handlers.accept()
        this.close()
    },
    cancel(){
        if(this.handlers.cancel) this.handlers.cancel()
        this.close()
    },
    /*
    * @param actions[<confirmAction>], confirmAction:Object like {buttonName: '', onClick():void, autoClose: true}
    * */
    addActions(actions){
        this.customActions = actions
        return this
    },
    selectAction(actionObject){
        if(actionObject.autoClose) this.close()
        if(typeof actionObject.onClick === 'function') actionObject.onClick()
    }
})

export default confirm