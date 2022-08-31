import {useStore} from "@/store/main";

/*
* Bridge to vue store pinia
* */

export default {
    _store: null,

    getStore(){
        if(!this._store) this._store = useStore();
        return this._store
    },
}