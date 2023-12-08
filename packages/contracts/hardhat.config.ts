import '@typechain/hardhat'
import '@nomiclabs/hardhat-ethers'
import '@nomicfoundation/hardhat-chai-matchers'

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
        arb: {
            url: 'https://arbitrum.goerli.unirep.io',
            accounts: [
                '0x0f70e777f814334daa4456ac32b9a1fdca75ae07f70c2e6cef92679bad06c88b',
            ],
        },
        sepolia: {
            url: 'https://eth-sepolia.g.alchemy.com/v2/O8krM6JNnpSmd5eXU1aile_dgQa_Vg9t',
            accounts: [
                '0x83f5f9e1b808df850eee6c6d106718ade8b316c4462a82166a91dc945ac74cc6',
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
}
