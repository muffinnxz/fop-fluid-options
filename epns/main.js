const ethers = require("ethers");
const sfsdk = require("@superfluid-finance/sdk-core");
const EpnsAPI = require("@epnsproject/sdk-restapi");
const dotenv = require("dotenv");

dotenv.config();

const CAIP = "eip155:42:";
const channelAddress = "0x8dddb1f327113a90d6819c3a9ca574e6a81caeee";
const CallFactoryAddress = "0xb5fd8b23C8085d3d767d3817e89F111d320de151";
const PutFactoryAddress = "0x2C231969fd81f9AF0Dfda4fd4E5088948438e230";
const fDAI = "0x15F0Ca26781C3852f8166eD2ebce5D18265cceb7";
const fDAIx = "0x5D8B4C2554aeB7e86F387B4d6c00Ac33499Ed01f";
const LINK = "0x326C977E6efc84E512bB9C30f76E30c160eD06FB";

const goerliTokenName = {
    "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889": "wMatic",
    "0x15F0Ca26781C3852f8166eD2ebce5D18265cceb7": "fDAI",
    "0x5D8B4C2554aeB7e86F387B4d6c00Ac33499Ed01f": "fDAIx",
    "0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa": "WETH",
};

const goerliTokenDecimal = {
    "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889": 1e18,
    "0x15F0Ca26781C3852f8166eD2ebce5D18265cceb7": 1e18,
    "0x5D8B4C2554aeB7e86F387B4d6c00Ac33499Ed01f": 1e18,
    "0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa": 1e18,
};

const OptionFactory = require("../contracts/artifacts/contracts/OptionFactory.sol/OptionFactory.json");
const OptionPutFactory = require("../contracts/artifacts/contracts/OptionPutFactory.sol/OptionPutFactory.json");
const TradeableCallOption = require("../contracts/artifacts/contracts/TradeableCallOption.sol/TradeableCallOption.json");
const TradeablePutOption = require("../contracts/artifacts/contracts/TradeablePutOption.sol/TradeablePutOption.json");
const MockV3Aggregator = require("../contracts/artifacts/contracts/test/MockV3Aggregator.sol/MockV3Aggregator.json");

const mumbai = {
    name: "maticmum",
    chainId: 80001,
    _defaultProvider: (providers) => new providers.JsonRpcProvider("rpc-url"),
};

let subscribers = null;

async function callNotify(optionAddress) {
    // console.log("Notify Call", optionAddress);
    try {
        const provider = new ethers.providers.AlchemyProvider("maticmum");
        const sf = await sfsdk.Framework.create({
            chainId: Number(80001),
            provider: provider,
        });
        const contract = new ethers.Contract(
            optionAddress,
            TradeableCallOption.abi,
            provider
        );

        Promise.all([
            contract._receiver(),
            contract._underlyingAsset(),
            contract._underlyingAmount(),
            contract._dai(),
            contract._strikePrice(),
            contract._priceFeed(),
            contract._acceptedToken(),
            contract._requiredFlowRate(),
            contract._expirationDate(),
            contract.optionReady(),
            contract.optionActive(),
            contract.name(),
            contract._priceFeedDecimals(),
        ])
            .then(async (values) => {
                const optionData = {
                    address: optionAddress,
                    receiver: values[0],
                    underlyingAsset: values[1],
                    underlyingAmount: values[2],
                    purchasingAsset: values[3],
                    purchasingAmount: values[4],
                    priceFeed: values[5],
                    flowAsset: values[6],
                    requiredFlowRate: values[7],
                    expirationDate: values[8],
                    optionReady: values[9],
                    optionActive: values[10],
                    name: values[11],
                    priceFeedDecimals: values[12],
                };
                // console.log("Option Data", optionData);

                if (optionData.optionReady && optionData.optionActive) {
                    try {
                        const priceFeed = new ethers.Contract(
                            optionData.priceFeed,
                            MockV3Aggregator.abi,
                            provider
                        );

                        const currentPrice = await priceFeed.latestRoundData();
                        // console.log(currentPrice);

                        let getFlowPromises = [];
                        subscribers.forEach((subscriber) => {
                            const getFlow = async () => {
                                let flow = await sf.cfaV1.getFlow({
                                    superToken: fDAIx,
                                    sender: subscriber,
                                    receiver: optionAddress,
                                    providerOrSigner: provider,
                                });
                                return {
                                    flow: flow,
                                    subscriber: subscriber,
                                };
                            };
                            getFlowPromises.push(getFlow());
                        });
                        Promise.all(getFlowPromises)
                            .then((values) => {
                                let notifyPromises = [];
                                values.forEach((v) => {
                                    if (
                                        v.flow.deposit >=
                                            optionData.requiredFlowRate &&
                                        currentPrice[1] /
                                            10 **
                                                optionData.priceFeedDecimals >=
                                            optionData.purchasingAmount /
                                                goerliTokenDecimal[
                                                    optionData.purchasingAsset
                                                ] /
                                                (optionData.underlyingAmount /
                                                    goerliTokenDecimal[
                                                        optionData
                                                            .underlyingAsset
                                                    ])
                                    ) {
                                        const notify = async () => {
                                            const PK =
                                                process.env
                                                    .REACT_APP_EPNS_OWNER;
                                            const Pkey = `0x${PK}`;
                                            const signer = new ethers.Wallet(
                                                Pkey
                                            );
                                            const apiResponse =
                                                await EpnsAPI.payloads.sendNotification(
                                                    {
                                                        signer,
                                                        type: 3, // target
                                                        identityType: 2, // direct payload
                                                        notification: {
                                                            title: `Your call option is now exercisable!`,
                                                            body: `Your option "${
                                                                optionData.name
                                                            }" (${
                                                                optionData.address
                                                            }) is now exercisable! Check more detail at ${
                                                                "https://fop-fluid-options.herokuapp.com/call/" +
                                                                optionData.address
                                                            }`,
                                                        },
                                                        payload: {
                                                            title: `Fluid Options - Exercise Alert`,
                                                            body: `Your option is exercisable`,
                                                            cta: "",
                                                            img: "",
                                                        },
                                                        recipients:
                                                            CAIP + v.subscriber, // recipient address
                                                        channel:
                                                            CAIP +
                                                            channelAddress, // your channel address
                                                        env: "staging",
                                                    }
                                                );
                                            return apiResponse;
                                        };
                                        console.log(
                                            "Confrim Call Notify",
                                            optionAddress,
                                            v.subscriber
                                        );
                                        notifyPromises.push(notify());
                                    }
                                });
                                Promise.all(notifyPromises)
                                    .then((values) => {
                                        // console.log("Finish Notify", optionAddress, values);
                                    })
                                    .catch((err) => {});
                            })
                            .catch((err) => {
                                // console.log(err);
                            });
                    } catch (err) {}
                }
            })
            .catch((err) => {});
    } catch (err) {
        // console.log("Error: ", err);
    }
}

async function checkCallOption() {
    const provider = new ethers.providers.AlchemyProvider("maticmum");
    const contract = new ethers.Contract(
        CallFactoryAddress,
        OptionFactory.abi,
        provider
    );
    try {
        contract
            .getCallOptions()
            .then(([...data]) => {
                data.forEach((option) => {
                    callNotify(option);
                });
            })
            .catch((err) => {});
    } catch (err) {
        // console.log("Error: ", err);
    }
}

async function putNotify(optionAddress) {
    // console.log("Notify Put", optionAddress);
    try {
        const provider = new ethers.providers.AlchemyProvider("maticmum");
        const sf = await sfsdk.Framework.create({
            chainId: Number(80001),
            provider: provider,
        });
        const contract = new ethers.Contract(
            optionAddress,
            TradeablePutOption.abi,
            provider
        );

        Promise.all([
            contract._receiver(),
            contract._dai(),
            contract._underlyingAmount(),
            contract._purchasingAsset(),
            contract._strikePrice(),
            contract._priceFeed(),
            contract._acceptedToken(),
            contract._requiredFlowRate(),
            contract._expirationDate(),
            contract.optionReady(),
            contract.optionActive(),
            contract.name(),
            contract._priceFeedDecimals(),
        ])
            .then(async (values) => {
                const optionData = {
                    address: optionAddress,
                    receiver: values[0],
                    underlyingAsset: values[1],
                    underlyingAmount: values[2],
                    purchasingAsset: values[3],
                    purchasingAmount: values[4],
                    priceFeed: values[5],
                    flowAsset: values[6],
                    requiredFlowRate: values[7],
                    expirationDate: values[8],
                    optionReady: values[9],
                    optionActive: values[10],
                    name: values[11],
                    priceFeedDecimals: values[12],
                };
                // console.log("Option Data", optionData);

                if (optionData.optionReady && optionData.optionActive) {
                    try {
                        const priceFeed = new ethers.Contract(
                            optionData.priceFeed,
                            MockV3Aggregator.abi,
                            provider
                        );

                        const currentPrice = await priceFeed.latestRoundData();
                        // console.log(currentPrice);

                        let getFlowPromises = [];
                        subscribers.forEach((subscriber) => {
                            const getFlow = async () => {
                                let flow = await sf.cfaV1.getFlow({
                                    superToken: fDAIx,
                                    sender: subscriber,
                                    receiver: optionAddress,
                                    providerOrSigner: provider,
                                });
                                return {
                                    flow: flow,
                                    subscriber: subscriber,
                                };
                            };
                            getFlowPromises.push(getFlow());
                        });
                        Promise.all(getFlowPromises).then((values) => {
                            let notifyPromises = [];
                            values.forEach((v) => {
                                if (
                                    v.flow.deposit >=
                                        optionData.requiredFlowRate &&
                                    currentPrice[1] /
                                        10 ** optionData.priceFeedDecimals <=
                                        optionData.underlyingAmount /
                                            goerliTokenDecimal[
                                                optionData.underlyingAsset
                                            ] /
                                            (optionData.purchasingAmount /
                                                goerliTokenDecimal[
                                                    optionData.purchasingAsset
                                                ])
                                ) {
                                    const notify = async () => {
                                        const PK =
                                            process.env.REACT_APP_EPNS_OWNER;
                                        const Pkey = `0x${PK}`;
                                        const signer = new ethers.Wallet(Pkey);
                                        const apiResponse =
                                            await EpnsAPI.payloads.sendNotification(
                                                {
                                                    signer,
                                                    type: 3, // target
                                                    identityType: 2, // direct payload
                                                    notification: {
                                                        title: `Your put option is now exercisable!`,
                                                        body: `Your option "${
                                                            optionData.name
                                                        }" (${
                                                            optionData.address
                                                        }) is now exercisable! Check more detail at ${
                                                            "https://fop-fluid-options.herokuapp.com/put/" +
                                                            optionData.address
                                                        }`,
                                                    },
                                                    payload: {
                                                        title: `Fluid Options - Exercise Alert`,
                                                        body: `Your option is exercisable`,
                                                        cta: "",
                                                        img: "",
                                                    },
                                                    recipients:
                                                        CAIP + v.subscriber, // recipient address
                                                    channel:
                                                        CAIP + channelAddress, // your channel address
                                                    env: "staging",
                                                }
                                            );
                                        return apiResponse;
                                    };
                                    console.log(
                                        "Confrim Put Notify",
                                        optionAddress,
                                        v.subscriber
                                    );
                                    notifyPromises.push(notify());
                                }
                            });
                            Promise.all(notifyPromises).then((values) => {
                                // console.log("Finish Notify", optionAddress, values);
                            });
                        });
                    } catch (err) {
                        // console.log("Error: ", err);
                    }
                }
            })
            .catch((err) => {
                // console.log(err);
            });
    } catch (err) {
        // console.log("Error: ", err);
    }
}

async function checkPutOption() {
    const provider = new ethers.providers.AlchemyProvider("maticmum");
    const contract = new ethers.Contract(
        PutFactoryAddress,
        OptionPutFactory.abi,
        provider
    );
    try {
        contract
            .getPutOptions()
            .then(([...data]) => {
                data.forEach((option) => {
                    putNotify(option);
                });
            })
            .catch((err) => {
                // console.log(err);
            });
    } catch (err) {
        // console.log("Error: ", err);
    }
}

async function getSubscriber() {
    subscribers = await EpnsAPI.channels._getSubscribers({
        channel: CAIP + channelAddress, // channel address in CAIP
        env: "staging",
    });
    subscribers = [...new Set(subscribers)];
    // console.log("subscribers", subscribers);
}

async function dailyNotify() {
    console.log("Start Checking...");
    await getSubscriber();
    checkCallOption();
    checkPutOption();
}

dailyNotify();
