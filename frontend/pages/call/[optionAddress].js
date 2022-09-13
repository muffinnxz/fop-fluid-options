import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import { useAccount } from "wagmi";
import TradeableCallOption from "../../../contracts/artifacts/contracts/TradeableCallOption.sol/TradeableCallOption.json";
import { Framework } from "@superfluid-finance/sdk-core";

export default function User() {
    const router = useRouter();
    const { address, isConnected } = useAccount();
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

    const approveUnderlyingAsset = async () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
            router.query.optionAddress,
            TradeableCallOption.abi,
            signer
        );

        try {
            let tx = await contract._activateOption();
            await tx.wait();
        } catch (err) {
            console.log("Error: ", err);
        }
    };

    const createFlow = async () => {
        console.log("Start create flow...");
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const chainId = await window.ethereum.request({
            method: "eth_chainId",
        });
        const sf = await Framework.create({
            chainId: Number(chainId),
            provider: provider,
        });

        const contract = new ethers.Contract(
            router.query.optionAddress,
            TradeableCallOption.abi,
            provider
        );

        const DAIxContract = await sf.loadSuperToken("fDAIx");
        const DAIx = DAIxContract.address;

        try {
            const flowRate = await contract._requiredFlowRate();
            const createFlowOperation = sf.cfaV1.createFlow({
                receiver: router.query.optionAddress,
                flowRate: ethers.BigNumber.from(flowRate).toString(),
                superToken: DAIx,
            });

            console.log("Creating your stream...");

            const result = await createFlowOperation.exec(signer);
            console.log(result);

            console.log(
                `Congrats - you've just created a money stream!
                    View Your Stream At: https://app.superfluid.finance/dashboard/${router.query.optionAddress}
                    Network: Kovan
                    Super Token: DAIx
                    Sender: 0xDCB45e4f6762C3D7C61a00e96Fb94ADb7Cf27721
                    Receiver: ${router.query.optionAddress},
                    FlowRate: ${flowRate}
                `
            );
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
