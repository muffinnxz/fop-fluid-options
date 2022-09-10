// const { expect } = require("chai");
const { ethers } = require("hardhat");
const { web3tx, toWad, wad4human } = require("@decentral.ee/web3-helpers");

const deployFramework = require("@superfluid-finance/ethereum-contracts/scripts/deploy-framework");
const deployTestToken = require("@superfluid-finance/ethereum-contracts/scripts/deploy-test-token");
const deploySuperToken = require("@superfluid-finance/ethereum-contracts/scripts/deploy-super-token");
const SuperfluidSDK = require("@superfluid-finance/js-sdk");
const TradeableCashflowOption = artifacts.require("TradeableCashflowOption");
const OptionPutFactory = artifacts.require("OptionPutFactory");
const MockV3Aggregator = artifacts.require("MockV3Aggregator");

const traveler = require("ganache-time-traveler");
const { assert } = require("chai");
// const { it } = require("ethers/wordlists");
const TEST_TRAVEL_TIME = 3600 * 2; // 1 hours
const ONE_YEAR_TIME = 3600 * 2 * 24 * 366; //one year and one day
contract("TradeableCashflowOption", (accounts) => {
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
    // console.log(u.admin.address);
    // console.log(sf.host.address);
    // console.log(sf.agreements.cfa.address);
    // console.log(daix.address);
    app = await OptionPutFactory.new();

    u.app = sf.user({ address: app.address, token: daix.address });
    u.app.alias = "App";
    await checkBalance(u.app);

    price = 3000000000;
    outOfMoneyPrice = 2700000000;
    mockPriceFeed = await MockV3Aggregator.new(price);
    mockPriceFeed2 = await MockV3Aggregator.new(outOfMoneyPrice);
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

  describe("Creating Put Option From Factory", async function () {
    it("Case 1 - Owner calls mintPutOption()", async () => {
      const { constants } = require("@openzeppelin/test-helpers");
      const { admin } = u;
      // mint put option from factory
      await app.mintPutOption(
        u.admin.address,
        "StreamingCallOption",
        "OPTx",
        sf.host.address,
        sf.agreements.cfa.address,
        daix.address,
        dai.address,
        { from: admin.address }
      );
      // get all call/put options
      let getAllPutOption = await app.getPutOptions.call();
      // get all my call/put options
      let getAllMyPutOption = await app.getPutOptionsByWallet.call(
        admin.address
      );

      assert.notEqual(
        getAllPutOption,
        constants.ZERO_ADDRESS,
        "Put Option not created yet"
      );
      assert.deepEqual(
        getAllMyPutOption,
        getAllPutOption,
        "Put Option not created yet and not mine"
      );
    });

    it("Case #2 - User transfer put option", async () => {
      const { admin, alice } = u;

      // get all options and all my options
      let getAllPutOption = await app.getPutOptions.call();
      let getAllMyPutOption = await app.getPutOptionsByWallet.call(
        admin.address
      );
      // get my putOption in form of contract
      putOption = await ethers.getContractAt(
        "TradeableCashflowOption",
        getAllPutOption[0]
      );

      //approve for transfer
      await putOption.approve(app.address, 1, {
        from: admin.address,
      });
      // transfer to alice
      putOption.transferFrom(admin.address, alice.address, 1);

      // check ALL put OPTIONS
      let getAllPutOption2 = await app.getPutOptions.call();
      // check alice put option
      let getAllMyPutOption2 = await app.getPutOptionsByWallet.call(
        admin.address
      );
      assert.deepEqual(getAllPutOption, getAllPutOption2, "It's not the same");
      assert.deepEqual(getAllMyPutOption2, [], "Now Empty");

      let getAllMyPutOption3 = await app.getPutOptionsByWallet.call(
        alice.address
      );
      assert.deepEqual(
        getAllMyPutOption,
        getAllMyPutOption3,
        "Alice doesn't get Nft"
      );
    });
  });
});
