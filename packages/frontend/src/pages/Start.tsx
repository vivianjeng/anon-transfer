import React from 'react'
import { observer } from 'mobx-react-lite'
import './start.css'
import Button from '../components/Button'
import User from '../contexts/User'
import Wallet from '../contexts/Wallet'

export default observer(() => {
    const walletContext = React.useContext(Wallet)
    const userContext = React.useContext(User)
    const [epochKeyRecipient, setEpochKeyRecipient] = React.useState('')
    const [transferValue, setTransferValue] = React.useState('')
    const [balance, setBalance] = React.useState('0')
    const [ETHRecipient, setETHRecipient] = React.useState('')
    const [withdrawValue, setWithdrawValue] = React.useState('')

    return (
        <div className="join">
            {walletContext.address === '' ? (
                <Button
                    onClick={() => {
                        return walletContext.load()
                    }}
                >
                    Connect Wallet
                </Button>
            ) : (
                <div>{walletContext.address}</div>
            )}
            {!userContext.hasSignedUp ? (
                <Button
                    onClick={() => {
                        if (!userContext.userState) return
                        return userContext.signup()
                    }}
                >
                    {userContext.userState ? 'Sign up' : 'Initializing...'}
                </Button>
            ) : (
                <div>
                    <input
                        type="text"
                        placeholder="Epoch Key Recipient"
                        value={epochKeyRecipient}
                        onChange={(e) => setEpochKeyRecipient(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Ethers Value"
                        value={transferValue}
                        onChange={(e) => setTransferValue(e.target.value)}
                    />
                    <Button
                        onClick={() => {
                            if (!userContext.userState) return
                            return userContext.transfer(
                                epochKeyRecipient,
                                transferValue
                            )
                        }}
                    >
                        Transfer
                    </Button>
                    <Button
                        onClick={async () => {
                            if (!userContext.userState) return
                            await userContext.stateTransition()
                            const data = await userContext.userState.getData()
                            setBalance(data[0].toString())
                        }}
                    >
                        Transition
                    </Button>
                    <div>Balance: {balance}</div>
                    <input
                        type="text"
                        placeholder="ETH Recipient"
                        value={ETHRecipient}
                        onChange={(e) => setETHRecipient(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Withdraw Amount"
                        value={withdrawValue}
                        onChange={(e) => setWithdrawValue(e.target.value)}
                    />
                    <Button
                        onClick={() => {
                            if (!userContext.userState) return
                            return userContext.withdraw(
                                ETHRecipient,
                                withdrawValue
                            )
                        }}
                    >
                        Withdraw
                    </Button>
                </div>
            )}
        </div>
    )
})
