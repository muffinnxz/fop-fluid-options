//read data on option

const hre = require("hardhat");
require("dotenv");
const Web3 = require("web3");
const ethers = require("ethers");

//all addresses hardcoded for rinkeby
const hostJSON = require("../artifacts/@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol/ISuperfluid.json")
const hostABI = hostJSON.abi;
const hostAddress = "0xeD5B5b32110c3Ded02a07c8b8e97513FAfb883B6";

const cfaJSON = require("../artifacts/@superfluid-finance/ethereum-contracts/contracts/interfaces/agreements/IConstantFlowAgreementV1.sol/IConstantFlowAgreementV1.json")
const cfaABI = cfaJSON.abi;
const cfaAddress = "0xF4C5310E51F6079F601a5fb7120bC72a70b96e2A";

const tradeableCallOptionJSON = require("../artifacts/contracts/TradeableCallOption.sol/TradeableCallOption.json");
const tradeableCallOptionABI = tradeableCallOptionJSON.abi; 

//temporarily hardcode contract address and sender address
//need to manually enter contract address and sender address here
const deployedTradeableCashflowOption = require("../deployments/rinkeby/TradeableCallOption.json");
const tradeableCallOptionAddress = deployedTradeableCashflowOption.address;

//address of owner of option here..need to change this
const _sender = "0x5966aa11c794893774a382d9a19743B8be6BFFd1";

//create a flow
async function main() {

    const web3 = new Web3(new Web3.providers.HttpProvider(process.env.RINKEBY_ALCHEMY_URL));
  
    //create contract instances for each of these
    const host = new web3.eth.Contract(hostABI, hostAddress);
    const cfa = new web3.eth.Contract(cfaABI, cfaAddress);
    const TradeableCallOption = new web3.eth.Contract(tradeableCallOptionABI, tradeableCallOptionAddress);
    
    const fDAIx = "0x15F0Ca26781C3852f8166eD2ebce5D18265cceb7";
  
    const nonce = await web3.eth.getTransactionCount(_sender, 'latest'); // nonce starts counting from 0
  
    //create flow by calling host directly in this function
    //create flow from sender to tradeable cashflow address
    async function readOptionData() {

        // ERC20 underlyingAsset, 
        //     uint256 underlyingAmount, 
        //     uint8 underlyingDecimals,
        //     AggregatorV3Interface priceFeed, 
        //     int96 requiredFlowRate, 
        //     uint256 expirationDate, 
        //     int256 strikePrice)  

        let underlyingAsset = await TradeableCallOption.methods._underlyingAsset().call();
        let requiredFlowRate = await TradeableCallOption.methods._requiredFlowRate().call();
        let expirationDate = await TradeableCallOption.methods._expirationDate().call();
        let strikePrice = await TradeableCallOption.methods._strikePrice().call();
        let optionReady = await TradeableCallOption.methods.optionReady().call();
        let optionActive = await TradeableCallOption.methods.optionActive().call();
        let underlyingAmount = await TradeableCallOption.methods._underlyingAmount().call();


        console.log(`Underlying Asset: ${underlyingAsset}`);
        console.log(`Underlying Amount: ${underlyingAmount}`);

        console.log(`Required Flow Rate: ${requiredFlowRate}`);
        console.log(`Expiration Date: ${expirationDate}`);
        console.log(`Strike Price: ${strikePrice}`);
        console.log(`Option Ready? ${optionReady}`);
        console.log(`Option Active? ${optionActive}`);

      }
    
  
    await readOptionData();
  
    }
  
  // We recommend this pattern to be able to use async/await everywhere
  // and properly handle errors.
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });