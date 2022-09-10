const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const OptionFactory = await hre.ethers.getContractFactory("OptionFactory");
  const optionFactory = await OptionFactory.deploy();

  await optionFactory.deployed();

  console.log("Option Factory deployed to:", optionFactory.address);
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
