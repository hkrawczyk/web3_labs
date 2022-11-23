const { expect } = require("chai");
const examples = require("../../testFactories/tempData");
const defaults = require("../../testFactories/defaultEnv");



describe("Admin", function () {
  it("Manage admins", async function () {


    const { i_admin } = await defaults.env(true, 18, [examples.addresses[1], examples.addresses[3]]);

    await i_admin.addAdmin(examples.addresses[1],0);
    await i_admin.addAdmin(examples.addresses[2],1);
    await i_admin.addAdmin(examples.addresses[3],2);


    const admins = await i_admin.getAdmin(examples.addresses[2]);
    expect(admins.isActive && admins.level == 1).to.be.true;

    await i_admin.removeAdmin(examples.addresses[2]);
    const admins2 = await i_admin.getAdmin(examples.addresses[2]);
    expect(!admins2.isActive && admins2.level == 0).to.be.true;

    const authT = await i_admin.isAuth(examples.addresses[2],2);
    const authT2 = await i_admin.isAuth(examples.addresses[3],1);
    const authT3 = await i_admin.isAuth(examples.addresses[3],2);
    expect(!authT && !authT2 && authT3).to.be.true;

    const req1 = await i_admin.getRequired(examples.addresses[1]);
    const req2 = await i_admin.getRequired(examples.addresses[2]);
    const req3 = await i_admin.getRequired(examples.addresses[3]);
    expect(req1 && !req2 && req3).to.be.true;

    await i_admin.setWatchdogs([examples.addresses[1],examples.addresses[2]]);
    const admins4 = await i_admin.watchdogs(0);
    const admins5 = await i_admin.watchdogs(1);
    expect(admins4 == examples.addresses[1] && admins5 == admins5).to.be.true;

  });
});
