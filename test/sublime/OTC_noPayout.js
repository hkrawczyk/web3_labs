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


let i1_t1;
let i1_t2;
const u1 = [5000, 9000, 7000];
const u2 = [2000, 5000, 3000];
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
        const offer = examples.investments[4];


        //timestamp current
        const blockNumber = await ethers.provider.getBlockNumber();
        const block = await ethers.provider.getBlock(blockNumber);
        const timestampNow = block.timestamp;

        //invest1 && invest2
        const i1_delay = 7 * 24 * 60 * 60;
        const i1_start = timestampNow
        const i1_end = timestampNow + i1_delay
        i1_t1 = i1_start
        i1_t2 = i1_end

        await _i_db.addInvestment(
            1,
            offer.name,
            offer.data,
            offer.otc,
            offer.ppu,
            offer.alloMin,
            offer.alloTotal,
            [i1_start, i1_end],
            offer.tax,
            offer.state,
        )

        await _i_db2.addInvestment(
            1,
            offer.name,
            offer.data,
            offer.otc,
            offer.ppu,
            offer.alloMin,
            offer.alloTotal,
            [i1_start, i1_end],
            offer.tax,
            offer.state,
        )


    });
    it("Invest prep", async function () {
        const [owner, addr1, addr2] = await ethers.getSigners();
// const u1 = [5000, 9000, 7000];
// const u2 = [2000, 5000, 3000];

        //give out money
        await _i_USDC.transfer(addr1.address, Web3Utils.toWei('100000', 'mwei'));
        await _i_USDC.transfer(addr2.address, Web3Utils.toWei('100000', 'mwei'));
        await _i_USDT.transfer(addr1.address, Web3Utils.toWei('100000', 'mwei'));
        await _i_USDT.transfer(addr2.address, Web3Utils.toWei('100000', 'mwei'));


    });
    it("Investment unlimited", async function () {
        const [owner, addr1, addr2] = await ethers.getSigners();
        // const u1 = [5000, 9000];
        // const u2 = [USDC, USDT];
        // const u2 = [2000, 5000];
        // const u2 = [USDT, USDC];

        ////u1
        await _i_USDC.connect(addr1).approve(_i_invest.address, Web3Utils.toWei(`${u1[0]}`, 'mwei'));
        await _i_invest.connect(addr1).invest(1, Web3Utils.toWei(`${u1[0]}`, 'mwei'), _i_USDC.address, 0)

        await _i_USDT.connect(addr1).approve(_i_invest.address, Web3Utils.toWei(`${u1[1]}`, 'mwei'));
        await _i_invest.connect(addr1).invest(1, Web3Utils.toWei(`${u1[1]}`, 'mwei'), _i_USDT.address, 0)


        ////u2
        await _i_USDT.connect(addr2).approve(_i_invest2.address, Web3Utils.toWei(`${u2[0]}`, 'mwei'));
        await _i_invest2.connect(addr2).invest(1, Web3Utils.toWei(`${u2[0]}`, 'mwei'), _i_USDT.address, 0)

        await _i_USDC.connect(addr2).approve(_i_invest2.address, Web3Utils.toWei(`${u2[1]}`, 'mwei'));
        await _i_invest2.connect(addr2).invest(1, Web3Utils.toWei(`${u2[1]}`, 'mwei'), _i_USDC.address, 0)


        const u1_pAll = await _i_db.getAddressInvestment(1, addr1.address);
        const u2_pAll = await _i_db2.getAddressInvestment(1, addr2.address);

        expect(
            u1_pAll.amt == Web3Utils.toWei(`${(u1[0] + u1[1]) * 90 / 100}`, 'mwei') &&
            u2_pAll.amt == Web3Utils.toWei(`${(u2[0] + u2[1]) * 90 / 100}`, 'mwei')
        ).to.be.true;

        const db1_confirm = await _i_db.getInvestment(1);
        await _i_db.updateInvestment(
            1,
            db1_confirm.name,
            db1_confirm.data,
            db1_confirm.otc,
            db1_confirm.ppu,
            db1_confirm.alloMin,
            db1_confirm.alloTotal,
            Web3Utils.toWei(`${u1[0] + u1[1]}`, 'mwei'),
            db1_confirm.dates,
            db1_confirm.tax,
            [false, false, true, false]
        )
        const db2_confirm = await _i_db2.getInvestment(1);
        await _i_db2.updateInvestment(
            1,
            db2_confirm.name,
            db2_confirm.data,
            db2_confirm.otc,
            db2_confirm.ppu,
            db2_confirm.alloMin,
            db2_confirm.alloTotal,
            Web3Utils.toWei(`${u2[0] + u2[1]}`, 'mwei'),
            db2_confirm.dates,
            db2_confirm.tax,
            [false, false, true, false]
        )
    });
    it("Pre-refund claim check", async function () {
        const [owner, addr1, addr2] = await ethers.getSigners();

        const checkClaim1 = await _i_invest.checkClaim(1, addr1.address);
        const checkClaim2 = await _i_invest2.checkClaim(2, addr1.address);
        expect(checkClaim1.toString() === "0").to.be.true;
        expect(checkClaim2.toString() === "0").to.be.true;
    });

    it("OTC set up", async function () {
        const [owner, addr1, addr2] = await ethers.getSigners();

        const pre = await _i_db.otcChannel(10);
        await _i_db.setOtcChannel(10, 1);
        await _i_db2.setOtcChannel(10, 1);
        const post = await _i_db.otcChannel(10);
        expect(
            pre == 0 &&
            post == 1
        ).to.be.true;

        await _i_admin.addAdmin(_i_otc.address, 1)
    });
    it("OTC - make offer U1", async function () {
        const [owner, addr1, addr2] = await ethers.getSigners();

        const u1_pre = await _i_db.getAddressInvestment(1, addr1.address);
        const u2_pre = await _i_db2.getAddressInvestment(1, addr2.address);

        await _i_otc.connect(addr1).addOffer(
            10,
            `${u1_pre.amt.toNumber() / 2}`,
            `${u1_pre.amt.toNumber() * 2}`,
            _i_invest.address
        )


        const u1_allo_post = await _i_db.getAddressInvestment(1, addr1.address);
        expect(
            u1_allo_post.locked
        ).to.be.true;

        const channelIterator = await _i_otc.getIterator(10)
        expect(
            channelIterator.toNumber() == 1
        ).to.be.true;

        const deal = await _i_otc.getDeal(10, channelIterator)
        console.log("deal",deal)
        expect(
            deal.destination == "0x0000000000000000000000000000000000000000" &&
            deal.get == "0x0000000000000000000000000000000000000000" &&
            deal.source == _i_invest.address &&
            deal.set == addr1.address &&
            deal.price.toString() == `${u1_pre.amt.toNumber() * 2}` &&
            deal.amt.toString() == `${u1_pre.amt.toNumber() / 2}`
        ).to.be.true;

        await expect(_i_otc.connect(addr1).addOffer(
            10,
            Web3Utils.toWei(`100000`, 'mwei'),
            Web3Utils.toWei(`2000`, 'mwei'),
            _i_invest.address
        )).to.be.revertedWith('Locked');

    });
    it("OTC - take offer SELL", async function () {
        const [owner, addr1, addr2] = await ethers.getSigners();

        const u1_pre = await _i_db.getAddressInvestment(1, addr1.address);
        const u2_pre = await _i_db2.getAddressInvestment(1, addr2.address);

        const u1_funds_pre = await _i_USDC.balanceOf(addr1.address)
        const u2_funds_pre = await _i_USDC.balanceOf(addr2.address)

        const offerId = await _i_otc.getIterator(10);
        const deal = await _i_otc.getDeal(10, offerId);
        const fee = await _i_otc.feeOTC();

        const approveSize = fee.toNumber() + deal.price.toNumber()

        await _i_USDC.connect(addr2).approve(_i_otc.address, approveSize.toString());

        await _i_otc.connect(addr2).settleOffer(
            10,
            offerId.toNumber(),
            _i_invest2.address
        )

        const dealAfter = await _i_otc.getDeal(10, offerId);

        expect(
            dealAfter.amt.toString() == deal.amt.toString() &&
            dealAfter.price.toString() == deal.price.toString() &&
            dealAfter.set == deal.set &&
            dealAfter.get == addr2.address &&
            dealAfter.source == deal.source &&
            dealAfter.destination == _i_invest2.address
        ).to.be.true;



        await _i_USDC.connect(addr2).approve(_i_otc.address, approveSize.toString());
        await expect(_i_otc.connect(addr2).settleOffer(
            10,
            offerId.toNumber(),
            _i_invest2.address
        )).to.be.revertedWith('Taken');


        const u1_post = await _i_db.getAddressInvestment(1, addr1.address);
        const u2_post = await _i_db2.getAddressInvestment(1, addr2.address);

        const u1_diff_invest = u1_pre.amt.toNumber() - u1_post.amt.toNumber()
        const u2_diff_invest = u2_post.amt.toNumber() - u2_pre.amt.toNumber()
        expect(
            `${u1_diff_invest}` == `${u1_pre.amt.toNumber() / 2}` &&
            `${u2_diff_invest}` == `${u1_pre.amt.toNumber() / 2}`
        ).to.be.true;


        const u1_funds_post = await _i_USDC.balanceOf(addr1.address)
        const u2_funds_post = await _i_USDC.balanceOf(addr2.address)

        const u1_diff_funds = u1_funds_post.toNumber() - u2_funds_pre.toNumber()
        const u2_diff_funds = u2_funds_pre.toNumber() - u2_funds_post.toNumber() - fee.toNumber()

        expect(
            `${u2_diff_funds}` == `${u1_pre.amt.toNumber() * 2}` &&
            `${u1_diff_funds}` == `${u1_pre.amt.toNumber() * 2}`
        ).to.be.true;
    });


});
