# FOP - Fluid Options
 Streaming Options Marketplace submitted for ETHOnline2022

## Project Description
In a regular option marketplace, the option buyer needs to pay the premium at a fixed cost and at the beginning of the contract. This creates inefficiency for the buyers because they need to pay in advance for the right to exercise their options.

With the help of FOP, we create the first real-time option marketplace where option buyers and sellers can stream and receive their premiums in real time. The marketplace mints an NFT, which allows the option seller to post collateral (option underlying asset) into it, and the option buyer can stream the premium in real time. If the option can be exercised, FOP will notify the option’s buyer.

So as long as the option buyer streams the premium at the rate set by the seller, the contract can be exercised.

Right now, we are using the chainlink price feeds for the underlying asset. In the future, we will employ an optimistic oracle for options settlement and thus make it decentralised.

I will explain the core contract, which mint, stream, and exercise the option. It acts as a bridge that connects between the option seller and the option buyer.

Option Seller Side:

1.) The option seller sets some parameters which include:

a. Option Type: Call or Put

b. Underlying Asset: the asset type that is tied to the contract (ex. wMATIC)

c. Underlying Amount: the amount of the underlying asset (ex. 10 wMATIC)

d. Purchasing Asset: the asset type that the buyer buys with. We set it to DAI for simplicity.

e. Purchasing Amount: the amount that the buyer purchases. This will calculate the strike price. (DAI)

f. Premium: the flowrate of premium streams per day. It will be Supersluid’s Super Tokens (ex. DAIx)

g. Expiration Date: FOP will estimate the lifetime premium of the contract from the contract creation to the expiration date.

2.) The option seller presses “Create Option”, which mints the option contract.

3.) The option seller approves the underlying asset in the option contract.

Option Buyer Side:

1.) The option buyer chooses the desired option from the marketplace page

2.) The option buyer streams the premium by pressing the “Create Flow” button. The buyer has to wrap DAI to DAIx to create flow.

3.) After the option buyer starts streaming the premium, the buyer will has the right, but not the obligation, to either buy or sell a fixed amount of an underlying asset.

4.) FOP will notify the buyer when the real price is higher (for call option) or lower (for the put option) than the strike price.

5.) The option buyer presses “Exercise Option” to exercise the contract. The contract will swap the purchasing amount for the collateral amount.

The premium will be streamed from the option buyer -> NFT contract -> the option seller.

## How it's Made
In order to make the real-time option market work, here are some nitty-gritty details about our MVP:

@Superfluid We are using Superfluid to allow the option buyer to stream their premium in real time to the option seller. https://github.com/mrmuffinnxz/fop-fluid-options/blob/main/contracts/contracts/RedirectAllCallOption.sol https://github.com/mrmuffinnxz/fop-fluid-options/blob/main/contracts/contracts/RedirectAllPutOption.sol https://github.com/mrmuffinnxz/fop-fluid-options/blob/main/frontend/pages/call/%5BoptionAddress%5D.js https://github.com/mrmuffinnxz/fop-fluid-options/blob/main/frontend/pages/put/%5BoptionAddress%5D.js

@Polygon We are using Polygon to deploy our NFT minting smart contract. The core contract is deployed on the Mumbai Testnet to incentivise high-quality. https://mumbai.polygonscan.com/address/0xb5fd8b23C8085d3d767d3817e89F111d320de151 https://mumbai.polygonscan.com/address/0x2C231969fd81f9AF0Dfda4fd4E5088948438e230 https://github.com/mrmuffinnxz/fop-fluid-options/blob/main/contracts/contracts/OptionFactory.sol https://github.com/mrmuffinnxz/fop-fluid-options/blob/main/contracts/contracts/OptionPutFactory.sol

@Chainlink We are using Chainlink for the underlying asset price oracle. Chainlink oracle is modular and is deployed across multiple testnets. https://mumbai.polygonscan.com/address/0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada https://mumbai.polygonscan.com/address/0x0715A7794a1dc8e42615F059dD6e406A6594651A

@EPNS We are using EPNS to notify option buyers when they can exercise their options. We think that in the normal option market, the users do not know when to exercise their options. EPNS solved this problem. https://staging.epns.io/#/channels (FOP - Fluid Options) https://fop-fluid-options.herokuapp.com/notifications https://github.com/mrmuffinnxz/fop-fluid-options/blob/main/epns/main.js

@UnstoppableDomains We use Unstoppable Domains for our domain. It allows us to build a censorship-resistant website. https://ud.me/fluidoptions.888

@IPFS We deployed our front-end to IPFS. It allows us to store, request, and transfer data via a verifiable marketplace. https://ipfs.io/ipfs/QmcGniy81YECrRo9TT7svFDygYGuAqDp8j1nnx3iFWvLXs
