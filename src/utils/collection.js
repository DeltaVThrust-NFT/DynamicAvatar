export const CollectionType = {
    EFFECT: 'effect',
    BUNDLE: 'bundle',
    NONE: 'none',
    WHITE_LIST: 'white_list',

    canApplyEffect(type){
        return [this.BUNDLE, this.NONE].includes(type)
    },
    isBundle(type){
        return this.BUNDLE === type
    },
    getCollectionName(type){
        return (type === this.EFFECT)? 'Effects' : (type === this.BUNDLE)? 'Bundles' : 'Other'
    }
}