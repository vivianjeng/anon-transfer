import { Button } from '@chakra-ui/react'
import { ethers } from 'ethers'
import { Identity } from '@semaphore-protocol/identity'
import { getUnirepContract } from '@unirep/contracts'
import abi from '@anon-transfer/contracts/abi/AnonTransfer.json'
import prover from '@unirep/circuits/provers/web'
import { Circuit, SignupProof } from '@unirep/circuits'
import { useState } from 'react'

const unirepAddress = '0xD91ca7eAB8ac0e37681362271DEB11a7fc4e0d4f'
const address = '0x9A676e781A523b5d0C0e43731313A708CB607508'

export type SignupProps = {
    from: string
    semaphoreIdentity: string
}

const provider = new ethers.providers.Web3Provider(window.ethereum)
const app = new ethers.Contract(address, abi, provider)

export default function Signup({ from, semaphoreIdentity }: SignupProps) {
    const [isLoading, setIsLoading] = useState(false)

    const signup = async () => {
        setIsLoading(true)
        try {
            const id = new Identity(semaphoreIdentity)
            const unirep = getUnirepContract(unirepAddress, provider)
            const epoch = await unirep.attesterCurrentEpoch(address)
            const { chainId } = await provider.getNetwork()
            const circuitInputs = {
                identity_secret: id.secret,
                epoch: epoch,
                attester_id: address,
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
            await window.ethereum.request({
                method: 'eth_sendTransaction',
                params: [
                    {
                        from: from,
                        to: address,
                        data: data,
                    },
                ],
            })
        } catch (err: any) {
            window.alert(err.message)
        } finally {
            setIsLoading(false)
        }
    }
    return (
        <Button bgColor="skyblue" onClick={signup} isLoading={isLoading}>
            Signup
        </Button>
    )
}
