const { expect } = require("chai");
const { ethers } = require("hardhat");
const Web3Utils = require('web3-utils');

describe("Validate constructor", function () {
  it("Create contract and validate baseURI", async function () {

    const contract = await ethers.getContractFactory("MyNft");
    const nft = await contract.deploy(
        'twój url S3 z / na końcu'  //baseURI
    );
    const nft_instance = await nft.deployed();

    const getURI = await nft_instance.getURI();
    expect(getURI == 'twój url S3 z / na końcu').to.be.true;

    // await nft_instance.mint(2, {value: ethers.utils.parseEther("0.02")});
  });
});
