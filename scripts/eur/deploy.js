const hre = require("hardhat");
const {ethers} = require("hardhat");

async function main() {
    const Token = await ethers.getContractFactory("dEUR");
    const erc20 = await Token.deploy();
    await erc20.deployed();
    console.log("ERC20 deployed", erc20.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
