import '@typechain/hardhat'
import '@nomiclabs/hardhat-ethers'
import '@nomicfoundation/hardhat-chai-matchers'
import '@nomicfoundation/hardhat-verify'

export default {
    defaultNetwork: 'local',
    networks: {
        hardhat: {
            blockGasLimit: 12000000,
            mining: {
                auto: true,
                interval: 1000,
            },
        },
        local: {
            url: 'http://127.0.0.1:8545',
            blockGasLimit: 12000000,
            accounts: [
                '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
            ],
        },
    },
    solidity: {
        compilers: [
            {
                version: '0.8.21',
                settings: {
                    optimizer: { enabled: true, runs: 999999 },
                },
            },
        ],
    },
    etherscan: {
        // Your API key for Etherscan
        // Obtain one at https://etherscan.io/
        // apiKey:
    },
    sourcify: {
        // Disabled by default
        // Doesn't need an API key
        enabled: true,
    },
}
