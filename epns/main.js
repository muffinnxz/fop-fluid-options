const OptionFactory = require("../contracts/artifacts/contracts/OptionFactory.sol/OptionFactory.json");
const OptionPutFactory = require("../contracts/artifacts/contracts/OptionPutFactory.sol/OptionPutFactory.json");
const ethers = require("ethers");

const CallFactoryAddress = "0xca0BF23f1Ea4E08ea053691C0Dd0C066b0c31665";
const PutFactoryAddress = "0x264569c1325C26e41832dE6C8D978d59fCb05D60";
const fDAI = "0x88271d333C72e51516B67f5567c728E702b3eeE8";
const fDAIx = "0xF2d68898557cCb2Cf4C10c3Ef2B034b2a69DAD00";

async function checkCallOption() {
    const provider = ethers.getDefaultProvider("goerli");
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
    const provider = ethers.getDefaultProvider("goerli");
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
