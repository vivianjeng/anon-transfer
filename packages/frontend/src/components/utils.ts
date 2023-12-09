import { appAddress } from '@/contexts/User'

export const searchUser = async (commitment: bigint) => {
    const query = `
    {
    users(
        where: {
            attesterId: "${BigInt(appAddress).toString()}", 
            commitment: "${BigInt(commitment).toString()}"
        }) {
            epoch
        }
    }`
    const url = `https://api.studio.thegraph.com/query/48080/sepolia/v2.0.0-beta-5`
    const res = await fetch(url, {
        method: 'POST',

        headers: {
            'Content-Type': 'application/json',
        },

        body: JSON.stringify({
            query: query,
        }),
    })
    if (!res.ok) throw new Error(`Subgraph error: ${JSON.stringify(res)}`)
    const length = (await res.json()).data.users.length
    return length
}
