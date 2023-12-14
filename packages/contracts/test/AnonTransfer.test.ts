//@ts-ignore
import { ethers } from 'hardhat'
import { expect } from 'chai'
import { deployUnirep, deployVerifierHelper } from '@unirep/contracts/deploy'
import { UserState } from '@unirep/core'
import { Circuit } from '@unirep/circuits'
import { defaultProver as prover } from '@unirep/circuits/provers/defaultProver'
import { Unirep } from '@unirep/contracts/typechain'
import { Identity } from '@semaphore-protocol/identity'

import { AnonTransfer } from '../typechain-types'

async function genUserState(id: Identity, app: AnonTransfer) {
    // generate a user state
    const unirepAddress = await app.unirep()
    const attesterId = BigInt(app.address)
    const userState = new UserState({
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
    // user balance
    let balance = BigInt(0)

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
            const gwei = 100000 + i * 3000
            const epochKey = userState.getEpochKeys(
                epoch,
                nonce,
                app.address
            ) as bigint
            await app
                .connect(sender)
                .transfer(epochKey, {
                    value: ethers.utils.parseUnits(gwei.toString(), 'gwei'),
                })
                .then((t) => t.wait())
            console.log(`sender of the transaction: ${sender.address}`)
            console.log(`transfer ${gwei} gwei to private address ${epochKey}`)

            // check user balance
            balance += BigInt(gwei)
            await userState.waitForSync()
            const data = await userState.getData()
            expect(data[0].toString()).to.equal(balance.toString())
            console.log('user 1 balance in gwei:', balance.toString())
            userState.stop()
            console.log('-----------------------------------------------')
        }
    })

    it('cannot transfer with value that is not gwei value', async () => {
        const accounts = await ethers.getSigners()
        const sender = accounts[2]
        const userState = await genUserState(id, app)
        const epoch = 0
        const nonce = 0
        const wei = 100000
        const epochKey = userState.getEpochKeys(
            epoch,
            nonce,
            app.address
        ) as bigint
        await expect(
            app
                .connect(sender)
                .transfer(epochKey, { value: wei })
                .then((t) => t.wait())
        ).to.be.revertedWith('gweiValue should be multiple of 1e9')
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
        const accounts = await ethers.getSigners()
        const sender = accounts[10]
        const wallet = ethers.Wallet.createRandom()
        const balance0 = await ethers.provider.getBalance(wallet.address)
        expect(balance0.toString()).to.equal('0')
        const userState = await genUserState(id, app)
        const withdrawGwei = 200000
        const revealNonce = true
        const epkNonce = 0
        const sigData = wallet.address
        const { publicSignals, proof } =
            await userState.genProveReputationProof({
                minRep: withdrawGwei,
                revealNonce,
                epkNonce,
                data: sigData,
            })
        await app.connect(sender).withdraw(wallet.address, publicSignals, proof)
        const balance1 = await ethers.provider.getBalance(wallet.address)
        expect(balance1.toString()).to.equal(
            ethers.utils.parseUnits(withdrawGwei.toString(), 'gwei')
        )
        console.log(`sender of the transaction: ${sender.address}`)
        console.log(
            `withdraw amount ${withdrawGwei} gwei to wallet with address ${wallet.address}`
        )

        // check user balance
        balance -= BigInt(withdrawGwei)
        await userState.waitForSync()
        const data = await userState.getData()
        expect((data[0] - data[1]).toString()).to.equal(balance.toString())
        console.log('user 1 balance in gwei:', balance)
        userState.stop()
    })

    it('cannot withdraw twice in the same epoch', async () => {
        const wallet = ethers.Wallet.createRandom()
        const balance0 = await ethers.provider.getBalance(wallet.address)
        expect(balance0.toString()).to.equal('0')
        const userState = await genUserState(id, app)
        const withdrawGwei = 200000
        const revealNonce = true
        const epkNonce = 0
        const sigData = wallet.address
        const { publicSignals, proof } =
            await userState.genProveReputationProof({
                minRep: withdrawGwei,
                revealNonce,
                epkNonce,
                data: sigData,
            })
        await expect(
            app
                .withdraw(wallet.address, publicSignals, proof)
                .then((t) => t.wait())
        ).to.be.revertedWith('withdraw is only allowed once per epoch')
        userState.stop()
    })

    it('cannot withdraw the amount more than balance', async () => {
        // user state transition
        await ethers.provider.send('evm_increaseTime', [epochLength])
        await ethers.provider.send('evm_mine', [])

        const newEpoch = await unirep.attesterCurrentEpoch(app.address)
        const userState = await genUserState(id, app)
        {
            const { publicSignals, proof } =
                await userState.genUserStateTransitionProof({
                    toEpoch: newEpoch,
                })
            await unirep
                .userStateTransition(publicSignals, proof)
                .then((t) => t.wait())
        }

        const wallet = ethers.Wallet.createRandom()
        const balance0 = await ethers.provider.getBalance(wallet.address)
        expect(balance0.toString()).to.equal('0')
        const revealNonce = true
        const epkNonce = 0
        const sigData = wallet.address
        await userState.waitForSync()

        // check balance
        const data = await userState.getProvableData()
        const minRep = data[0] - data[1]
        expect(minRep.toString()).to.equal(balance.toString())
        console.log('user 1 balance in gwei:', balance.toString())

        // success
        await userState.genProveReputationProof({
            minRep: Number(minRep),
            revealNonce,
            epkNonce,
            data: sigData,
        })

        // fail
        await new Promise<void>((rs, rj) => {
            userState
                .genProveReputationProof({
                    minRep: Number(minRep) + 1,
                    revealNonce,
                    epkNonce,
                    data: sigData,
                })
                .then(() => rj())
                .catch(() => rs())
        })
        userState.stop()
    })
})
