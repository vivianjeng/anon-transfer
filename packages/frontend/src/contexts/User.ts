import { createContext } from 'react'
import { makeAutoObservable } from 'mobx'
import { Identity } from '@semaphore-protocol/identity'
import { UserState } from '@unirep/core'
import prover from '@unirep/circuits/provers/web'
import { ethers } from 'ethers'
import APP_ABI from '@anon-transfer/contracts/abi/AnonTransfer.json'

const UNIREP_ADDRESS = '0xD91ca7eAB8ac0e37681362271DEB11a7fc4e0d4f'
const APP_ADDRESS = '0x9A676e781A523b5d0C0e43731313A708CB607508'
const ETH_PROVIDER_URL = 'http://127.0.0.1:8545'

class User {
    currentEpoch: number = 0
    latestTransitionedEpoch: number = 0
    hasSignedUp: boolean = false
    data: bigint[] = []
    provableData: bigint[] = []
    userState?: UserState
    app?: ethers.Contract
    provider: any

    constructor() {
        makeAutoObservable(this)
        this.load()
    }

    async load() {
        const id = localStorage.getItem('id')
        const identity = id ? new Identity(id) : new Identity()
        if (!id) {
            localStorage.setItem('id', identity.toString())
        }
        const provider = ETH_PROVIDER_URL.startsWith('http')
            ? new ethers.providers.JsonRpcProvider(ETH_PROVIDER_URL)
            : new ethers.providers.WebSocketProvider(ETH_PROVIDER_URL)
        this.provider = provider

        const userState = new UserState({
            provider,
            prover,
            unirepAddress: UNIREP_ADDRESS,
            attesterId: BigInt(APP_ADDRESS),
            id: identity,
        })
        this.app = new ethers.Contract(APP_ADDRESS, APP_ABI, provider)
        await userState.start()
        this.userState = userState
        await userState.waitForSync()
        this.hasSignedUp = await userState.hasSignedUp()
        if (this.hasSignedUp) {
            await this.loadData()
            this.latestTransitionedEpoch =
                await this.userState.latestTransitionedEpoch()
        }
    }

    get fieldCount() {
        return this.userState?.sync.settings.fieldCount
    }

    get sumFieldCount() {
        return this.userState?.sync.settings.sumFieldCount
    }

    get replNonceBits() {
        return this.userState?.sync.settings.replNonceBits
    }

    get numEpochKeyNoncePerEpoch() {
        return this.userState?.sync.settings.numEpochKeyNoncePerEpoch
    }

    epochKey(nonce: number) {
        if (!this.userState) return '0x'
        const epoch = this.userState.sync.calcCurrentEpoch()
        const key = this.userState.getEpochKeys(epoch, nonce)
        return `0x${key.toString(16)}`
    }

    async loadData() {
        if (!this.userState) throw new Error('user state not initialized')

        this.data = await this.userState.getData()
        this.provableData = await this.userState.getProvableData()
    }

    async signup() {
        if (!this.userState) throw new Error('user state not initialized')

        const { publicSignals, proof } =
            await this.userState.genUserSignUpProof()
        const provider = new ethers.providers.Web3Provider(
            (window as any).ethereum
        )
        const signer = provider.getSigner()
        const tx = await this.app
            ?.connect(signer)
            .userSignUp(publicSignals, proof)
        await tx.wait()
        await this.userState.waitForSync()
        this.hasSignedUp = await this.userState.hasSignedUp()
        this.latestTransitionedEpoch = this.userState.sync.calcCurrentEpoch()
        this.loadData()
    }

    async transfer(epochKey: string, amount: string) {
        const epoch = this.userState?.sync.calcCurrentEpoch()
        const provider = new ethers.providers.Web3Provider(
            (window as any).ethereum
        )
        const signer = provider.getSigner()
        const tx = await this.app
            ?.connect(signer)
            .transfer(epochKey, epoch, { value: amount })
        const receipt = await tx.wait()
        console.log(receipt)
    }

    async withdraw(recipient: string, amount: string) {
        const provider = new ethers.providers.Web3Provider(
            (window as any).ethereum
        )
        const signer = provider.getSigner()
        await this.userState?.waitForSync()
        const reputationProof = await this.userState?.genProveReputationProof({
            minRep: Number(amount),
            revealNonce: true,
            epkNonce: 0,
            data: recipient,
        })
        const tx = await this.app
            ?.connect(signer)
            .withdraw(
                recipient,
                reputationProof?.publicSignals,
                reputationProof?.proof
            )
        const receipt = await tx.wait()
        console.log(receipt)
    }

    async stateTransition() {
        if (!this.userState) throw new Error('user state not initialized')

        await this.userState.waitForSync()
        const { publicSignals, proof } =
            await this.userState.genUserStateTransitionProof()
        const provider = new ethers.providers.Web3Provider(
            (window as any).ethereum
        )
        const signer = provider.getSigner()
        const tx = await this.userState.sync.unirepContract
            .connect(signer)
            .userStateTransition(publicSignals, proof)
        const receipt = await tx.wait()
        console.log(receipt)
        await this.userState.waitForSync()
        await this.loadData()
        this.latestTransitionedEpoch =
            await this.userState.latestTransitionedEpoch()
    }
}

export default createContext(new User())
