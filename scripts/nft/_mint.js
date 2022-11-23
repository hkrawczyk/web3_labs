const hre = require("hardhat");
const {ethers} = require("hardhat");

async function main() {
    const [owner, addr1, addr2] = await ethers.getSigners();
    const contact = await ethers.getContractFactory("MyNft_full");
    const NFT = await contact.attach("0x8721bD3C9991C57466dB0a276AE9480817f69D88")

    const transaction = await NFT.mint(2, {value: ethers.utils.parseEther("0.02")})
    console.log("Transaction", transaction)
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
