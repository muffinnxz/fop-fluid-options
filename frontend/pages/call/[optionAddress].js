import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import { useAccount } from "wagmi";
import TradeableCallOption from "../../../contracts/artifacts/contracts/TradeableCallOption.sol/TradeableCallOption.json";
import { Framework } from "@superfluid-finance/sdk-core";
import LinkToken from "../../datas/abis/LinkToken.json";
import fDAIToken from "../../datas/abis/fDAIToken.json";
import { QRCodeSVG } from "qrcode.react";
import styles from "../../styles/OptionDetail.module.css";
import { Blocks } from "react-loader-spinner";
import {
    goerliTokenDecimal,
    goerliTokenName,
} from "../../datas/AddressDictionary";
import ConnectWallet from "../../components/ConnectButton";
import { Button } from "@mui/material";

export default function User() {
    const router = useRouter();
    const { address, isConnected } = useAccount();
    const [optionData, setOptionData] = useState();
    const [underlyingAllowance, setUnderlyingAllowance] = useState();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (router.isReady) {
            getContractData(router.query.optionAddress);
        }
    }, [router.isReady]);

    useEffect(() => {
        if (optionData && address && optionData.reciever === address) {
            checkUserUnderlyingAllowance();
        }
    }, [optionData, address]);

    const timestampToDateTime = (timestamp) => {
        const date = new Date(parseInt(timestamp));
        return date.toLocaleDateString();
        // return date.toLocaleDateString() + " " + date.toLocaleTimeString();
    };

    const checkUserUnderlyingAllowance = async () => {
        const provider = ethers.getDefaultProvider("goerli");
        const link = new ethers.Contract(
            optionData.underlyingAsset,
            LinkToken.result,
            provider
        );
        try {
            let underlyingAllowance = await link.allowance(
                address,
                router.query.optionAddress
            );
            setUnderlyingAllowance(underlyingAllowance);
        } catch (err) {
            console.log("Error: ", err);
        }
    };

    const getContractData = async (address) => {
        const provider = ethers.getDefaultProvider("goerli");
        const contract = new ethers.Contract(
            address,
            TradeableCallOption.abi,
            provider
        );
        try {
            const reciever = await contract._receiver();
            const underlyingAsset = await contract._underlyingAsset();
            const underlyingAmount = await contract._underlyingAmount();
            const purchasingAsset = await contract._dai();
            const purchasingAmount = await contract._strikePrice();
            const priceFeed = await contract._priceFeed();
            const flowAsset = await contract._acceptedToken();
            const requiredFlowRate = await contract._requiredFlowRate();
            const expirationDate = await contract._expirationDate();
            const optionReady = await contract.optionReady();
            const optionActive = await contract.optionActive();
            setOptionData({
                address: address,
                reciever: reciever,
                underlyingAsset: underlyingAsset,
                underlyingAmount: underlyingAmount,
                purchasingAsset: purchasingAsset,
                purchasingAmount: purchasingAmount,
                priceFeed: priceFeed,
                flowAsset: flowAsset,
                requiredFlowRate: requiredFlowRate,
                expirationDate: expirationDate,
                optionReady: optionReady,
                optionActive: optionActive,
            });
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
        const link = new ethers.Contract(
            optionData.underlyingAsset,
            LinkToken.result,
            signer
        );

        try {
            const underlyingAmount = await contract._underlyingAmount();
            let tx = await link.approve(
                router.query.optionAddress,
                underlyingAmount
            );
            await tx.wait();
        } catch (err) {
            console.log("Error: ", err);
        }
    };

    //where the Superfluid logic takes place
    async function createNewFlow(recipient, flowRate) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);

        const signer = provider.getSigner();

        const chainId = await window.ethereum.request({
            method: "eth_chainId",
        });
        const sf = await Framework.create({
            chainId: Number(chainId),
            provider: provider,
        });

        const DAIxContract = await sf.loadSuperToken("fDAIx");
        const DAIx = DAIxContract.address;

        try {
            const createFlowOperation = sf.cfaV1.createFlow({
                receiver: recipient,
                flowRate: flowRate,
                superToken: DAIx,
                // userData?: string
            });

            console.log("Creating your stream...");

            const result = await createFlowOperation.exec(signer);
            console.log(result);

            console.log(
                `Congrats - you've just created a money stream!
                View Your Stream At: https://app.superfluid.finance/dashboard/${recipient}
                Network: Kovan
                Super Token: DAIx
                Sender: 0xDCB45e4f6762C3D7C61a00e96Fb94ADb7Cf27721
                Receiver: ${recipient},
                FlowRate: ${flowRate}
                `
            );
        } catch (error) {
            console.log(
                "Hmmm, your transaction threw an error. Make sure that this stream does not already exist, and that you've entered a valid Ethereum address!"
            );
            console.error(error);
        }
    }

    const createFlow = async () => {
        console.log("Start create flow...");
        const provider = ethers.getDefaultProvider("goerli");
        const contract = new ethers.Contract(
            router.query.optionAddress,
            TradeableCallOption.abi,
            provider
        );
        const flowRate = await contract._requiredFlowRate();
        console.log(
            router.query.optionAddress,
            ethers.BigNumber.from(optionData.requiredFlowRate).toString()
        );
        await createNewFlow(
            router.query.optionAddress,
            ethers.BigNumber.from(flowRate).toString()
        );
    };

    //where the Superfluid logic takes place
    async function deleteFlow(recipient) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);

        const signer = provider.getSigner();

        const chainId = await window.ethereum.request({
            method: "eth_chainId",
        });
        const sf = await Framework.create({
            chainId: Number(chainId),
            provider: provider,
        });

        const DAIxContract = await sf.loadSuperToken("fDAIx");
        const DAIx = DAIxContract.address;

        try {
            const deleteFlowOperation = sf.cfaV1.deleteFlow({
                sender: address,
                receiver: recipient,
                superToken: DAIx,
                // userData?: string
            });

            console.log("Deleting your stream...");

            await deleteFlowOperation.exec(signer);

            console.log(
                `Congrats - you've just deleted your money stream!
         Network: Kovan
         Super Token: DAIx
         Sender: 0xDCB45e4f6762C3D7C61a00e96Fb94ADb7Cf27721
         Receiver: ${recipient}
      `
            );
        } catch (error) {
            console.error(error);
        }
    }

    const exerciseOption = async () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
            router.query.optionAddress,
            TradeableCallOption.abi,
            signer
        );
        const fDAI = new ethers.Contract(
            "0x88271d333C72e51516B67f5567c728E702b3eeE8",
            fDAIToken.result,
            signer
        );
        try {
            const strikePrice = await contract._strikePrice();
            let tx = await fDAI.approve(
                router.query.optionAddress,
                strikePrice
            );
            await tx.wait();
            let tx2 = await contract.exerciseOption();
            await tx2.wait();
        } catch (err) {
            console.log("Error: ", err);
        }
    };

    if (!optionData) {
        return (
            <div className={styles.option_detail_page}>
                <div className={styles.option_detail_header}>
                    <Blocks
                        visible={true}
                        height="80"
                        width="80"
                        ariaLabel="blocks-loading"
                        wrapperStyle={{}}
                        wrapperClass="blocks-wrapper"
                    />
                    <div
                        style={{
                            fontSize: "24px",
                        }}
                    >
                        Loading...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.option_detail_page}>
            <div className={styles.option_detail_header}>
                <div
                    style={{
                        fontSize: "24px",
                        fontWeight: "bold",
                    }}
                >
                    Call Option
                </div>
                <div
                    style={{
                        marginTop: "10px",
                        marginBottom: "10px",
                    }}
                >
                    <QRCodeSVG
                        value={"http://localhost:3000" + router.asPath}
                    />
                </div>
                <div>address : {optionData.address}</div>
            </div>
            <div
                className={styles.option_detail_card_list}
                style={{ marginTop: "25px" }}
            >
                <div className={styles.option_detail_card}>
                    <div className={styles.option_detail_card_title}>Pair</div>
                    <div className={styles.option_detail_card_value}>
                        {goerliTokenName[optionData.underlyingAsset]} /{" "}
                        {goerliTokenName[optionData.purchasingAsset]}
                    </div>
                </div>
                <div className={styles.option_detail_card}>
                    <div className={styles.option_detail_card_title}>
                        Underlying {goerliTokenName[optionData.underlyingAsset]}{" "}
                    </div>
                    <div className={styles.option_detail_card_value}>
                        {(
                            optionData.underlyingAmount /
                            goerliTokenDecimal[optionData.underlyingAsset]
                        ).toString()}
                    </div>
                </div>
                <div className={styles.option_detail_card}>
                    <div className={styles.option_detail_card_title}>
                        Strike {goerliTokenName[optionData.purchasingAsset]}{" "}
                    </div>
                    <div className={styles.option_detail_card_value}>
                        {(
                            optionData.purchasingAmount /
                            goerliTokenDecimal[optionData.purchasingAsset]
                        ).toString()}
                    </div>
                </div>
                <div className={styles.option_detail_card}>
                    <div className={styles.option_detail_card_title}>
                        Flow {goerliTokenName[optionData.flowAsset]} / day
                    </div>
                    <div className={styles.option_detail_card_value}>
                        {(
                            (optionData.requiredFlowRate /
                                goerliTokenDecimal[optionData.flowAsset]) *
                            86400
                        )
                            .toFixed(12)
                            .toString()}
                    </div>
                </div>
                <div className={styles.option_detail_card}>
                    <div className={styles.option_detail_card_title}>
                        Expiration
                    </div>
                    <div className={styles.option_detail_card_value}>
                        {!optionData.optionReady && !optionData.optionActive
                            ? "Expired"
                            : timestampToDateTime(optionData.expirationDate)}
                    </div>
                </div>
            </div>
            <div
                className={styles.option_detail_header}
                style={{ marginTop: "20px" }}
            >
                <ConnectWallet />
                {isLoading ? (
                    <Blocks
                        visible={true}
                        height="80"
                        width="80"
                        ariaLabel="blocks-loading"
                        wrapperStyle={{}}
                        wrapperClass="blocks-wrapper"
                    />
                ) : (
                    isConnected &&
                    (optionData.optionReady ? (
                        <div style={{ marginTop: "20px" }}>
                            {optionData.reciever === address ? (
                                underlyingAllowance ? (
                                    underlyingAllowance >=
                                    optionData.underlyingAmount ? (
                                        <div>
                                            You already approve sufficient
                                            amount of the underlying asset (
                                            {
                                                goerliTokenName[
                                                    optionData.underlyingAsset
                                                ]
                                            }
                                            )
                                        </div>
                                    ) : (
                                        <Button
                                            variant="contained"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                approveUnderlyingAsset();
                                            }}
                                        >
                                            Approving Underlying Asset
                                        </Button>
                                    )
                                ) : (
                                    <Blocks
                                        visible={true}
                                        height="40"
                                        width="40"
                                        ariaLabel="blocks-loading"
                                        wrapperStyle={{}}
                                        wrapperClass="blocks-wrapper"
                                    />
                                )
                            ) : (
                                <div>
                                    <Button
                                        variant="contained"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            createFlow();
                                        }}
                                    >
                                        Create Flow
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            exerciseOption();
                                        }}
                                        style={{ marginLeft: "20px" }}
                                    >
                                        Exercise Option
                                    </Button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={{ marginTop: "20px" }}>
                            Option is not ready, already closed, or expire!
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
