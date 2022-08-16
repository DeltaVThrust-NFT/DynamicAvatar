const networks = {
    rinkeby: {
        name: "rinkeby",
        chainId: 4,
        transactionExplorer: "https://rinkeby.etherscan.io/tx/",
        accountExplorer: "https://rinkeby.etherscan.io/address/",
        blockExplorer: "https://rinkeby.etherscan.io/tx/",
        marketplaceExplorer: (contractAddress, tokenID) => `https://testnets.opensea.io/assets/rinkeby/${contractAddress}/${tokenID}`,
        gasLimit: 400000
    },
    maticmum: {
        name: "maticmum",
        chainId: 80001,
        transactionExplorer: "https://mumbai.polygonscan.com/tx/",
        accountExplorer: "https://mumbai.polygonscan.com/address/",
        marketplaceExplorer: (contractAddress, tokenID) => `https://testnets.opensea.io/assets/mumbai/${contractAddress}/${tokenID}`,
        gasLimit: 400000
    },
    harmony_testnet: {
        name: "harmony_testnet",
        chainId: 1666700000,
        transactionExplorer: "https://explorer.pops.one/tx/",
        accountExplorer: "https://explorer.pops.one/address/",
        // @todo find right explorer
        marketplaceExplorer: (contractAddress, tokenID) => ``,
        gasLimit: 400000,
        gasPrice: 100000000000
    }
}

const settings = {
    rinkeby: {
        // bundleContract: '0x39ab7ebdc55692bf30287c795f18c165e5e7c509',
        // bundleContract: '0x32907A53864FFC9E1ff28D686f5442f47d4a1D45',
        // bundleContract: '0xd3717A952056fc919696B0d97358Ae67Dd6c74Eb',
        // bundleContract: '0x5494DD787186a6FBC611AcFaC1544CBBc8DF0154',

        // effectsContract: '0x3c4269CC3c86a558cA5162D8E682543e040F71de',
        // testContract: '0xdDBcD1FFC7EaaE3f8d589d028716a72531954F9f',

        // plain bundle without add/remove from it
        // bundleContract: '0xdb538623154643E44CA32B99E91AAd96f53dc8c5',
        // effectsContract: '0xde7173a35bf2479d5e8e455be4a33d206c95204e',

        // new from MVP (with add/remove)
        bundleContract: '0x153FF94EEC8ed695b985f7658a48B67D79c78Ca6',
        effectsContract: '0x3c4269CC3c86a558cA5162D8E682543e040F71de',
        whiteListContract: '0x8eb4064C391CBa932a1ebb6431260326C6485E36',

        testContract: '0x9b7f8bdb86696300b734944cefa35b42c5eb3aa1',
        store: 'https://rinkeby.rarible.com'
    },
    maticmum: {
        store: 'https://testnets.opensea.io',
        bundleContract: '0x4f660dC8Ec8B9092A2B892655325Fdf69042EEaC',
        effectsContract: '0x10223Fb767F93e7102308D753dCa71F0A432b290',
        whiteListContract: '0x00',
        testContract: '0x9b7f8bdb86696300b734944cefa35b42c5eb3aa1',
    },
    harmony_testnet: {
        bundleContract: '0xE13D87772b6D728D84c32D971A62D930A804e70F',
        effectsContract: '0x5533E63796a5ddFC28d996daF9E69A6B7Ed9878B',
        whiteListContract: '0x00',
        testContract: '0x369259905eE928ab1502DB060aBc5076480A86f5',
        store: '',
    }
}

export function getNameByChainID(chainID){
    const [name] = Object.entries(networks).find(([, data]) => data.chainId === chainID) || ['unknown']
    let isSupport = (name !== 'unknown')? !!+process.env[`VUE_APP_NETWORK_${name.toUpperCase()}_SUPPORT`] : false

    return isSupport? name : 'unknown'
}

export function getData(networkName){
    return networks[networkName.toLowerCase()] || null
}

export function getSettings(networkName){
    return settings[networkName.toLowerCase()] || null
}