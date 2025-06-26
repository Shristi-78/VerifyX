// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Verification {
    mapping(string => bool) public verifiedHashes;
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    // Modifier to restrict function access to the contract owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    // Function to store a hash (only owner can call this)
    function storeHash(string memory dataHash) public onlyOwner {
        verifiedHashes[dataHash] = true;
    }

    // Function to verify a hash
    function isVerified(string memory dataHash) public view returns (bool) {
        return verifiedHashes[dataHash];
    }
}
