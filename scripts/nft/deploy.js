const hre = require("hardhat");
const {ethers} = require("hardhat");

async function main() {
    // const Token = await ethers.getContractFactory("MyNft");
    const Token = await ethers.getContractFactory("MyNft_full");
    const NFT = await Token.deploy("https://citcap-public.s3.us-east-2.amazonaws.com/");
    // const NFT = await Token.deploy("https://google.com/"); //todo: użyj swojego adresu AWS S3
    await NFT.deployed();
    console.log("NFT deployed", NFT.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
