export function stringCompare(str1 = '', str2 = '') {
    if(!str1) str1 = ''
    if(!str2) str2 = ''
    return !str1.localeCompare(str2, undefined, {sensitivity:'accent'})
}

export function getMarkedText(valueOrigin, query) {
    let value = valueOrigin.toLowerCase()

    let count = 0;
    let diff = [];

    let findIndex = 0
    do{
        if(count > 20) break
        count++

        let searchFrom = findIndex
        let findOn = value.indexOf(query, searchFrom)

        if(~findOn) {
            diff.push(valueOrigin.slice(searchFrom, findOn))
            diff.push(valueOrigin.substr(findOn, query.length))
            findIndex = findOn + query.length
        }
        else {
            diff.push(valueOrigin.slice(searchFrom))
            break
        }
    }
    while (true);
    diff = diff.filter(w => w.length).map(text => ({marked: text.toLowerCase() === query, text}))

    return diff
}

export function catToFixed(str = ''){
    if((typeof str).toLowerCase() !== 'string') return ''
    const maxLength = 10
    if(str.length <= maxLength) return str;
    return `${str.slice(0, 6)}...${str.slice(-4)}`
}

export function shortCat(str = '', maxLength = 30){
    if((typeof str).toLowerCase() !== 'string') return ''
    if(str.length <= maxLength) return str;
    return `${str.slice(0, maxLength)}...`
}