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
let i3_t1;
let i3_t2;
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
    it("Add 3 investments", async function () {
        const offer1 = examples.investments[1];
        const offer2 = examples.investments[2];
        const offer3 = examples.investments[3];

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
        //invest3
        const i3_start = timestampNow + i1_delay
        const i3_end = timestampNow + i1_delay * 2
        i3_t1 = i3_start
        i3_t2 = i3_end

        await _i_db.addInvestment(
            1,
            offer1.name,
            offer1.data,
            offer1.otc,
            offer1.ppu,
            offer1.alloMin,
            offer1.alloTotal,
            [i1_start, i1_end],
            offer1.tax,
            offer1.state,
        )
        await _i_db.addInvestment(
            2,
            offer2.name,
            offer2.data,
            offer2.otc,
            offer2.ppu,
            offer2.alloMin,
            offer2.alloTotal,
            [i3_start, i3_end],
            offer2.tax,
            offer2.state,
        )
        await _i_db.addInvestment(
            3,
            offer3.name,
            offer3.data,
            offer3.otc,
            offer3.ppu,
            offer3.alloMin,
            offer3.alloTotal,
            [i3_start, i3_end],
            offer3.tax,
            offer3.state,
        )

        const investmentData = await _i_db.getInvestment(3);
        // console.log("inv",investmentData)
        expect(
            investmentData.name === offer3.name &&
            investmentData.data == offer3.data &&
            investmentData.otc == offer3.otc &&
            investmentData.ppu == offer3.ppu &&
            investmentData.alloMin == offer3.alloMin &&
            investmentData.alloTotal == offer3.alloTotal &&
            investmentData.tax == offer3.tax &&
            investmentData.dates[0].toString() == i3_start.toString() &&
            investmentData.dates[1].toString() == i3_end.toString() &&
            JSON.stringify(investmentData.state) == JSON.stringify(offer3.state)
        ).to.be.true;

    });
    it("Modify Test Investment", async function () {
        const offer2 = examples.investments[2];

        await _i_db.updateInvestment(
            3,
            offer2.name,
            offer2.data,
            offer2.otc,
            offer2.ppu,
            offer2.alloMin,
            offer2.alloTotal,
            Web3Utils.toWei('200000', 'mwei'),
            [i1_t1, i1_t2],
            offer2.tax,
            offer2.state,
        )

        const investmentData = await _i_db.getInvestment(3);
        expect(
            investmentData.name === offer2.name &&
            investmentData.data == offer2.data &&
            investmentData.otc == offer2.otc &&
            investmentData.ppu == offer2.ppu &&
            investmentData.alloMin == offer2.alloMin &&
            investmentData.alloTotal == offer2.alloTotal &&
            investmentData.alloRaised == Web3Utils.toWei('200000', 'mwei') &&
            investmentData.tax == offer2.tax &&
            investmentData.dates[0].toString() == i1_t1.toString() &&
            investmentData.dates[1].toString() == i1_t2.toString() &&
            JSON.stringify(investmentData.state) == JSON.stringify(offer2.state)
        ).to.be.true;

    });
    it("Delete Test Investment", async function () {

        await _i_db.deleteInvestment(3);
        const investmentData = await _i_db.getInvestment(3);

        expect(investmentData.name == '' && investmentData.tax == 0).to.be.true;
    });
    it("Invest requires", async function () {
        const [owner, addr1, addr2] = await ethers.getSigners();
// const u1 = [5000, 9000, 7000];
// const u2 = [2000, 5000, 3000];

        //give out money
        await _i_USDC.transfer(addr1.address, Web3Utils.toWei('100000', 'mwei'));
        await _i_USDC.transfer(addr2.address, Web3Utils.toWei('100000', 'mwei'));
        await _i_USDT.transfer(addr1.address, Web3Utils.toWei('100000', 'mwei'));
        await _i_USDT.transfer(addr2.address, Web3Utils.toWei('100000', 'mwei'));


        //---citizen test
        await expect(_i_invest.invest(
            1,
            Web3Utils.toWei(`${u1[0]}`, 'mwei'),
            _i_USDC.address,
            0
        )).to.be.revertedWith('Citizen');


        //----pause test
        await expect(_i_invest.connect(addr1).invest(
            1,
            Web3Utils.toWei(`${u1[0]}`, 'mwei'),
            _i_USDC.address,
            0
        )).to.be.revertedWith('Paused');
        const iD = await _i_db.getInvestment(1);
        await _i_db.updateInvestment(
            1,
            iD.name,
            iD.data,
            iD.otc,
            iD.ppu,
            iD.alloMin,
            iD.alloTotal,
            iD.alloRaised,
            [i3_t1, i3_t2],
            iD.tax,
            [false, false, false, false]
        )


        //----amt to low test
        await expect(_i_invest.connect(addr1).invest(
            1,
            Web3Utils.toWei(`100`, 'mwei'),
            _i_USDC.address,
            0
        )).to.be.revertedWith('Amt. too small.');


        //----wrong token
        await expect(_i_invest.connect(addr1).invest(
            1,
            Web3Utils.toWei(`${u1[0]}`, 'mwei'),
            _i_admin.address,
            0
        )).to.be.revertedWith('Wrong token payment');


        //----bad date - to early
        await expect(_i_invest.connect(addr1).invest(
            1,
            Web3Utils.toWei(`${u1[0]}`, 'mwei'),
            _i_USDT.address,
            0
        )).to.be.revertedWith('Bad date');

        //----bad date - to late
        const iD2 = await _i_db.getInvestment(1);
        await _i_db.updateInvestment(
            1,
            iD2.name,
            iD2.data,
            iD2.otc,
            iD2.ppu,
            iD2.alloMin,
            iD2.alloTotal,
            iD2.alloRaised,
            [i1_t1 - 1000, i1_t1],
            iD2.tax,
            iD2.state
        )

        await expect(_i_invest.connect(addr1).invest(
            1,
            Web3Utils.toWei(`${u1[0]}`, 'mwei'),
            _i_USDT.address,
            0
        )).to.be.revertedWith('Bad date');


        //----good date
        const iD3 = await _i_db.getInvestment(1);
        await _i_db.updateInvestment(
            1,
            iD3.name,
            iD3.data,
            iD3.otc,
            iD3.ppu,
            iD3.alloMin,
            iD3.alloTotal,
            iD3.alloRaised,
            [i1_t1, i1_t2],
            iD3.tax,
            iD3.state
        )

        //bad phase
        await expect(_i_invest.connect(addr1).invest(
            1,
            Web3Utils.toWei(`${u1[0]}`, 'mwei'),
            _i_USDT.address,
            1
        )).to.be.revertedWith('Wrong type');


        //i1u1
        await expect(_i_invest.connect(addr1).claim(1)).to.be.revertedWith('Not participated');
    });
    it("Investment unlimited", async function () {
        const [owner, addr1, addr2] = await ethers.getSigners();
// const u1 = [5000, 9000, 7000];
// const u2 = [USDC, USDT, USDC];
// const u2 = [2000, 5000, 3000];
// const u2 = [USDT, USDC, USDT];
//---u2
        await _i_USDT.connect(addr2).approve(_i_invest.address, Web3Utils.toWei(`${u2[0]}`, 'mwei'));
        await _i_invest.connect(addr2).invest(1, Web3Utils.toWei(`${u2[0]}`, 'mwei'), _i_USDT.address, 0)

        await _i_USDC.connect(addr2).approve(_i_invest.address, Web3Utils.toWei(`${u2[1]}`, 'mwei'));
        await _i_invest.connect(addr2).invest(1, Web3Utils.toWei(`${u2[1]}`, 'mwei'), _i_USDC.address, 0)

        await _i_USDT.connect(addr2).approve(_i_invest.address, Web3Utils.toWei(`${u2[2]}`, 'mwei'));
        await _i_invest.connect(addr2).invest(1, Web3Utils.toWei(`${u2[2]}`, 'mwei'), _i_USDT.address, 0)

        const u2_pAll = await _i_db.getAddressInvestment(1, addr2.address);

        const u2_total = u2[0] + u2[1] + u2[2]
        const u2_allo = u2_total * 90 / 100
        expect(
            u2_pAll.refund === 0 &&
            u2_pAll.amtRefund.toString() == "0" &&
            !u2_pAll.locked &&
            u2_pAll.amt == Web3Utils.toWei(`${u2_allo}`, 'mwei')
        ).to.be.true;
        expect(await _i_USDC.balanceOf(_i_invest.address)).to.equal(Web3Utils.toWei('5000', 'mwei'));
        expect(await _i_USDT.balanceOf(_i_invest.address)).to.equal(Web3Utils.toWei('5000', 'mwei'));

        //---u1
        await _i_USDC.connect(addr1).approve(_i_invest.address, Web3Utils.toWei(`${u1[0]}`, 'mwei'));
        await _i_invest.connect(addr1).invest(1, Web3Utils.toWei(`${u1[0]}`, 'mwei'), _i_USDC.address, 0)
        const u1_p1 = await _i_db.getAddressInvestment(1, addr1.address);
        const shouldbe = u1[0] * 90 / 100
        const shouldbeWei = Web3Utils.toWei(`${shouldbe}`, 'mwei')
        expect(!u1_p1.locked && u1_p1.refund == 0 && u1_p1.amtRefund.toString() == "0" && u1_p1.amt.toString() == shouldbeWei.toString()).to.be.true;

        await _i_USDT.connect(addr1).approve(_i_invest.address, Web3Utils.toWei(`${u1[1]}`, 'mwei'));
        await _i_invest.connect(addr1).invest(1, Web3Utils.toWei(`${u1[1]}`, 'mwei'), _i_USDT.address, 0)

        await _i_USDC.connect(addr1).approve(_i_invest.address, Web3Utils.toWei(`${u1[2]}`, 'mwei'));
        await _i_invest.connect(addr1).invest(1, Web3Utils.toWei(`${u1[2]}`, 'mwei'), _i_USDC.address, 0)

        expect(await _i_USDC.balanceOf(_i_invest.address)).to.equal(Web3Utils.toWei('17000', 'mwei'));
        expect(await _i_USDT.balanceOf(_i_invest.address)).to.equal(Web3Utils.toWei('14000', 'mwei'));

    });
    it("Investment phases", async function () {

        //----good date
        const iD2 = await _i_db.getInvestment(2);
        await _i_db.updateInvestment(
            2,
            iD2.name,
            iD2.data,
            iD2.otc,
            iD2.ppu,
            iD2.alloMin,
            iD2.alloTotal,
            iD2.alloRaised,
            [i1_t1, i1_t2],
            iD2.tax,
            [true, false, false, false]
        )

        const [owner, addr1, addr2] = await ethers.getSigners();
        // const u1 = [5000, 9000, 7000];
        // const u2 = [USDC, USDT, USDC];
        // const u2 = [2000, 5000, 3000];
        // const u2 = [USDT, USDC, USDT];

        //---u2
        await _i_USDT.connect(addr2).approve(_i_invest.address, Web3Utils.toWei(`${u2[0]}`, 'mwei'));
        await _i_invest.connect(addr2).invest(2, Web3Utils.toWei(`${u2[0]}`, 'mwei'), _i_USDT.address, 1)
        await expect(_i_invest.connect(addr2).invest(2, Web3Utils.toWei(`${u2[0]}`, 'mwei'), _i_USDT.address, 1)).to.be.revertedWith('Filled');

        await _i_USDC.connect(addr2).approve(_i_invest.address, Web3Utils.toWei(`${u2[1]}`, 'mwei'));
        await _i_invest.connect(addr2).invest(2, Web3Utils.toWei(`${u2[1]}`, 'mwei'), _i_USDC.address, 2)

        await _i_USDT.connect(addr2).approve(_i_invest.address, Web3Utils.toWei(`${u2[2]}`, 'mwei'));
        await _i_invest.connect(addr2).invest(2, Web3Utils.toWei(`${u2[2]}`, 'mwei'), _i_USDT.address, 3)

        const i2_u2_pAll = await _i_db.getAddressInvestment(2, addr2.address);

        const i2_u2_total = u2[0] + u2[1] + u2[2]
        const i2_u2_allo = i2_u2_total * 95 / 100
        expect(
            i2_u2_pAll.refund === 0 &&
            i2_u2_pAll.amtRefund.toString() == "0" &&
            !i2_u2_pAll.locked &&
            i2_u2_pAll.amt == Web3Utils.toWei(`${i2_u2_allo}`, 'mwei')
        ).to.be.true;
        expect(await _i_USDC.balanceOf(_i_invest.address)).to.equal(Web3Utils.toWei('22000', 'mwei'));
        expect(await _i_USDT.balanceOf(_i_invest.address)).to.equal(Web3Utils.toWei('19000', 'mwei'));

        //---u1
        await _i_USDC.connect(addr1).approve(_i_invest.address, Web3Utils.toWei(`${u1[0]}`, 'mwei'));
        await _i_invest.connect(addr1).invest(2, Web3Utils.toWei(`${u1[0]}`, 'mwei'), _i_USDC.address, 1)
        const i2_u1_p1 = await _i_db.getAddressInvestment(2, addr1.address);
        const shouldbe = u1[0] * 95 / 100
        const shouldbeWei = Web3Utils.toWei(`${shouldbe}`, 'mwei')
        expect(!i2_u1_p1.locked && i2_u1_p1.refund == 0 && i2_u1_p1.amtRefund.toString() == "0" && i2_u1_p1.amt.toString() == shouldbeWei.toString()).to.be.true;

        await _i_USDT.connect(addr1).approve(_i_invest.address, Web3Utils.toWei(`${u1[1]}`, 'mwei'));
        await _i_invest.connect(addr1).invest(2, Web3Utils.toWei(`${u1[1]}`, 'mwei'), _i_USDT.address, 2)

        await _i_USDC.connect(addr1).approve(_i_invest.address, Web3Utils.toWei(`${u1[2]}`, 'mwei'));
        await _i_invest.connect(addr1).invest(2, Web3Utils.toWei(`${u1[2]}`, 'mwei'), _i_USDC.address, 3)

        expect(await _i_USDC.balanceOf(_i_invest.address)).to.equal(Web3Utils.toWei('34000', 'mwei'));
        expect(await _i_USDT.balanceOf(_i_invest.address)).to.equal(Web3Utils.toWei('28000', 'mwei'));

    });
    it("Pre-refund claim check", async function () {
        const [owner, addr1, addr2] = await ethers.getSigners();

        const checkClaim = await _i_invest.checkClaim(1, addr1.address);
        expect(checkClaim.toString() === "0").to.be.true;

        await expect(_i_invest.claim(1)).to.be.revertedWith('Citizen');

    });
    it("Refund", async function () {
        const [owner, addr1, addr2] = await ethers.getSigners();

        // const u1 = [5000, 9000, 7000];
        // const u2 = [USDC, USDT, USDC];
        // const u2 = [2000, 5000, 3000];
        // const u2 = [USDT, USDC, USDT];

        await _i_db.setRefund(1, [addr1.address, addr2.address], [Web3Utils.toWei(`${u1[2] * 90 / 100}`, 'mwei'), Web3Utils.toWei(`${u2[2] * 90 / 100}`, 'mwei')], 1);
        const i1_u1_ref1 = await _i_db.getAddressInvestment(1, addr1.address);
        const i1_u2_ref1 = await _i_db.getAddressInvestment(1, addr2.address);
        expect(i1_u1_ref1.refund == 1 && i1_u1_ref1.amtRefund.toString() == Web3Utils.toWei(`${u1[2] * 90 / 100}`, 'mwei').toString()).to.be.true;
        expect(i1_u2_ref1.refund == 1 && i1_u2_ref1.amtRefund.toString() == Web3Utils.toWei(`${u2[2] * 90 / 100}`, 'mwei').toString()).to.be.true;

        await expect(_i_invest.refund(1, _i_USDT.address)).to.be.revertedWith('Refund not enabled');


        const amtPre = await _i_USDC.balanceOf(addr1.address)
        const amtPre_inv = await _i_USDC.balanceOf(_i_invest.address)
        await _i_invest.connect(addr1).refund(1, _i_USDC.address);
        const amtPost = await _i_USDC.balanceOf(addr1.address)
        const amtPost_inv = await _i_USDC.balanceOf(_i_invest.address)

        const i1_u1_ref2 = await _i_db.getAddressInvestment(1, addr1.address);

        const amtDiff = amtPost.toNumber() - amtPre.toNumber()
        const amtDiff_inv = amtPre_inv.toNumber() - amtPost_inv.toNumber()

        expect(
            amtDiff == amtDiff_inv &&
            amtDiff.toString() == Web3Utils.toWei(`${u1[2]}`, 'mwei')
        ).to.be.true;

        const left = (u1[0] + u1[1]) * 90 / 100
        expect(
            i1_u1_ref2.refund == 2 &&
            i1_u1_ref2.amtRefund.toString() == "0" &&
            i1_u1_ref2.amt == Web3Utils.toWei(`${left}`, 'mwei')
        ).to.be.true;

        await expect(_i_invest.connect(addr2).claim(1)).to.be.revertedWith('Refund');


        const checkC = u1[0] + u2[1] + (u1[0] + u1[2] + u2[1])
        const checkT = u1[1] + u2[0] + u2[2] + (u1[1] + u2[0] + u2[2])
        const inv_fundCheckC = await _i_USDC.balanceOf(_i_invest.address)
        const inv_fundCheckT = await _i_USDT.balanceOf(_i_invest.address)

        expect(
            Web3Utils.toWei(`${checkC}`, 'mwei') == inv_fundCheckC.toString() &&
            Web3Utils.toWei(`${checkT}`, 'mwei') == inv_fundCheckT.toString()
        ).to.be.true;

    });
    it("Add payouts", async function () {
        const [owner, addr1, addr2] = await ethers.getSigners();
        const amtPre = await _i_USDC.balanceOf(_i_payouts.address)
        // const u1 = [5000, 9000, 7000];
        // const u2 = [USDC, USDT, USDC];
        // const u2 = [2000, 5000, 3000];
        // const u2 = [USDT, USDC, USDT];
        await _i_USDC.approve(_i_payouts.address, Web3Utils.toWei(`100000`, 'mwei'));
        await _i_payouts.addPayout(1, Web3Utils.toWei(`100000`, 'mwei'), _i_USDC.address);
        const i_payout = await _i_payouts.getInvestmentPayouts(1);
        expect(
            i_payout.amt.toString() === Web3Utils.toWei(`100000`, 'mwei') &&
            i_payout.iterator == 1 &&
            i_payout.currency == _i_USDC.address &&
            i_payout.payouts[0].amt.toString() == Web3Utils.toWei(`100000`, 'mwei')
        ).to.be.true;

        //update global payout
        await _i_payouts.updateGlobalPayout(1, Web3Utils.toWei(`110000`, 'mwei'), 2, _i_USDT.address);
        const i_payout2 = await _i_payouts.getInvestmentPayouts(1);
        expect(
            i_payout2.amt.toString() === Web3Utils.toWei(`110000`, 'mwei') &&
            i_payout2.iterator == 2 &&
            i_payout2.currency == _i_USDT.address
        ).to.be.true;

        //update specific payout
        await _i_payouts.updateSinglePayout(1, 0, Web3Utils.toWei(`110000`, 'mwei'), 1665163107);
        const i_payout3 = await _i_payouts.getInvestmentPayouts(1);
        expect(
            i_payout3.payouts[0].amt.toString() === Web3Utils.toWei(`110000`, 'mwei') &&
            i_payout3.payouts[0].date == 1665163107
        ).to.be.true;

        //go back to defaults
        await _i_payouts.updateGlobalPayout(1, Web3Utils.toWei(`100000`, 'mwei'), 1, _i_USDC.address);
        await _i_payouts.updateSinglePayout(1, 0, Web3Utils.toWei(`100000`, 'mwei'), i_payout.payouts[0].date);

        const amtPost = await _i_USDC.balanceOf(_i_payouts.address)
        expect(
            amtPost.toNumber() - amtPre.toNumber() == Number(Web3Utils.toWei(`100000`, 'mwei'))
        ).to.be.true;

    });
    it("Settle investment and check claims", async function () {
        const [owner, addr1, addr2] = await ethers.getSigners();
        // const u1 = [5000, 9000, 7000];
        // const u2 = [USDC, USDT, USDC];
        // const u2 = [2000, 5000, 3000];
        // const u2 = [USDT, USDC, USDT];

        await _i_db.setOfferState(1, [false, true, true, false]);
        const investmentDataState = await _i_db.getInvestment(1);
        expect(
            !investmentDataState.state[0] &&
            investmentDataState.state[1] &&
            investmentDataState.state[2] &&
            !investmentDataState.state[3]
        ).to.be.true;


        const invested = u1[0] + u1[1] + u2[0] + u2[1]
        const investmentData = await _i_db.getInvestment(1);
        await _i_db.updateInvestment(
            1,
            investmentData.name,
            investmentData.data,
            investmentData.otc,
            investmentData.ppu,
            investmentData.alloMin,
            investmentData.alloTotal,
            Web3Utils.toWei(`${invested * 90 / 100}`, 'mwei'),
            investmentData.dates,
            investmentData.tax,
            investmentData.state,
        )

        const investmentData2 = await _i_db.getInvestment(1);


        expect(
            investmentData2.alloRaised.toString() == Web3Utils.toWei(`${invested * 90 / 100}`, 'mwei'),
        ).to.be.true;

        // //check claim
        const getAddressInvestment = await _i_db.getAddressInvestment(1, addr1.address);

        const checkClaim1 = await _i_invest.checkClaim(1, addr1.address);
        const checkClaim2 = await _i_invest.checkClaim(1, addr2.address);
        expect(
            checkClaim1.toString() == "66666666666" &&
            checkClaim2.toString() == "47619047619"
        ).to.be.true;
    });
    it("Claim - address1", async function () {
        const [owner, addr1, addr2] = await ethers.getSigners();
        // const u1 = [5000, 9000, 7000];
        // const u2 = [USDC, USDT, USDC];
        // const u2 = [2000, 5000, 3000];
        // const u2 = [USDT, USDC, USDT];

        const amtPre = await _i_USDC.balanceOf(addr1.address)
        await _i_invest.connect(addr1).claim(1);
        const amtPost = await _i_USDC.balanceOf(addr1.address)

        const diff = amtPost.toNumber() - amtPre.toNumber()
        const checkClaim1 = await _i_invest.checkClaim(1, addr1.address);
        const payouts = await _i_payouts.getAddressPayouts(1, addr1.address)

        expect(
            diff == 66666666666 &&
            checkClaim1 == "0" &&
            payouts[0]
        ).to.be.true;

    });
    it("Add payout 2 & 3 & batch settle", async function () {
        const [owner, addr1, addr2] = await ethers.getSigners();

        const amtPre = await _i_USDC.balanceOf(_i_payouts.address)
        await _i_USDC.approve(_i_payouts.address, Web3Utils.toWei(`20000`, 'mwei'));
        await _i_payouts.addPayout(1, Web3Utils.toWei(`20000`, 'mwei'), _i_USDC.address);

        await _i_USDC.approve(_i_payouts.address, Web3Utils.toWei(`150000`, 'mwei'));
        await _i_payouts.addPayout(1, Web3Utils.toWei(`150000`, 'mwei'), _i_USDC.address);
        const amtPost = await _i_USDC.balanceOf(_i_payouts.address)
        const amtDiff = amtPost.toNumber() - amtPre.toNumber()
        expect(amtDiff == 170000000000).to.be.true;

        const i_payout = await _i_payouts.getInvestmentPayouts(1);
        expect(i_payout.iterator == 3 && i_payout.payouts.length == 3).to.be.true;

        const checkClaim1 = await _i_invest.checkClaim(1, addr1.address);

        const amtPre_u1 = await _i_USDC.balanceOf(addr1.address)
        await _i_invest.connect(addr1).claim(1);
        const amtPost_u1 = await _i_USDC.balanceOf(addr1.address)
        const amtDiff_u1 = amtPost_u1.toNumber() - amtPre_u1.toNumber()
        // const amtDiff_u1 = amtPre_u1.toNumber() - amtPost_u1.toNumber()

        const amtPostClaim = await _i_USDC.balanceOf(_i_payouts.address)
        const amtDiff_final = amtPost.toNumber() - amtPostClaim.toNumber()

        const checkClaim2 = await _i_invest.checkClaim(1, addr1.address);

        expect(
            amtDiff_u1 == 113333333333 &&
            amtDiff_final == 113333333333 &&
            checkClaim1 == 113333333333 &&
            checkClaim2 == 0
        ).to.be.true;

        const payouts = await _i_payouts.getAddressPayouts(1, addr1.address)
        expect(
            payouts[0] &&
            payouts[1] &&
            payouts[2] &&
            !payouts[3] &&
            !payouts[4] &&
            !payouts[5]
        ).to.be.true;
    });
    it("Reassign", async function () {
        const [owner, addr1, addr2] = await ethers.getSigners();

        await expect(_i_invest.connect(addr2).reassign(1, addr2.address, addr1.address)).to.be.revertedWith('Refund')
        await expect(_i_invest.connect(addr1).reassign(1, addr1.address, addr2.address)).to.be.revertedWith('Exist')

        const _u1_old = await _i_db.getAddressInvestment(1, addr1.address)
        const _u1_new = await _i_db.getAddressInvestment(1, examples.addresses[3])

        const _u1_p_old = await _i_payouts.getAddressPayouts(1, addr1.address)
        const _u1_p_new = await _i_payouts.getAddressPayouts(1, examples.addresses[3])

        const _u1_pc_old = await _i_invest.getAddressPhaseInvested(1, addr1.address)
        const _u1_pc_new = await _i_invest.getAddressPhaseInvested(1, examples.addresses[3])


        await _i_USDC.connect(addr1).approve(_i_invest.address, Web3Utils.toWei(`50`, 'mwei'));
        await _i_invest.connect(addr1).reassign(1, addr1.address, examples.addresses[3]);

        const u1_old = await _i_db.getAddressInvestment(1, addr1.address)
        const u1_new = await _i_db.getAddressInvestment(1, examples.addresses[3])

        const u1_p_old = await _i_payouts.getAddressPayouts(1, addr1.address)
        const u1_p_new = await _i_payouts.getAddressPayouts(1, examples.addresses[3])

        const u1_pc_old = await _i_invest.getAddressPhaseInvested(1, addr1.address)
        const u1_pc_new = await _i_invest.getAddressPhaseInvested(1, examples.addresses[3])


        expect(
            JSON.stringify(_u1_old) === JSON.stringify(u1_new) &&
            JSON.stringify(_u1_new) === JSON.stringify(u1_old) &&
            JSON.stringify(_u1_p_old) === JSON.stringify(u1_p_new) &&
            JSON.stringify(_u1_p_new) === JSON.stringify(u1_p_old) &&
            JSON.stringify(_u1_pc_old) === JSON.stringify(u1_pc_new) &&
            JSON.stringify(_u1_pc_new) === JSON.stringify(u1_pc_old)
        ).to.be.true;
    });
    it("OTC set up", async function () {
        const [owner, addr1, addr2] = await ethers.getSigners();

        const pre = await _i_db.otcChannel(10);
        await _i_db.setOtcChannel(10, 1);
        const post = await _i_db.otcChannel(10);
        expect(
            pre == 0 &&
            post == 1
        ).to.be.true;

        const offer1 = examples.investments[4];
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
        await _i_db2.addInvestment(
            1,
            offer1.name,
            offer1.data,
            offer1.otc,
            offer1.ppu,
            offer1.alloMin,
            offer1.alloTotal,
            [i1_start, i1_end],
            offer1.tax,
            offer1.state,
        )
        await _i_db2.setOtcChannel(10, 1);
        await _i_USDC.connect(addr2).approve(_i_invest2.address, Web3Utils.toWei(`1000`, 'mwei'));
        await _i_invest2.connect(addr2).invest(1, Web3Utils.toWei(`1000`, 'mwei'), _i_USDC.address, 0)

        await _i_USDC.connect(addr1).approve(_i_invest2.address, Web3Utils.toWei(`5000`, 'mwei'));
        await _i_invest2.connect(addr1).invest(1, Web3Utils.toWei(`5000`, 'mwei'), _i_USDC.address, 0)

    });
    it("OTC requires tests", async function () {
        const [owner, addr1, addr2] = await ethers.getSigners();
        await expect(_i_otc.connect(addr1).addOffer(
            10,
            Web3Utils.toWei(`100000`, 'mwei'),
            Web3Utils.toWei(`2000`, 'mwei'),
            _i_invest.address
        )).to.be.revertedWith('NA');
        await _i_admin.addAdmin(_i_otc.address, 1)


        await expect(_i_otc.connect(addr2).addOffer(
            10,
            Web3Utils.toWei(`100000`, 'mwei'),
            Web3Utils.toWei(`2000`, 'mwei'),
            _i_invest.address
        )).to.be.revertedWith('Refund');

        await _i_invest.connect(addr2).refund(1, _i_USDC.address);


        await expect(_i_otc.connect(addr2).addOffer(
            10,
            Web3Utils.toWei(`100000`, 'mwei'),
            Web3Utils.toWei(`2000`, 'mwei'),
            _i_invest.address
        )).to.be.revertedWith('Claim');

        const u2_allo_pre = await _i_db.getAddressInvestment(1, addr2.address);
        const checkClaim2 = await _i_invest.checkClaim(1, addr2.address);
        await _i_invest.connect(addr2).claim(1);
        expect(
            checkClaim2.toString() == "89999999999"
        ).to.be.true;


        await expect(_i_otc.connect(addr2).addOffer(
            10,
            Web3Utils.toWei(`100000`, 'mwei'),
            Web3Utils.toWei(`2000`, 'mwei'),
            _i_invest.address
        )).to.be.revertedWith('Rejected');

    });
    it("OTC - make offer SELL", async function () {
        const [owner, addr1, addr2] = await ethers.getSigners();

        const u2_allo_pre = await _i_db.getAddressInvestment(1, addr2.address);

        await expect(_i_otc.connect(addr2).addOffer(
            10,
            Web3Utils.toWei(`100000`, 'mwei'),
            Web3Utils.toWei(`2000`, 'mwei'),
            _i_invest.address
        )).to.be.revertedWith('Rejected');


        //make offer from addr2
        await _i_otc.connect(addr2).addOffer(
            10,
            `${u2_allo_pre.amt.toNumber() / 2}`,
            Web3Utils.toWei(`5000`, 'mwei'),
            _i_invest.address
        )

        const u2_allo_post = await _i_db.getAddressInvestment(1, addr2.address);
        expect(
            u2_allo_post.locked
        ).to.be.true;

        const channelIterator = await _i_otc.getIterator(10)
        expect(
            channelIterator.toNumber() == 1
        ).to.be.true;

        const deal = await _i_otc.getDeal(10, channelIterator)
        expect(
            deal.destination == "0x0000000000000000000000000000000000000000" &&
            deal.get == "0x0000000000000000000000000000000000000000" &&
            deal.source == _i_invest.address &&
            deal.set == addr2.address &&
            deal.price.toString() == Web3Utils.toWei(`5000`, 'mwei') &&
            deal.amt.toString() == `${u2_allo_pre.amt.toNumber() / 2}`
        ).to.be.true;

        await expect(_i_otc.connect(addr2).addOffer(
            10,
            Web3Utils.toWei(`100000`, 'mwei'),
            Web3Utils.toWei(`2000`, 'mwei'),
            _i_invest.address
        )).to.be.revertedWith('Locked');

    });
    it("OTC - take offer SELL", async function () {
        const [owner, addr1, addr2] = await ethers.getSigners();

        const i1_u2_allo_pre = await _i_db.getAddressInvestment(1, addr2.address);
        const i2_u1_allo_pre = await _i_db2.getAddressInvestment(1, addr1.address);


        const funds_user_pre = await _i_USDC.balanceOf(addr2.address)

        const offerId = await _i_otc.getIterator(10);
        const deal = await _i_otc.getDeal(10, offerId);
        const fee = await _i_otc.feeOTC();

        const approveSize = fee.toNumber() + deal.price.toNumber()

        await _i_USDC.connect(addr1).approve(_i_otc.address, approveSize.toString());
        await _i_otc.connect(addr1).settleOffer(
            10,
            offerId.toNumber(),
            _i_invest2.address
        )

        const dealAfter = await _i_otc.getDeal(10, offerId);

        expect(
            dealAfter.amt.toString() == deal.amt.toString() &&
            dealAfter.price.toString() == deal.price.toString() &&
            dealAfter.set == deal.set &&
            dealAfter.get == addr1.address &&
            dealAfter.source == deal.source &&
            dealAfter.destination == _i_invest2.address
        ).to.be.true;



        await _i_USDC.connect(addr1).approve(_i_otc.address, approveSize.toString());
        await expect(_i_otc.connect(addr1).settleOffer(
            10,
            offerId.toNumber(),
            _i_invest2.address
        )).to.be.revertedWith('Taken');


        const i1_u2_allo_post = await _i_db.getAddressInvestment(1, addr2.address);
        const i2_u1_allo_post = await _i_db2.getAddressInvestment(1, addr1.address);

        expect(
            i1_u2_allo_post.amt.toString() == (i1_u2_allo_pre.amt.toNumber() / 2).toString() &&
            i2_u1_allo_post.amt.toString() == (i1_u2_allo_pre.amt.toNumber() / 2 + i2_u1_allo_pre.amt.toNumber()).toString() &&
            !i1_u2_allo_post.locked &&
            !i2_u1_allo_post.locked
        ).to.be.true;

        const funds_contract = await _i_USDC.balanceOf(examples.addresses[3])
        const funds_user_post = await _i_USDC.balanceOf(addr2.address)
        const diff = funds_user_post.toNumber() - funds_user_pre.toNumber()

        expect(
            funds_contract.toString() == Web3Utils.toWei("100", 'mwei') &&
            diff.toString() == Web3Utils.toWei("5000", 'mwei')
        ).to.be.true;
    });
    it("OTC - add & remove offer", async function () {
        const [owner, addr1, addr2] = await ethers.getSigners();

        const u2_allo_pre = await _i_db.getAddressInvestment(1, addr2.address);

        //make offer from addr2
        await _i_otc.connect(addr2).addOffer(
            10,
            `${u2_allo_pre.amt.toNumber()}`,
            Web3Utils.toWei(`5000`, 'mwei'),
            _i_invest.address
        )

        const u2_allo_post = await _i_db.getAddressInvestment(1, addr2.address);
        expect(
            u2_allo_post.locked
        ).to.be.true;

        const offerId = await _i_otc.getIterator(10);

        //remove offer from addr2
        await _i_otc.connect(addr2).removeOffer(
            10,
            offerId,
            _i_invest.address
        )
        const u2_allo_post2 = await _i_db.getAddressInvestment(1, addr2.address);

        expect(
            !u2_allo_post2.locked &&
            u2_allo_post2.amt.toString() == u2_allo_post.amt.toString()
        ).to.be.true;

    });
    it("OTC - make & take offer - BUY", async function () {
        const [owner, addr1, addr2] = await ethers.getSigners();

        const i1_BUY_allo_pre = await _i_db.getAddressInvestment(1, addr1.address);
        // const i1_u2_allo_pre = await _i_invest.getAddressInvestment(1, addr2.address);
        // const i2_u1_allo_pre = await _i_invest2.getAddressInvestment(1, addr1.address);
        const i2_SELL_allo_pre = await _i_db2.getAddressInvestment(1, addr2.address);


        await expect(_i_otc.connect(addr2).addOffer(
            10,
            Web3Utils.toWei(`${i2_SELL_allo_pre.amt}`, 'mwei'),
            Web3Utils.toWei(`4000`, 'mwei'),
            _i_invest2.address
        )).to.be.revertedWith('Rejected');



        //make offer from addr2
        await _i_otc.connect(addr2).addOffer(
            10,
            `${i2_SELL_allo_pre.amt}`,
            Web3Utils.toWei(`4000`, 'mwei'),
            _i_invest2.address
        )

        const u2_allo_post = await _i_db2.getAddressInvestment(1, addr2.address);
        expect(
            u2_allo_post.locked
        ).to.be.true;

        const channelIterator = await _i_otc.getIterator(10)

        const deal = await _i_otc.getDeal(10, channelIterator)
        expect(
            deal.destination == "0x0000000000000000000000000000000000000000" &&
            deal.get == "0x0000000000000000000000000000000000000000" &&
            deal.source == _i_invest2.address &&
            deal.set == addr2.address &&
            deal.price.toString() == Web3Utils.toWei(`4000`, 'mwei') &&
            deal.amt.toString() == `${i2_SELL_allo_pre.amt}`
        ).to.be.true;

        await expect(_i_otc.connect(addr2).addOffer(
            10,
            Web3Utils.toWei(`100000`, 'mwei'),
            Web3Utils.toWei(`2000`, 'mwei'),
            _i_invest2.address
        )).to.be.revertedWith('Locked');


        //take
        const funds_user_pre_a1 = await _i_USDC.balanceOf(addr1.address)
        const funds_user_pre_a2 = await _i_USDC.balanceOf(addr2.address)

        const fee = await _i_otc.feeOTC();
        const approveSize = fee.toNumber() + deal.price.toNumber()


        const test = await _i_invest.checkClaim(1, addr1.address);
        const test2 = await _i_invest2.checkClaim(1, addr2.address);

        // await _i_invest.connect(addr1).claim(1);

        const addr = await _i_invest.connect(addr1).checkClaim(1, addr1.address);

        await _i_USDC.connect(addr1).approve(_i_otc.address, approveSize.toString());
        await _i_otc.connect(addr1).settleOffer(
            10,
            channelIterator.toNumber(),
            _i_invest.address
        )

        const dealAfter = await _i_otc.getDeal(10, channelIterator);

        expect(
            dealAfter.amt.toString() == deal.amt.toString() &&
            dealAfter.price.toString() == deal.price.toString() &&
            dealAfter.set == deal.set &&
            dealAfter.get == addr1.address &&
            dealAfter.source == deal.source &&
            dealAfter.destination == _i_invest.address
        ).to.be.true;

        const i1_BUY_allo_post = await _i_db.getAddressInvestment(1, addr1.address);
        // const i1_u2_allo_pre = await _i_invest.getAddressInvestment(1, addr2.address);
        // const i2_u1_allo_pre = await _i_invest2.getAddressInvestment(1, addr1.address);
        const i2_SELL_allo_post = await _i_db2.getAddressInvestment(1, addr2.address);

        const diff = i1_BUY_allo_pre.amt.toNumber() + i2_SELL_allo_pre.amt.toNumber()
        expect(
            i2_SELL_allo_post.amt.toString() == (0).toString() &&
            i1_BUY_allo_post.amt.toString() == (diff).toString() &&
            !i1_BUY_allo_post.locked &&
            !i2_SELL_allo_post.locked
        ).to.be.true;

        const funds_contract = await _i_USDC.balanceOf(examples.addresses[3])
        const funds_user_post = await _i_USDC.balanceOf(addr2.address)
        const diffFund = funds_user_post.toNumber() - funds_user_pre_a2.toNumber()
        expect(
            funds_contract.toString() == Web3Utils.toWei("200", 'mwei') &&
            diffFund.toString() == Web3Utils.toWei("4000", 'mwei')
        ).to.be.true;
    });
    it("Utilities", async function () {
        const [owner, addr1, addr2] = await ethers.getSigners();


        // withdrawAsset
        const invest_usdc = await _i_USDC.balanceOf(_i_invest.address)
        const a5_amt_pre = await _i_USDC.balanceOf(examples.addresses[5])
        await _i_invest.withdrawAsset(examples.addresses[5], `${invest_usdc.toNumber()/2}`, _i_USDC.address)
        const a5_amt_post = await _i_USDC.balanceOf(examples.addresses[5])
        const diff = a5_amt_post.toNumber() - a5_amt_pre.toNumber()
        expect(diff == invest_usdc.toNumber()/2).to.be.true;

        // depositToken
        await _i_USDC.approve(_i_invest.address, (invest_usdc.toNumber()/2).toString());
        await _i_invest.depositToken(`${invest_usdc.toNumber()/2}`, _i_USDC.address)
        const invest_usdc2 = await _i_USDC.balanceOf(_i_invest.address)
        expect(invest_usdc2.toNumber() == invest_usdc.toNumber()).to.be.true;

        const phase_pre = await _i_invest.getAddressPhaseInvested(1, addr1.address)
        await _i_invest.overrideAddressInvestmentPhase(1, addr1.address, 2, true)
        const phase_post = await _i_invest.getAddressPhaseInvested(1, addr1.address)
        expect(!phase_pre[2] && phase_post[2]).to.be.true;

        await _i_db.overrideInvestment(1, 5, `200`, `100`, true, addr1.address)
        const inv_post = await _i_db.getAddressInvestment(1, addr1.address)
        expect(
            inv_post.refund == 5 &&
            inv_post.amtRefund.toString() == 100 &&
            inv_post.amt.toString() == 200 &&
            inv_post.locked
        ).to.be.true;


        const config_vault = await _i_invest.vault()
        const config_feeCurrency = await _i_invest.feeCurrency()
        const config_feeReassign = await _i_invest.feeReassign()

        expect(
            config_vault == "0x0000000000000000000000000000000000000005" &&
            config_feeCurrency == "0x5FbDB2315678afecb367f032d93F642f64180aa3" &&
            config_feeReassign.toString() == 50000000
        ).to.be.true;
        await _i_invest.setConfig("20000000", examples.addresses[3], examples.addresses[4])
        const config_vault2 = await _i_invest.vault()
        const config_feeCurrency2 = await _i_invest.feeCurrency()
        const config_feeReassign2 = await _i_invest.feeReassign()
        expect(
            config_vault2 == examples.addresses[4] &&
            config_feeCurrency2 == examples.addresses[3] &&
            config_feeReassign2.toString() == 20000000
        ).to.be.true;


        const usdc = await _i_invest.approvedPayments(_i_USDC.address)
        const usdt = await _i_invest.approvedPayments(_i_USDT.address)
        expect(
            usdc &&
            usdt
        ).to.be.true;
        await _i_invest.setToken(false, _i_USDT.address)
        await _i_invest.setToken(false, _i_USDC.address)
        const usdc2 = await _i_invest.approvedPayments(_i_USDC.address)
        const usdt2 = await _i_invest.approvedPayments(_i_USDT.address)
        expect(
            !usdc2 &&
            !usdt2
        ).to.be.true;
    });

});
