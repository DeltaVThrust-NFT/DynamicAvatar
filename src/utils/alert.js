import {reactive} from "vue";

const alert = reactive({
    active: false,
    title: 'Alert!',
    message: '',
    open(message = '', title = 'Alert!'){
        this.title = title
        this.message = message
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

export default alert