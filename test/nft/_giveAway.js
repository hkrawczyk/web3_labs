const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Test giveaway", function () {
  it("Validate limits and sending NFTs", async function () {

    const contract = await ethers.getContractFactory("MyNft_full");
    const nft = await contract.deploy(
        "random url"                            //baseURI
    );
    const nft_instance = await nft.deployed();


    await nft_instance.giveAway("0x8c606755f7c9F56b7660615C17e8c3f87d2E7c20",5);
    await nft_instance.giveAway("0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",10);


    const vaultBalance = await nft_instance.walletOfOwner("0x8c606755f7c9F56b7660615C17e8c3f87d2E7c20");
    const vaultBalance2 = await nft_instance.walletOfOwner("0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266");

    expect(vaultBalance.length === 5 && vaultBalance2.length === 10).to.be.true;

    await nft_instance.setPause(false);
    await nft_instance.setOnlyWhitelisted(false);

    await nft_instance.mint(2, {value: ethers.utils.parseEther("0.02")});

    const walletOfOwner = await nft_instance.walletOfOwner("0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266");
    expect( walletOfOwner.length === 12).to.be.true;

  });
});
