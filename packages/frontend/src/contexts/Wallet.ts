import { createContext } from 'react'
import { makeAutoObservable } from 'mobx'

class Wallet {
    address = ''
    errorMsg = ''

    constructor() {
        makeAutoObservable(this)
    }

    async load() {
        try {
            const walletResponse = await this.connectWallet()
            this.address = walletResponse.address
            this.addWalletListener()
        } catch (e: any) {
            this.errorMsg = e.message
            window.alert(this.errorMsg)
        }
    }

    async connectWallet() {
        if ((window as any).ethereum) {
            try {
                const addressArray = await (window as any).ethereum.request({
                    method: 'eth_requestAccounts',
                })
                const obj = {
                    address: addressArray[0],
                }
                return obj
            } catch (err) {
                throw err
            }
        } else {
            throw new Error('please install a Metamask wallet in your browser.')
        }
    }

    addWalletListener() {
        if ((window as any).ethereum) {
            ;(window as any).ethereum.on(
                'accountsChanged',
                (accounts: string[]) => {
                    if (accounts.length > 0) {
                        this.address = accounts[0]
                        this.errorMsg = ''
                    } else {
                        this.address = ''
                    }
                }
            )
        } else {
            throw Error('please install a Metamask wallet in your browser.')
        }
    }

    // async signMessage(message) {
    //     try {
    //         const provider = new ethers.providers.Web3Provider(window.ethereum)
    //         const signer = provider.getSigner()
    //         const signatureHash = await signer.signMessage(message)
    //         return signatureHash
    //     } catch (err) {
    //         window.alert(err.message)
    //     }
    // }
}

export default createContext(new Wallet())
