// // require("@nomiclabs/hardhat-waffle");
// require("@nomiclabs/hardhat-truffle5");
// require("hardhat-deploy");
// require("@nomiclabs/hardhat-waffle");

// require("dotenv").config();

// // This is a sample Hardhat task. To learn how to create your own go to
// // https://hardhat.org/guides/create-task.html

// const defaultNetwork = "goerli";

// module.exports = {
//   defaultNetwork,

//   solidity: {
//     version: "0.8.13",
//     // settings: {
//     //   optimizer: {
//     //     enabled: true,
//     //   },
//     // },
//   },

//   networks: {
//     goerli: {
//       url: `${process.env.GOERLI_ALCHEMY_URL}`,
//       accounts: [`0x${process.env.GOERLI_DEPLOYER_PRIVATE_KEY}`],
//       allowUnlimitedContractSize: true,
//     },
//   },
//   // namedAccounts: {
//   //   deployer: {
//   //     default: 0, // here this will by default take the first account as deployer
//   //   },
//   // },
// };

require("@nomiclabs/hardhat-waffle");
require("dotenv").config();
const { GOERLI_DEPLOYER_PRIVATE_KEY, GOERLI_ALCHEMY_URL } = process.env;

module.exports = {
  defaultNetwork: "goerli",
  networks: {
    goerli: {
      url: `${process.env.GOERLI_ALCHEMY_URL}`,
      accounts: [`0x${process.env.GOERLI_DEPLOYER_PRIVATE_KEY}`],
    },
  },
  solidity: {
    version: "0.8.13",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
};
