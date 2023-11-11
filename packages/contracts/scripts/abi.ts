import * as fs from 'fs'
import * as path from 'path'
import APP_ABI from '../artifacts/contracts/AnonTransfer.sol/AnonTransfer.json'

fs.writeFileSync(
    path.join(__dirname, '../abi/AnonTransfer.json'),
    JSON.stringify(APP_ABI.abi)
)
