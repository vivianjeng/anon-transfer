import React from 'react'
import { observer } from 'mobx-react-lite'
import { Outlet, Link } from 'react-router-dom'
import './header.css'
import Button from '../components/Button'
import Wallet from '../contexts/Wallet'

export default observer(() => {
    const walletContext = React.useContext(Wallet)
    return (
        <>
            <div className="header">
                <img src={require('../../public/logo.svg')} alt="UniRep logo" />
                <div className="links">
                    <a href="https://developer.unirep.io/" target="blank">
                        Docs
                    </a>
                    <a href="https://github.com/Unirep" target="blank">
                        GitHub
                    </a>
                    <a
                        href="https://discord.com/invite/VzMMDJmYc5"
                        target="blank"
                    >
                        Discord
                    </a>
                </div>
            </div>

            <Outlet />
        </>
    )
})
