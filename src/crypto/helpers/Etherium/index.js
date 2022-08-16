import {ethers} from "ethers";

/*
* @param provider - from connector.connection.subscribe
* */
export function getProvider(provider) {
    return new ethers.providers.Web3Provider(provider, "any")
}