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
    const [flowRateInfo, setFlowRateInfo] = useState();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (router.isReady) {
            getContractData(router.query.optionAddress);
        }
    }, [router.isReady, router.query.optionAddress]);

    useEffect(() => {
        if (optionData && address) {
            checkUserUnderlyingAllowance();
            sfgetflow();
        }
    }, [optionData, address]);

    const timestampToDateTime = (timestamp) => {
        const date = new Date(parseInt(timestamp));
        return date.toLocaleDateString();
        // return date.toLocaleDateString() + " " + date.toLocaleTimeString();
    };

    const checkUserUnderlyingAllowance = async () => {
        setIsLoading(true);
        const provider = ethers.getDefaultProvider("goerli");
        const link = new ethers.Contract(
            optionData.underlyingAsset,
            LinkToken.result,
            provider
        );
        try {
            let underlyingAllowance = await link.allowance(
                optionData.reciever,
                router.query.optionAddress
            );
            setUnderlyingAllowance(underlyingAllowance);
        } catch (err) {
            console.log("Error: ", err);
        }
        setIsLoading(false);
    };

    const getContractData = async (address) => {
        const provider = ethers.getDefaultProvider("goerli");
        const contract = new ethers.Contract(
            address,
            TradeableCallOption.abi,
            provider
        );
        try {
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
            ]).then((values) => {
                const optionData = {
                    address: address,
                    reciever: values[0],
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
                };
                console.log("Option Data", optionData);
                setOptionData(optionData);
            });
        } catch (err) {
            console.log("Error: ", err);
        }
    };

    const approveUnderlyingAsset = async () => {
        setIsLoading(true);
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
            await checkUserUnderlyingAllowance();
        } catch (err) {
            console.log("Error: ", err);
        }
        setIsLoading(false);
    };

    async function sfcreatflow() {
        setIsLoading(true);
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
                receiver: router.query.optionAddress,
                flowRate: ethers.BigNumber.from(
                    optionData.requiredFlowRate
                ).toString(),
                superToken: DAIx,
                // userData?: string
            });

            console.log("Creating your stream...");

            const result = await createFlowOperation.exec(signer);
            console.log(result);

            console.log("successfully create flow");
        } catch (error) {
            console.log(
                "Hmmm, your transaction threw an error. Make sure that this stream does not already exist, and that you've entered a valid Ethereum address!"
            );
            console.error(error);
        }
        setIsLoading(false);
    }

    async function sfdeleteflow() {
        setIsLoading(true);
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
                receiver: router.query.optionAddress,
                superToken: DAIx,
                // userData?: string
            });

            console.log("Deleting your stream...");

            await deleteFlowOperation.exec(signer);

            console.log("successfully delete flow");
        } catch (error) {
            console.error(error);
        }
        setIsLoading(false);
    }

    async function sfgetflow() {
        setIsLoading(true);
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
            const flowInfo = await sf.cfaV1.getFlow({
                superToken: DAIx,
                sender: address,
                receiver: router.query.optionAddress,
                providerOrSigner: provider,
            });
            console.log("flowInfo", flowInfo);
            setFlowRateInfo(flowInfo);
        } catch (error) {
            console.log(
                "Hmmm, your transaction threw an error. Make sure that this stream does not already exist, and that you've entered a valid Ethereum address!"
            );
            console.error(error);
        }
        setIsLoading(false);
    }

    const exerciseOption = async () => {
        setIsLoading(true);
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
            setIsLoading(false);
        } catch (err) {
            console.log("Error: ", err);
            setIsLoading(false);
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
                        )
                            .toFixed(12)
                            .toString()}
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
                        )
                            .toFixed(12)
                            .toString()}
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
                {isConnected &&
                    (isLoading ||
                    !optionData ||
                    !underlyingAllowance ||
                    !flowRateInfo ? (
                        <Blocks
                            visible={true}
                            height="80"
                            width="80"
                            ariaLabel="blocks-loading"
                            wrapperStyle={{}}
                            wrapperClass="blocks-wrapper"
                        />
                    ) : optionData.optionReady ? (
                        <div style={{ marginTop: "20px", minWidth: "60%" }}>
                            {optionData.reciever === address ? (
                                underlyingAllowance >=
                                optionData.underlyingAmount ? (
                                    <div>
                                        You already approve sufficient amount of
                                        the underlying asset (
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
                            ) : optionData.optionActive ||
                              underlyingAllowance >=
                                  optionData.underlyingAmount ? (
                                <div>
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            marginBottom: "20px",
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                flexDirection: "row",
                                                justifyContent: "space-between",
                                            }}
                                        >
                                            <div>
                                                Total{" "}
                                                {
                                                    goerliTokenName[
                                                        optionData.flowAsset
                                                    ]
                                                }{" "}
                                                flow:
                                            </div>
                                            <div>
                                                {(
                                                    flowRateInfo.deposit /
                                                    goerliTokenDecimal[
                                                        optionData.flowAsset
                                                    ]
                                                )
                                                    .toFixed(12)
                                                    .toString()}
                                            </div>
                                        </div>
                                        <div
                                            style={{
                                                display: "flex",
                                                flexDirection: "row",
                                                justifyContent: "space-between",
                                            }}
                                        >
                                            <div>
                                                Current{" "}
                                                {
                                                    goerliTokenName[
                                                        optionData.flowAsset
                                                    ]
                                                }{" "}
                                                flow / day:
                                            </div>
                                            <div>
                                                {(
                                                    (flowRateInfo.flowRate /
                                                        goerliTokenDecimal[
                                                            optionData.flowAsset
                                                        ]) *
                                                    86400
                                                )
                                                    .toFixed(12)
                                                    .toString()}
                                            </div>
                                        </div>
                                        <div
                                            style={{
                                                display: "flex",
                                                flexDirection: "row",
                                                justifyContent: "space-between",
                                            }}
                                        >
                                            <div>
                                                Owed{" "}
                                                {
                                                    goerliTokenName[
                                                        optionData.flowAsset
                                                    ]
                                                }{" "}
                                                Flow:
                                            </div>
                                            <div>
                                                {flowRateInfo.owedDeposit /
                                                    goerliTokenDecimal[
                                                        optionData.flowAsset
                                                    ]}
                                            </div>
                                        </div>
                                    </div>

                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "row",
                                            justifyContent: "space-around",
                                        }}
                                    >
                                        {ethers.BigNumber.from(
                                            flowRateInfo.flowRate
                                        ) < optionData.requiredFlowRate}
                                        <Button
                                            variant="contained"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                sfcreatflow();
                                            }}
                                        >
                                            Create Flow
                                        </Button>
                                        {ethers.BigNumber.from(
                                            flowRateInfo.flowRate
                                        ) > 0 && (
                                            <Button
                                                variant="contained"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    sfdeleteflow();
                                                }}
                                                style={{ marginLeft: "20px" }}
                                            >
                                                Delete Flow
                                            </Button>
                                        )}
                                        {ethers.BigNumber.from(
                                            flowRateInfo.flowRate
                                        ) >= optionData.requiredFlowRate && (
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
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    {
                                        " Option owner haven't approve the underlying asset yet "
                                    }
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={{ marginTop: "20px" }}>
                            Option is not ready, already closed, or expire!
                        </div>
                    ))}
            </div>
        </div>
    );
}
