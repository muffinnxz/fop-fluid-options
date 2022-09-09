// const { expect } = require("chai");
// const { ethers } = require("hardhat");
const { web3tx, toWad, wad4human } = require("@decentral.ee/web3-helpers");

const deployFramework = require("@superfluid-finance/ethereum-contracts/scripts/deploy-framework");
const deployTestToken = require("@superfluid-finance/ethereum-contracts/scripts/deploy-test-token");
const deploySuperToken = require("@superfluid-finance/ethereum-contracts/scripts/deploy-super-token");
const SuperfluidSDK = require("@superfluid-finance/js-sdk");
const TradeablePutOption = artifacts.require("TradeablePutOption");
const MockV3Aggregator = artifacts.require("MockV3Aggregator");

const traveler = require("ganache-time-traveler");
// const { it } = require("ethers/wordlists");
const TEST_TRAVEL_TIME = 3600 * 2; // 1 hours
const ONE_YEAR_TIME = 3600 * 2 * 24 * 366; //one year and one day
contract("TradeablePutOption", (accounts) => {
  const errorHandler = (err) => {
    if (err) throw err;
  };

  const names = ["Admin", "Alice", "Bob", "Carol", "Dan", "Emma", "Frank"];
  accounts = accounts.slice(0, names.length);

  let sf;
  let dai;
  let link;
  let daix;
  let app;
  let mockPriceFeed;
  let mockPriceFeed2;
  let mockPriceFeed3;
  let price;
  let outOfMoneyPrice;
  const u = {}; // object with all users
  const aliases = {};

  before(async function () {
    //process.env.RESET_SUPERFLUID_FRAMEWORK = 1;
    await deployFramework(errorHandler, {
      web3,
      from: accounts[0],
    });
  });

  beforeEach(async function () {
    await deployTestToken(errorHandler, [":", "fDAI"], {
      web3,
      from: accounts[0],
    });

    await deployTestToken(errorHandler, [":", "LINK"], {
      web3,
      from: accounts[0],
    });
    await deploySuperToken(errorHandler, [":", "fDAI"], {
      web3,
      from: accounts[0],
    });

    sf = new SuperfluidSDK.Framework({
      web3,
      version: "test",
      tokens: ["fDAI"],
    });
    await sf.initialize();
    daix = sf.tokens.fDAIx;
    dai = await sf.contracts.TestToken.at(await sf.tokens.fDAI.address);
    link = await sf.contracts.TestToken.at(
      "0x322813Fd9A801c5507c9de605d63CEA4f2CE6c44"
    );
    for (var i = 0; i < names.length; i++) {
      u[names[i].toLowerCase()] = sf.user({
        address: accounts[i],
        token: daix.address,
      });
      u[names[i].toLowerCase()].alias = names[i];
      aliases[u[names[i].toLowerCase()].address] = names[i];
    }
    for (const [, user] of Object.entries(u)) {
      if (user.alias === "App") return;
      await web3tx(dai.mint, `${user.alias} mints many dai`)(
        user.address,
        web3.utils.toWei("100", "ether"),
        {
          from: user.address,
        }
      );
      await web3tx(link.mint, `${user.alias} mints many link`)(
        user.address,
        web3.utils.toWei("5", "ether"),
        {
          from: user.address,
        }
      );
      await web3tx(dai.approve, `${user.alias} approves daix`)(
        daix.address,
        web3.utils.toWei("100", "ether"),
        {
          from: user.address,
        }
      );
    }
    //u.zero = { address: ZERO_ADDRESS, alias: "0x0" };
    console.log(u.admin.address);
    console.log(sf.host.address);
    console.log(sf.agreements.cfa.address);
    console.log(daix.address);
    app = await TradeablePutOption.new(
      //first param is owner of option
      u.admin.address,
      "StreamingPutOption",
      "OPTx",
      sf.host.address,
      sf.agreements.cfa.address,
      daix.address,
      dai.address
    );

    u.app = sf.user({ address: app.address, token: daix.address });
    u.app.alias = "App";
    await checkBalance(u.app);

    price = 3000000000;
    outOfMoneyPrice = 2700000000;
    mockPriceFeed = await MockV3Aggregator.new(price);
    mockPriceFeed2 = await MockV3Aggregator.new(outOfMoneyPrice);
    mockPriceFeed3 = await MockV3Aggregator.new(4000000000);
  });

  async function checkBalance(user) {
    console.log("Balance of ", user.alias);
    console.log("DAIx: ", (await daix.balanceOf(user.address)).toString());
  }

  async function checkBalances(accounts) {
    for (let i = 0; i < accounts.length; ++i) {
      await checkBalance(accounts[i]);
    }
  }

  async function upgrade(accounts) {
    for (let i = 0; i < accounts.length; ++i) {
      await web3tx(daix.upgrade, `${accounts[i].alias} upgrades many DAIx`)(
        web3.utils.toWei("50", "ether"),
        { from: accounts[i].address }
      );
      await checkBalance(accounts[i]);
    }
  }

  async function logUsers() {
    let string = "user\t\ttokens\t\tnetflow\n";
    let p = 0;
    for (const [, user] of Object.entries(u)) {
      if (await hasFlows(user)) {
        p++;
        string += `${user.alias}\t\t${wad4human(
          await daix.balanceOf(user.address)
        )}\t\t${wad4human((await user.details()).cfa.netFlow)}
        `;
      }
    }
    if (p == 0) return console.warn("no users with flows");
    console.log("User logs:");
    console.log(string);
  }

  async function hasFlows(user) {
    const { inFlows, outFlows } = (await user.details()).cfa.flows;
    return inFlows.length + outFlows.length > 0;
  }

  async function appStatus() {
    const isApp = await sf.host.isApp(u.app.address);
    const isJailed = await sf.host.isAppJailed(app.address);
    !isApp && console.error("App is not an App");
    isJailed && console.error("app is Jailed");
    await checkBalance(u.app);
    await checkOwner();
  }
  async function checkOwner() {
    const owner = await app.ownerOf("1");
    console.log("Contract Owner: ", aliases[owner], " = ", owner);
    return owner.toString();
  }

  async function transferNFT(to) {
    const receiver = to.address || to;
    const owner = await checkOwner();
    console.log("got owner from checkOwner(): ", owner);
    console.log("receiver: ", receiver);
    if (receiver === owner) {
      console.log("user === owner");
      return false;
    }
    await app.transferFrom(owner, receiver, 1, { from: owner });
    console.log(
      "token transferred, new owner: ",
      receiver,
      " = ",
      aliases[receiver]
    );
    return true;
  }

  describe("Creating & Exercising", async function () {
    it("Case 1 - Owner calls createOption()", async () => {
      const { admin, alice } = u;
      await app.createOption(
        web3.utils.toWei("28", "ether"), //underlyingAmount,
        link.address, //purchasingAsset,
        web3.utils.toWei("1", "ether"), //strikePrice,
        18, //purchasingDecimals,
        mockPriceFeed2.address, //the address of our mock price feed
        8, //price feed will return 8 decimal value
        "3858024609", //~100 per mo
        1669166376, //Nov 24, 2022,
        { from: admin.address }
      );

      let purchasingAsset = await app._purchasingAsset.call();
      let underlyingAmount = await app._underlyingAmount.call();
      let underlyingDecimals = await app._underlyingDecimals.call();
      let priceFeed = await app._priceFeed.call();
      let priceFeedDecimals = await app._priceFeedDecimals.call();
      let requiredFlowRate = await app._requiredFlowRate.call();
      let expirationDate = await app._expirationDate.call();
      let strikePrice = await app._strikePrice.call();

      assert.equal(
        purchasingAsset,
        link.address,
        "Underlying asset is incorrect"
      );
      assert.equal(
        strikePrice,
        web3.utils.toWei("1", "ether"),
        "underlying amount is incorrect"
      );
      assert.equal(underlyingDecimals, 18, "underlying decimals is incorrect");
      assert.equal(
        priceFeed,
        mockPriceFeed2.address,
        "price feed is incorrect"
      );
      assert.equal(priceFeedDecimals, 8, "pricefeed decimals is incorrect");
      assert.equal(
        requiredFlowRate,
        "3858024609",
        "required flow rate is incorrect"
      );
      assert.equal(expirationDate, 1669166376, "expiry is incorrect");
      assert.equal(
        underlyingAmount,
        web3.utils.toWei("28", "ether"),
        "strike price is incorrect"
      );
    });

    it("Case #2 - User Opens Sufficient Flow Into the Option", async () => {
      const { admin, alice } = u;
      //option has already been activated

      //option seller approves dai token transfer
      await dai.approve(app.address, web3.utils.toWei("28", "ether"), {
        from: admin.address,
      });

      await upgrade([alice]);
      await checkBalance(alice);
      let sellerDaiBalance = await dai.balanceOf(admin.address);
      console.log("dai owner balance: " + sellerDaiBalance);
      console.log(app.address);
      await alice.flow({
        //flow rate is sufficient - i.e. equal to requiredFlowRate
        flowRate: "3858024609",
        recipient: u.app,
      });

      console.log("go forward in time");
      await traveler.advanceTimeAndBlock(TEST_TRAVEL_TIME);

      let optionStatus = await app.optionActive.call();
      let optionReady = await app.optionReady.call();
      let sellerFlowRate = (await admin.details()).cfa.netFlow;
      let contractDaiBalance = await dai.balanceOf(app.address);

      //need to make sure that the net flowRate of the option contract is 0
      assert.equal(
        (await u.app.details()).cfa.netFlow,
        0,
        "app flowRate not zero"
      );
      //need to make sure that the option is active
      assert.equal(optionStatus, true, "option not activated");
      assert.equal(optionReady, true, "option not ready");
      //need to make sure that the owner of the contract is receiving funds
      assert.equal(sellerFlowRate, 3858024609, "owner has incorrect flowRate");
      //need to make sure that the contract is now holding the right amount of dai
      assert.equal(
        contractDaiBalance,
        web3.utils.toWei("28", "ether"),
        "contract does not have correct link bal"
      );
    });

    it("Case #3 - Option is Exercised", async () => {
      //option has already been activated

      const { admin, alice } = u;
      await checkBalance(alice);
      let sellerDaiBalance = await dai.balanceOf(admin.address);
      console.log("dai owner balance: " + sellerDaiBalance);

      //make sure buyer approves contract to spend their link
      await link.approve(app.address, web3.utils.toWei("1", "ether"), {
        from: alice.address,
      });
      let aliceLinkBalance = await link.balanceOf(alice.address);
      let adminLinkBalance = await link.balanceOf(admin.address);
      let aliceDaiBalance = await dai.balanceOf(alice.address);

      //buyer runs exericse option to settle
      await app.exerciseOption({ from: alice.address });

      let contractDaiBalanceAfter = await dai.balanceOf(app.address);
      console.log("contract dai balance after: " + contractDaiBalanceAfter);

      let aliceDaiBalanceAfter = await dai.balanceOf(alice.address);
      console.log("alice dai balance after exercise: " + aliceDaiBalanceAfter);
      console.log("alice dai balance before exercise: " + aliceDaiBalance);

      let adminLinkBalanceAfter = await link.balanceOf(admin.address);
      console.log(
        "admin link balance after exercise: " + adminLinkBalanceAfter
      );

      let aliceLinkBalanceAfter = await link.balanceOf(alice.address);

      let buyerFlowRate = (await alice.details()).cfa.netFlow;
      let sellerFlowRate = (await admin.details()).cfa.netFlow;

      //balance of dai in contract should be zero
      assert.equal(contractDaiBalanceAfter, 0, "funds have not left contract");

      assert.equal(buyerFlowRate, 0, "buyer flowRate should now be zero");
      assert.equal(sellerFlowRate, 0, "flowRate should now be zero");

      //make sure funds are settled
      assert.equal(
        Number(aliceDaiBalance) + Number(web3.utils.toWei("28", "ether")),
        aliceDaiBalanceAfter,
        "dai balance not settled properly"
      );
      assert.equal(
        Number(adminLinkBalanceAfter - adminLinkBalance),
        web3.utils.toWei("1", "ether"),
        "link balance not settled properly"
      );
      assert.equal(
        Number(aliceLinkBalance - web3.utils.toWei("1", "ether")),
        aliceLinkBalanceAfter,
        "link balance not settled properly"
      );

      //write functionality in contract to turn off streams when option is settled
      //check cases where option is out of the money
    });
  });

  describe("Failure modes - when the option should NOT exercise", async function () {
    it("Case #4 - Option flow is reduced to below the required flowRate", async () => {
      //create option
      const { admin, alice } = u;
      await app.createOption(
        web3.utils.toWei("28", "ether"), //underlyingAmount,
        link.address, //purchasingAsset,
        web3.utils.toWei("1", "ether"), //strikePrice,
        18, //purchasingDecimals,
        mockPriceFeed2.address, //the address of our mock price feed
        8, //price feed will return 8 decimal value
        "3858024609", //~100 per mo
        1669166376, //Nov 24, 2022,
        { from: admin.address }
      );
      //option seller approves dai token transfer
      await dai.approve(app.address, web3.utils.toWei("28", "ether"), {
        from: admin.address,
      });

      //start flow
      await upgrade([alice]);
      await checkBalance(alice);
      let sellerLinkBalance = await link.balanceOf(admin.address);
      console.log("link owner balance: " + sellerLinkBalance);
      console.log(app.address);
      await alice.flow({
        //flow rate is sufficient - i.e. equal to requiredFlowRate
        flowRate: "3858024609",
        recipient: u.app,
      });

      //ensure that option has been activated
      console.log("go forward in time");
      await traveler.advanceTimeAndBlock(TEST_TRAVEL_TIME);

      let optionStatus = await app.optionActive.call();
      let optionReady = await app.optionReady.call();
      let sellerFlowRate = (await admin.details()).cfa.netFlow;
      let contractDaiBalance = await dai.balanceOf(app.address);
      let adminDaiBalance = await dai.balanceOf(admin.address);

      //need to make sure that the net flowRate of the option contract is 0
      assert.equal(
        (await u.app.details()).cfa.netFlow,
        0,
        "app flowRate not zero"
      );
      //need to make sure that the option is active
      assert.equal(optionStatus, true, "option not activated");
      assert.equal(optionReady, true, "option not ready");
      //need to make sure that the owner of the contract is receiving funds
      assert.equal(
        sellerFlowRate,
        "3858024609",
        "owner has incorrect flowRate"
      );
      //need to make sure that the contract is now holding the right amount of dai
      assert.equal(
        contractDaiBalance,
        web3.utils.toWei("28", "ether"),
        "contract does not have correct dai bal"
      );

      //update flow
      await alice.flow({
        flowRate: "2858024609",
        recipient: u.app,
      });

      let afterOptionStatus = await app.optionActive.call();
      let afterOptionReady = await app.optionReady.call();
      let afterContractDaiBalance = await dai.balanceOf(app.address);
      let afterAdminDaiBalance = await dai.balanceOf(admin.address);

      assert.equal(afterOptionStatus, false, "option should be deactivated");
      assert.equal(afterOptionReady, false, "option should no longer be ready");
      assert.equal(
        afterContractDaiBalance,
        0,
        "contract shouldn't have dai any longer"
      );
      assert.equal(
        Number(adminDaiBalance) + Number(web3.utils.toWei("28", "ether")),
        afterAdminDaiBalance,
        "admin should get all of their dai back"
      );
    });

    it("Case #5 - Option is out of the money", async () => {
      const { admin, alice } = u;
      await app.createOption(
        web3.utils.toWei("28", "ether"), //underlyingAmount,
        link.address, //purchasingAsset,
        web3.utils.toWei("1", "ether"), //strikePrice,
        18, //purchasingDecimals,
        mockPriceFeed2.address, //the address of our mock price feed
        8, //price feed will return 8 decimal value
        "3858024609", //~100 per mo
        1669166376, //Nov 24, 2022,
        { from: admin.address }
      );
      //option seller approves dai token transfer
      await dai.approve(app.address, web3.utils.toWei("28", "ether"), {
        from: admin.address,
      });

      //start flow
      await upgrade([alice]);
      await checkBalance(alice);
      let sellerDaiBalance = await dai.balanceOf(admin.address);
      console.log("dai owner balance: " + sellerDaiBalance);
      console.log(app.address);
      await alice.flow({
        //flow rate is sufficient - i.e. equal to requiredFlowRate
        flowRate: "3858024609",
        recipient: u.app,
      });

      await link.approve(app.address, web3.utils.toWei("1", "ether"), {
        from: alice.address,
      });

      //buyer runs exericse option to settle
      try {
        await app.exerciseOption({ from: alice.address });
        assert.fail("option out of the money");
      } catch {
        console.log("did not work as expected");
      }

      let contractFinalDaiBalance = await dai.balanceOf(app.address);
      console.log(contractFinalDaiBalance);

      assert.equal(
        contractFinalDaiBalance,
        "0",
        "contract balance should be empty now"
      );
    });

    xit("Case #6 - Option is past expiry", async () => {
      const { admin, alice } = u;
      await app.createOption(
        web3.utils.toWei("28", "ether"), //underlyingAmount,
        link.address, //purchasingAsset,
        web3.utils.toWei("1", "ether"), //strikePrice,
        18, //purchasingDecimals,
        mockPriceFeed2.address, //the address of our mock price feed
        8, //price feed will return 8 decimal value
        "3858024609", //~100 per mo
        1669166376, //Nov 24, 2022,
        { from: admin.address }
      );
      //option seller approves dai token transfer
      await dai.approve(app.address, web3.utils.toWei("28", "ether"), {
        from: admin.address,
      });
      let aliceDaiBalBefore = await dai.balanceOf(alice.address);
      console.log("alice dai bal before " + aliceDaiBalBefore);
      //start flow
      await upgrade([alice]);
      await checkBalance(alice);
      let sellerDaiBalance = await dai.balanceOf(admin.address);
      console.log("dai owner balance: " + sellerDaiBalance);
      await alice.flow({
        //flow rate is sufficient - i.e. equal to requiredFlowRate
        flowRate: "3858",
        recipient: u.app,
      });
      let aliceDaiBal = await dai.balanceOf(alice.address);
      console.log("alice dai bal after " + aliceDaiBal);
      let beforeContractDaiBalance = await dai.balanceOf(app.address);

      console.log("go forward in time by one year");
      await traveler.advanceTimeAndBlock(ONE_YEAR_TIME);
      await link.approve(app.address, web3.utils.toWei("1", "ether"), {
        from: alice.address,
      });

      console.log("contract bal before exercise: " + beforeContractDaiBalance);
      //buyer runs exericse option to settle
      await app.exerciseOption({ from: alice.address });

      let afterOptionStatus = await app.optionActive.call();
      let afterOptionReady = await app.optionReady.call();
      let afterContractDaiBalance = await dai.balanceOf(app.address);
      let afterAdminDaiBalance = await dai.balanceOf(admin.address);

      assert.equal(afterOptionStatus, false, "option should be deactivated");
      assert.equal(afterOptionReady, false, "option should no longer be ready");
      assert.equal(
        afterContractDaiBalance,
        0,
        "contract shouldn't have dai any longer"
      );
      assert.equal(
        Number(adminDaiBalance) + Number(web3.utils.toWei("28", "ether")),
        afterAdminDaiBalance,
        "admin should get all of their dai back"
      );
    });
  });
});
