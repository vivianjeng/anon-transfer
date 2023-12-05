// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import { Unirep } from "@unirep/contracts/Unirep.sol";
import { ReputationVerifierHelper } from '@unirep/contracts/verifierHelpers/ReputationVerifierHelper.sol';

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract AnonTransfer {
    Unirep public unirep;
    ReputationVerifierHelper public helper;
    uint8 depositIndex = 0;
    uint8 withdrawIndex = 1;
    mapping(uint => bool) public withdrawnEpochKey;

    constructor(
        Unirep _unirep,  
        ReputationVerifierHelper _helper,
        uint48 _epochLength
    ) {
        // set unirep address
        unirep = _unirep;

        // set reputation verifier helper address
        helper = _helper;

        // sign up as an attester
        unirep.attesterSignUp(_epochLength);
    }

    // sign up users in this app
    function userSignUp(
        uint[] calldata publicSignals,
        uint[8] calldata proof
    ) public {
        unirep.userSignUp(publicSignals, proof);
    }

    function transfer(
        uint epochKey
    ) public payable{
        uint48 epoch = unirep.attesterCurrentEpoch(uint160(address(this)));
        unirep.attest(epochKey, epoch, depositIndex, msg.value);
    }

    function withdraw(
        address payable recipient,
        uint[] calldata publicSignals,
        uint[8] calldata proof
    ) public {
        ReputationVerifierHelper.ReputationSignals memory signals = helper.verifyAndCheckCaller(publicSignals, proof);
        uint amount = signals.minRep;
        uint epochKey = signals.epochKey;
        require(signals.revealNonce == true, "should reveal epoch key nonce");
        require(signals.nonce == 0, "should set epoch key nonce to 0");
        require(signals.proveMinRep == true, "should prove minimum rep");
        require(withdrawnEpochKey[epochKey] == false, "withdraw is only allowed once per epoch");
        require(signals.data == uint(uint160(address(recipient))), "should specific recipient");
        recipient.transfer(amount);
        unirep.attest(epochKey, signals.epoch, withdrawIndex, amount);
        withdrawnEpochKey[epochKey] = true;
    }
}
