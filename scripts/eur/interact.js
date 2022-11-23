const hre = require("hardhat");
const {ethers} = require("hardhat");

async function main() {
    const [owner, addr1, addr2] = await ethers.getSigners();
    const dEUR = await ethers.getContractFactory("dEUR");
    const erc20 = await dEUR.attach("adres kontraktu")

    const balance = await erc20.balanceOf(owner.address)
    console.log("Balance of contract owner", balance)
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
