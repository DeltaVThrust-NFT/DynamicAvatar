const networks = {
    sepolia: {
        meta: {
            title: 'Sepolia',
            image: 'ether',
            chainId: 11155111,
            transactionExplorer: "https://sepolia.etherscan.io/tx/",
            accountExplorer: "https://sepolia.etherscan.io/address/",
            marketplaceExplorer: (contractAddress, tokenID) => `https://testnets.opensea.io/assets/mumbai/${contractAddress}/${tokenID}`,
            gasLimit: 400000
        },
        contracts: {
            // whiteListContract: '0x559acfdb7a30fb6ecf5883c1f25b9eb2a34cf37a',
            adminAddress: '0xD25A41039DEfD7c7F0fBF6Db3D1Df60b232c6067',
            bundleContract: '0xca9ce00d3d8a4305e9e5e75de7ebf5d70dbeafed',
            effectsContract: '0x42f37b32036899e54b6d2ad37ccbeba199631943',
        }
    },
    maticmum: {
        meta: {
            title: 'Mumbai testnet',
            image: 'polygon',
            chainId: 80001,
            transactionExplorer: "https://mumbai.polygonscan.com/tx/",
            accountExplorer: "https://mumbai.polygonscan.com/address/",
            marketplaceExplorer: (contractAddress, tokenID) => `https://testnets.opensea.io/assets/mumbai/${contractAddress}/${tokenID}`,
            gasLimit: 400000
        },
        contracts: {
            // whiteListContract: '0x6fc2aa966015164624c888d9f7ec407c59353ca7',
            adminAddress: '0xD25A41039DEfD7c7F0fBF6Db3D1Df60b232c6067',
            bundleContract: '0xea60808018daf160529d46943782d95665105e7b',
            effectsContract: '0x01f310dd597e61b24e91e48fa5284e8c65379a41',
        }
    }
}
Object.freeze(networks)

export function getAvailableNetworks() {
    return Object.entries(networks)
        .filter(([name, {meta, contracts}]) => {
            return !!+process.env[`VUE_APP_NETWORK_${name.toUpperCase()}_SUPPORT`] &&
                meta.title &&
                (meta.chainId || meta.image === 'near') &&
                contracts.bundleContract &&
                contracts.effectsContract
        })
        .map(([name, {meta: {title, image, chainId}}], index) => ({
            id: chainId,
            name: title,
            key: image,
            available: true
        }))
}

export function getNameByChainID(chainID){
    const [name] = Object.entries(networks).find(([, data]) => data.meta.chainId === chainID) || ['unknown']
    let isSupport = (name !== 'unknown')? !!+process.env[`VUE_APP_NETWORK_${name.toUpperCase()}_SUPPORT`] : false
    return isSupport? name : 'unknown'
}

export function getData(networkName){
    return networks[networkName.toLowerCase()]?.meta || null
}

export function getSettings(networkName){
    return networks[networkName.toLowerCase()]?.contracts || null
}