import { UserState, schema } from '@unirep/core'
import { ethers } from 'ethers'
import { JsonRpcSigner } from '@ethersproject/providers'
import { getUnirepContract } from '@unirep/contracts'
import abi from '@anon-transfer/contracts/abi/AnonTransfer.json'
import prover from '@unirep/circuits/provers/web'
import { Circuit, SignupProof } from '@unirep/circuits'
import { appAddress, chainId, culcEpoch, unirepAddress } from '@/contexts/User'
import { IndexedDBConnector } from 'anondb/web'

export function useUnirepUser() {
    const initUserState = async (id: any, signer: JsonRpcSigner) => {
        const db = await IndexedDBConnector.create(schema)
        const state = new UserState({
            id: id,
            prover: prover,
            provider: signer.provider,
            attesterId: BigInt(appAddress),
            unirepAddress: unirepAddress,
            db: db,
        })
        await state.start()
        await state.waitForSync()
        return state
    }

    const userSignup = async (
        id: any,
        signer: JsonRpcSigner
    ): Promise<string> => {
        const app = new ethers.Contract(appAddress, abi, signer)
        const epoch = culcEpoch()
        const circuitInputs = {
            identity_secret: id.secret,
            epoch: epoch,
            attester_id: appAddress,
            chain_id: chainId,
        }
        const signupProof = await prover.genProofAndPublicSignals(
            Circuit.signup,
            circuitInputs
        )
        const { publicSignals, proof } = new SignupProof(
            signupProof.publicSignals,
            signupProof.proof
        )
        const data = app.interface.encodeFunctionData('userSignUp', [
            publicSignals,
            proof,
        ])
        const params = [
            {
                from: await signer.getAddress(),
                to: appAddress,
                data: data,
            },
        ]
        const tx = await signer?.provider.send('eth_sendTransaction', params)
        window.localStorage.setItem('transitionEpoch', epoch.toString())
        return tx
    }

    const userTransition = async (
        id: any,
        signer: JsonRpcSigner
    ): Promise<string> => {
        const userState = await initUserState(id, signer)
        const unirep = getUnirepContract(unirepAddress, signer)
        const { publicSignals, proof, toEpoch } =
            await userState.genUserStateTransitionProof()
        const data = unirep.interface.encodeFunctionData(
            'userStateTransition',
            [publicSignals, proof]
        )
        const params = [
            {
                from: await signer.getAddress(),
                to: unirepAddress,
                data: data,
            },
        ]
        const tx = await signer?.provider.send('eth_sendTransaction', params)
        window.localStorage.setItem('transitionEpoch', toEpoch.toString())
        userState.stop()
        return tx
    }

    const userWithdraw = async (
        id: any,
        signer: JsonRpcSigner,
        ETHAddress: string,
        value: string
    ): Promise<string> => {
        const userState = await initUserState(id, signer)
        if (
            culcEpoch() !==
            Number(window.localStorage.getItem('transitionEpoch'))
        ) {
            const unirep = getUnirepContract(unirepAddress, signer)
            const { publicSignals, proof, toEpoch } =
                await userState.genUserStateTransitionProof()
            const data = unirep.interface.encodeFunctionData(
                'userStateTransition',
                [publicSignals, proof]
            )
            const params = [
                {
                    from: await signer.getAddress(),
                    to: unirepAddress,
                    data: data,
                },
            ]
            const tx = await signer?.provider.send(
                'eth_sendTransaction',
                params
            )
            window.localStorage.setItem('transitionEpoch', toEpoch.toString())
            await signer.provider.waitForTransaction(tx)
        }
        const revealNonce = true
        const epkNonce = 0
        const sigData = ETHAddress
        const app = new ethers.Contract(appAddress, abi, signer)
        const { publicSignals, proof } =
            await userState.genProveReputationProof({
                minRep: value as any,
                revealNonce,
                epkNonce,
                data: sigData,
            })
        const data = app.interface.encodeFunctionData('withdraw', [
            ETHAddress,
            publicSignals,
            proof,
        ])
        const params = [
            {
                from: await signer.getAddress(),
                to: appAddress,
                data: data,
            },
        ]
        const tx = await signer?.provider.send('eth_sendTransaction', params)
        userState.stop()
        return tx
    }

    const getUserData = async (id: any, signer: JsonRpcSigner) => {
        const userState = await initUserState(id, signer)
        await userState.waitForSync()
        const data = await userState.getData()
        const provable = await userState.getProvableData()
        const provableData = (provable[0] - provable[1]).toString()
        const latestData = (data[0] - data[1]).toString()
        userState.stop()
        return { provableData, latestData }
    }

    return {
        userSignup,
        userTransition,
        userWithdraw,
        getUserData,
    }
}
