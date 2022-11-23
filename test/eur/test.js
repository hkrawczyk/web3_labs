const { expect } = require("chai");
const { ethers } = require("hardhat");
const Web3Utils = require('web3-utils');
let i_eur;

describe("Digital Euro test", function () {

  it("Deploy", async function () {
    const EUR = await ethers.getContractFactory("dEUR");
    const eur = await EUR.deploy();
    i_eur =  await eur.deployed();
  });

  it("Check constructor mint of 1 000 000 dEUR", async function () {
    const [owner, addr1, addr2] = await ethers.getSigners();
    const amt = await i_eur.balanceOf(owner.address);
    expect(Web3Utils.toWei('1000000', 'ether') === amt.toString()).to.be.true;
  });

  it("Mint", async function () {
    const [owner, addr1, addr2] = await ethers.getSigners();
    await i_eur.mint(addr1.address, Web3Utils.toWei('1', 'ether'));
    const amt = await i_eur.balanceOf(addr1.address);

    expect(Web3Utils.toWei('1', 'ether') === amt.toString()).to.be.true;
  });

  // it("Transfer", async function () {
  //
  // });

  // it("Burn", async function () {
  //
  // });

  // it("Set whitelist", async function () {
  //
  // });

  // it("Test claim", async function () {
  //    await expect(i_eur.connect(addr2).claim()).to.be.revertedWith('Not whitelisted');
  // });

});
