const history = []

export function log(){
    history.push({
        time: String(new Date),
        arguments
    })
    if(process.env.NODE_ENV === 'development' || localStorage.getItem('devMode')){
        console.log(...arguments);
    }
}