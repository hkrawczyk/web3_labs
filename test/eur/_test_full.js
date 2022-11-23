const { expect } = require("chai");
const { ethers } = require("hardhat");
const Web3Utils = require('web3-utils');
let i_eur;

describe("Digital Euro test", function () {

  it("Deploy", async function () {
    const EUR = await ethers.getContractFactory("dEUR_full");
    const eur = await EUR.deploy();
    i_eur =  await eur.deployed();
  });

  it("Check constructor mint of 1 000 000 dEUR", async function () {
    const [owner, addr1, addr2] = await ethers.getSigners();
    const amt = await i_eur.balanceOf(owner.address);

    expect(Web3Utils.toWei('1000000', 'ether') === amt.toString()).to.be.true;
  });

  it("Mint pause owner test", async function () {
    const [owner, addr1, addr2] = await ethers.getSigners();

    await expect(i_eur.connect(addr1).setMintPaused(true)).to.be.revertedWith('Not an admin');
  });

  it("Mint require test", async function () {
    const [owner, addr1, addr2] = await ethers.getSigners();
    await i_eur.setMintPaused(true);
    await expect(i_eur.mint(addr1.address, Web3Utils.toWei('1', 'ether'))).to.be.revertedWith('Mint paused!');
    await i_eur.setMintPaused(false);
  });

  it("Mint", async function () {
    const [owner, addr1, addr2] = await ethers.getSigners();
    await i_eur.mint(addr1.address, Web3Utils.toWei('1', 'ether'));
    const amt = await i_eur.balanceOf(addr1.address);

    expect(Web3Utils.toWei('1', 'ether') === amt.toString()).to.be.true;
  });

  it("Transfer", async function () {
    const [owner, addr1, addr2] = await ethers.getSigners();

    const amount = Web3Utils.toWei('1', 'ether')

    const amt_pre = await i_eur.balanceOf(addr1.address);
    await i_eur.transfer(addr1.address, amount);
    const amt_post = await i_eur.balanceOf(addr1.address);

    expect(amt_pre.add(amount).toString() === amt_post.toString()).to.be.true;
  });

  it("Burn", async function () {
    const [owner, addr1, addr2] = await ethers.getSigners();

    const amount = Web3Utils.toWei('1', 'ether')

    const amt_pre = await i_eur.balanceOf(addr1.address);
    await i_eur.burn(addr1.address, amount);
    const amt_post = await i_eur.balanceOf(addr1.address);

    expect(amt_pre.sub(amount).toString() === amt_post.toString()).to.be.true;
  });

  it("Set whitelist", async function () {
    const [owner, addr1, addr2] = await ethers.getSigners();

    const WALLETS = [addr1.address, owner.address]
    const AMOUNTS = [Web3Utils.toWei('5', 'ether'), Web3Utils.toWei('4', 'ether')]

    await i_eur.setWhitelist(WALLETS, AMOUNTS, false);
    const whitelist_addr1 = await i_eur.whitelist(addr1.address);
    const whitelist_owner = await i_eur.whitelist(owner.address);

    expect(whitelist_addr1.amount.toString() ===AMOUNTS[0]).to.be.true;
    expect(whitelist_addr1.claimed).to.be.false;
    expect(whitelist_owner.amount.toString() ===AMOUNTS[1]).to.be.true;
    expect(whitelist_owner.claimed).to.be.false;
  });

  it("Test claim require", async function () {
    const [owner, addr1, addr2] = await ethers.getSigners();

    await expect(i_eur.connect(addr2).claim()).to.be.revertedWith('Not whitelisted');
  });

  it("Test claimed", async function () {
    const [owner, addr1, addr2] = await ethers.getSigners();
    const amt_pre = await i_eur.balanceOf(addr1.address);
    await i_eur.connect(addr1).claim()
    const amt_post = await i_eur.balanceOf(addr1.address);

    expect(amt_pre.add(Web3Utils.toWei('5', 'ether')).toString() === amt_post.toString()).to.be.true;
  });

  it("Test claimed require", async function () {
    const [owner, addr1, addr2] = await ethers.getSigners();

    await expect(i_eur.connect(addr1).claim()).to.be.revertedWith('Allocation claimed');
  });

});
