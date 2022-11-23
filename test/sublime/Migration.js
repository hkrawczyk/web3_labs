const {expect} = require("chai");
const {ethers} = require("hardhat");
const Web3Utils = require('web3-utils');
const examples = require("../../testFactories/tempData");
const defaults = require("../../testFactories/defaultEnv");

let _i_admin;
let _i_db;
let _i_db2;
let _i_payouts;
let _i_payouts2;
let _i_invest;
let _i_invest2;
let _i_otc;
let _i_USDC;
let _i_USDT;


let offers = require("../../scripts/sublime/_data_migrate/_final_offers.json");
let participants = require("../../scripts/sublime/_data_migrate/batchedReduced.json");


describe("Invest", function () {

    it("Set up environment", async function () {
        const [owner, addr1, addr2] = await ethers.getSigners();

        const {
            i_admin,
            i_invest,
            i_invest2,
            i_otc,
            i_USDC,
            i_USDT,
            i_db,
            i_payouts,
            i_db2,
            i_payouts2
        } = await defaults.envSplit(true, 18, [addr1.address, addr2.address]);
        _i_admin = i_admin
        _i_invest = i_invest
        _i_invest2 = i_invest2
        _i_otc = i_otc
        _i_USDC = i_USDC
        _i_USDT = i_USDT
        _i_db = i_db
        _i_db2 = i_db2
        _i_payouts = i_payouts
        _i_payouts2 = i_payouts2

    });
    it("Add investments", async function () {
        //gwei: 294703
        //usd: 7
        //total: $100
        for (let i = 0; i < offers.length; i++) {
            await _i_db.updateInvestment(
                offers[i].id,
                offers[i].b_name,
                offers[i].b_extra,
                offers[i].b_otc,
                Web3Utils.toWei(`${offers[i].b_ppt}`, 'mwei'),
                offers[i].b_alloMin,
                offers[i].b_alloTotal,
                offers[i].b_alloRaised,
                [offers[i].b_dopen, offers[i].b_dclose],
                offers[i].b_tax,
                [
                    offers[i].b_isMultiphase,
                    offers[i].b_isPaused,
                    offers[i].b_isSettled,
                    offers[i].b_isRefund,
                ]
            )

        }
    });
    it("Upload participants", async function () {
        //gas limit: 30 000 000 // 28000000
        //gas avg per override: 70000
        //400 entries in one block

        let wallets = []
        let amounts = []

        participants.forEach(el => {
            wallets.push(el.address)
            amounts.push(el.amount)
        })
        console.log(participants.length, wallets.length)

        await _i_db.massUpload(
            1,
            amounts,
            wallets
        )

    });

});
