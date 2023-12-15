# Anonymous Token Transfer

This is a demo app of a [UniRep](https://github.com/Unirep/Unirep) application. Users of Anonymous Token Transfer can use the private address (called [epoch key](https://developer.unirep.io/docs/protocol/epoch-key) in UniRep) to receive tokens, and withdraw tokens with a different account. It doesn't require users to withdraw with the exact amount of the token when it is deposited.

Try it now 👉🏻 **https://anon-transfer.online/** 👈🏻

**What is provided during withdrawal?**

❌ User ID<br/>
❌ Wallet address <br/>
❌ Private address<br/>
✅ Zero Knowledge Proof<br/>

## Demo video

[![Demo of Anon Transfer](https://img.youtube.com/vi/VzaWcboohhE/0.jpg)](https://www.youtube.com/watch?v=VzaWcboohhE)

## 1. Installation and build

```shell
yarn install && yarn build
```

## 2. Test

```shell
yarn contracts test
```

example output:

```
    ✔ deployment (4744ms)
    ✔ user sign up (1752ms)
sender of the transaction: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
transfer 100000 gwei to private address 20288634146029549172244665324006248272118782231594914681237696098918486538180
user 1 balance in gwei: 100000
-----------------------------------------------
sender of the transaction: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
transfer 103000 gwei to private address 17142617488518961051962089813261229593445364448030237804264218253962973757715
user 1 balance in gwei: 203000
-----------------------------------------------
sender of the transaction: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
transfer 106000 gwei to private address 14619432103516208923089255954492731338449294246264854550927251034400298738983
user 1 balance in gwei: 309000
-----------------------------------------------
    ✔ transfer (30540ms)
    ✔ user state transition (12265ms)
sender of the transaction: 0xBcd4042DE499D14e55001CcbB24a551F3b954096
withdraw amount 200000 gwei to wallet with address 0xed1c20A405efD526Ff8B76084B44e6D11c750820
Epoch 0 ended
user 1 balance in gwei: 109000n
    ✔ withdraw (10081ms)
```
