const OptionFactory = require("../contracts/artifacts/contracts/OptionFactory.sol/OptionFactory.json");
const OptionPutFactory = require("../contracts/artifacts/contracts/OptionPutFactory.sol/OptionPutFactory.json");
const ethers = require("ethers");

const CallFactoryAddress = "0xb5fd8b23C8085d3d767d3817e89F111d320de151";
const PutFactoryAddress = "0x2C231969fd81f9AF0Dfda4fd4E5088948438e230";
const fDAI = "0x15F0Ca26781C3852f8166eD2ebce5D18265cceb7";
const fDAIx = "0x5D8B4C2554aeB7e86F387B4d6c00Ac33499Ed01f";

async function checkCallOption() {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const contract = new ethers.Contract(
    CallFactoryAddress,
    OptionFactory.abi,
    provider
  );
  try {
    contract.getCallOptions().then(([...data]) => {
      console.log("All Call Option", data.reverse());
    });
  } catch (err) {
    console.log("Error: ", err);
  }
}

async function checkPutOption() {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const contract = new ethers.Contract(
    PutFactoryAddress,
    OptionPutFactory.abi,
    provider
  );
  try {
    contract.getPutOptions().then(([...data]) => {
      console.log("All Put Option", data.reverse());
    });
  } catch (err) {
    console.log("Error: ", err);
  }
}

async function dailyNotify() {
  checkCallOption();
  checkPutOption();
}

dailyNotify();
