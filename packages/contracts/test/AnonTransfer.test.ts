//@ts-ignore
import { ethers } from 'hardhat'
import { expect } from 'chai'
import { deployUnirep, deployVerifierHelper } from '@unirep/contracts/deploy'
import { schema, UserState } from '@unirep/core'
import { SQLiteConnector } from 'anondb/node'
import { Circuit } from '@unirep/circuits'
import { defaultProver as prover } from '@unirep/circuits/provers/defaultProver'
import { Identity } from '@semaphore-protocol/identity'

import { AnonTransfer } from '../typechain-types'
import { Unirep } from '@unirep/contracts/typechain'

async function genUserState(id, app) {
    // generate a user state
    const db = await SQLiteConnector.create(schema, ':memory:')
    const unirepAddress = await app.unirep()
    const attesterId = BigInt(app.address)
    const userState = new UserState({
        db,
        prover,
        unirepAddress,
        provider: ethers.provider,
        attesterId,
        id,
    })
    await userState.start()
    await userState.waitForSync()
    return userState
}

describe('Anon Transfer', function () {
    this.timeout(0)
    let unirep: Unirep
    let app: AnonTransfer

    // epoch length
    const epochLength = 300
    // generate random user id
    const id = new Identity()

    it('deployment', async function () {
        const [signer] = await ethers.getSigners()
        unirep = await deployUnirep(signer)

        const helper = await deployVerifierHelper(
            unirep.address,
            signer,
            Circuit.reputation
        )
        const App = await ethers.getContractFactory('AnonTransfer')
        app = await App.deploy(unirep.address, helper.address, epochLength)

        await app.deployed()
    })

    it('user sign up', async () => {
        const userState = await genUserState(id, app)

        // generate
        const { publicSignals, proof } = await userState.genUserSignUpProof()
        await app.userSignUp(publicSignals, proof).then((t) => t.wait())
        userState.stop()
    })

    it('transfer', async () => {
        for (let i = 0; i < 3; i++) {
            const accounts = await ethers.getSigners()
            const sender = accounts[i + 1]
            const userState = await genUserState(id, app)
            const epoch = 0
            const nonce = i
            const wei = 100000 + i * 3000
            const epochKey = userState.getEpochKeys(epoch, nonce, app.address)
            await app
                .connect(sender)
                .transfer(epochKey as bigint, epoch, { value: wei })
                .then((t) => t.wait())
            console.log(`sender of the transaction: ${sender.address}`)
            console.log(`transfer ${wei} Wei to private address ${epochKey}`)
            console.log('-----------------------------------------------')
        }
    })

    it('user state transition', async () => {
        await ethers.provider.send('evm_increaseTime', [epochLength])
        await ethers.provider.send('evm_mine', [])

        const newEpoch = await unirep.attesterCurrentEpoch(app.address)
        const userState = await genUserState(id, app)
        const { publicSignals, proof } =
            await userState.genUserStateTransitionProof({
                toEpoch: newEpoch,
            })
        await unirep
            .userStateTransition(publicSignals, proof)
            .then((t) => t.wait())
        userState.stop()
    })

    it('withdraw', async () => {
        const wallet = ethers.Wallet.createRandom()
        const balance0 = await ethers.provider.getBalance(wallet.address)
        expect(balance0.toString()).to.equal('0')
        const userState = await genUserState(id, app)
        const withdrawAmount = 200000
        const { publicSignals, proof } =
            await userState.genProveReputationProof({ minRep: withdrawAmount })
        await app.withdraw(wallet.address, publicSignals, proof)
        const balance1 = await ethers.provider.getBalance(wallet.address)
        expect(balance1.toString()).to.equal(withdrawAmount.toString())
        console.log(
            `withdraw amount ${withdrawAmount} Wei to wallet with address ${wallet.address}`
        )
    })
})
