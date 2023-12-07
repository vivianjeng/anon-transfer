import { ethers } from 'ethers'
import * as fs from 'fs'
import * as path from 'path'
import {
    deployUnirep,
    deployVerifierHelper,
} from '@unirep/contracts/deploy/index.js'
import { Circuit } from '@unirep/circuits'
import * as hardhat from 'hardhat'
import APP from '../artifacts/contracts/AnonTransfer.sol/AnonTransfer.json'

const epochLength = 300

deployApp().catch((err) => {
    console.log(`Uncaught error: ${err}`)
    process.exit(1)
})

export async function deployApp() {
    const provider = new ethers.providers.JsonRpcProvider(
        'http://127.0.0.1:8545'
    )
    const signer = new ethers.Wallet(
        '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
        provider
    )
    const unirep = await deployUnirep(signer)

    const helper = await deployVerifierHelper(
        unirep.address,
        signer,
        Circuit.reputation
    )
    const App = new ethers.ContractFactory(APP.abi, APP.bytecode, signer)
    const app = await App.deploy(unirep.address, helper.address, epochLength)

    await app.deployed()

    console.log(
        `AnonTransfer with epoch length ${epochLength} is deployed to ${app.address}`
    )

    const config = `export default {
    UNIREP_ADDRESS: '${unirep.address}',
    APP_ADDRESS: '${app.address}',
    ETH_PROVIDER_URL: '${hardhat.network.config.url ?? ''}',
    ${
        Array.isArray(hardhat.network.config.accounts)
            ? `PRIVATE_KEY: '${hardhat.network.config.accounts[0]}',`
            : `/**
      This contract was deployed using a mnemonic. The PRIVATE_KEY variable needs to be set manually
    **/`
    }
  }
  `

    const configPath = path.join(__dirname, '../../../config.ts')
    await fs.promises.writeFile(configPath, config)

    console.log(`Config written to ${configPath}`)
}
