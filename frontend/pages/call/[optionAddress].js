import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import { useAccount } from "wagmi";
import TradeableCallOption from "../../../contracts/artifacts/contracts/TradeableCallOption.sol/TradeableCallOption.json";

export default function User() {
    const router = useRouter();
    const { address, isConnected } = useAccount();
    const [optionAddress, setOptionAddress] = useState();
    const [optionData, setOptionData] = useState();

    const getContractData = async (address) => {
        const provider = ethers.getDefaultProvider("goerli");
        const contract = new ethers.Contract(
            address,
            TradeableCallOption.abi,
            provider
        );
        const reciever = await contract._receiver();
        setOptionData({ reciever: reciever });
    };

    useEffect(() => {
        setOptionAddress(router.query.optionAddress);
        if (router.isReady) {
            console.log("ready");
            getContractData(router.query.optionAddress);
        } else {
            console.log("loading");
        }
    }, [router.isReady]);

    return (
        <div className=" h-screen">
            <h1>optionAddress:{optionAddress}</h1>
            {optionData ? (
                isConnected ? (
                    optionData.reciever === address ? (
                        <button>approve underlying asset</button>
                    ) : (
                        <button>create flow</button>
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
