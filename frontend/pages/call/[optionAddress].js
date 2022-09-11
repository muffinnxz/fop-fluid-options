import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import { useAccount, useProvider, useSigner } from "wagmi";
import TradeableCallOption from "../../../contracts/artifacts/contracts/TradeableCallOption.sol/TradeableCallOption.json";

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

    const approveUnderlyingAsset = async () => {};

    const createFlow = async () => {};

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
