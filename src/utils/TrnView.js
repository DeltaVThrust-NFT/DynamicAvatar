import {reactive} from "vue";

const TrnView = reactive({
    active: false,
    title: '',
    hash: null,
    open({hash = '', title = 'Transaction completed'}){
        this.title = title
        this.hash = hash
        this.active = true
        return this
    },
    close(){
        this.active = false
        if(typeof this.closeTrigger === 'function') {
            this.closeTrigger()
            this.closeTrigger = null
        }
    },
    closeTrigger: null,
    onClose(trigger){
        this.closeTrigger = trigger
    }
})

export default TrnView