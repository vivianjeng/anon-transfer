# Anonymous Token Transfer

This is a demo app of a [UniRep](https://github.com/Unirep/Unirep) application. Users of Anonymous Token Transfer can use the private address (called [epoch key](https://developer.unirep.io/docs/protocol/epoch-key) in UniRep) to receive tokens, and withdraw tokens with a different account. It doesn't require users to withdraw with the exact amount of the token when it is deposited.

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
transfer 100000 Wei to private address 20408162335258823257091822342384198536470275900769147484047483059062655101298
-----------------------------------------------
sender of the transaction: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
transfer 103000 Wei to private address 2806480041188334751377259902298358517899586257772464953948988730909097026841
-----------------------------------------------
sender of the transaction: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
transfer 106000 Wei to private address 4088578463542771738099362822682339661898593652812747530128899506064826382918
-----------------------------------------------
    ✔ transfer (1064ms)
    ✔ user state transition (12508ms)
Epoch 0 ended
withdraw amount 200000 Wei to wallet with address 0x7dD6c78194B8cAB72009A84c635B034c9Bf6dBe1
    ✔ withdraw (1299ms)
```