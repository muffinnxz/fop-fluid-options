import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import { useAccount, useProvider, useSigner } from "wagmi";
import TradeableCallOption from "../../../contracts/artifacts/contracts/TradeableCallOption.sol/TradeableCallOption.json";
import { Framework } from "@superfluid-finance/sdk-core";

export default function User() {
    const router = useRouter();
    const { address, isConnected } = useAccount();
    const { data: signer } = useSigner();
    const [optionAddress, setOptionAddress] = useState();
    const [optionData, setOptionData] = useState();

    useEffect(() => {
        setOptionAddress(router.query.optionAddress);
        if (router.isReady) {
            console.log("ready");
            getContractData(router.query.optionAddress);
        } else {
            console.log("loading");
        }
    }, [router.isReady]);

    const getContractData = async (address) => {
        const provider = ethers.getDefaultProvider("goerli");
        const contract = new ethers.Contract(
            address,
            TradeableCallOption.abi,
            provider
        );
        try {
            const reciever = await contract._receiver();
            setOptionData({ reciever: reciever });
        } catch (err) {
            console.log("Error: ", err);
        }
    };

    const approveUnderlyingAsset = async () => {};

    const createFlow = async () => {
        console.log("Start create flow...");
        const provider = new ethers.providers.JsonRpcProvider(
            "https://eth-goerli.g.alchemy.com/v2/wZc5RVdqBMtlqlLySTdU4RcAxY2FcUAI"
        );
        const sf = await Framework.create({
            chainId: 5,
            provider: provider,
        });
        const contract = new ethers.Contract(
            router.query.optionAddress,
            TradeableCallOption.abi,
            ethers.getDefaultProvider("goerli")
        );

        const DAIxContract = await sf.loadSuperToken("fDAIx");
        const DAIx = DAIxContract.address;

        try {
            const flowRate = await contract._requiredFlowRate();
            console.log(
                "FlowRate:",
                flowRate,
                ethers.BigNumber.from(flowRate).toString()
            );
            const createFlowOperation = sf.cfaV1.createFlow({
                flowRate: ethers.BigNumber.from(flowRate).toString(),
                receiver: router.query.optionAddress,
                superToken: DAIx,
            });

            console.log("Creating your stream...");

            const signer = sf.createSigner({
                privateKey:
                    "0xd2ebfb1517ee73c4bd3d209530a7e1c25352542843077109ae77a2c0213375f1",
                provider: provider,
            });

            const result = await createFlowOperation.exec(signer);
            console.log(result);
        } catch (error) {
            console.log(
                "Hmmm, your transaction threw an error. Make sure that this stream does not already exist, and that you've entered a valid Ethereum address!"
            );
            console.error(error);
        }
    };

    return (
        <div className=" h-screen">
            <h1>optionAddress:{optionAddress}</h1>
            {optionData ? (
                isConnected ? (
                    optionData.reciever === address ? (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                approveUnderlyingAsset();
                            }}
                        >
                            approve underlying asset
                        </button>
                    ) : (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                createFlow();
                            }}
                        >
                            create flow
                        </button>
                    )
                ) : (
                    <div>please connect your wallet</div>
                )
            ) : (
                <div>loading...</div>
            )}
        </div>
    );
}
