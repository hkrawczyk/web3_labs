const { expect } = require("chai");
const { ethers } = require("hardhat");
const Web3Utils = require('web3-utils');

describe("Validate Mint Regular", function () {
  it("Validate Mint Regular", async function () {

    const contract = await ethers.getContractFactory("MyNft_full");
    const nft = await contract.deploy(
        process.env.HOST                            //baseURI
    );
    const nft_instance = await nft.deployed();

    await nft_instance.setPause(false);
    const paused = await nft_instance.paused();
    expect(paused).to.be.false;

    const onlyWhitelisted = await nft_instance.onlyWhitelisted();
    expect(onlyWhitelisted).to.be.true;

    await expect(nft_instance.mint(1, {value: ethers.utils.parseEther("0.01")})).to.be.revertedWith('Wallet is not whitelisted')


    await nft_instance.setOnlyWhitelisted(false);

    await nft_instance.setPrice(ethers.utils.parseEther("0.05"));


    await nft_instance.mint(2, {value: ethers.utils.parseEther("0.10")});
    const walletOfOwner = await nft_instance.walletOfOwner("0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266");
    const mintedAddress = await nft_instance.mintedAddress("0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266");
    expect(walletOfOwner.length === 2 && mintedAddress === 2 ).to.be.true;

  });
});
