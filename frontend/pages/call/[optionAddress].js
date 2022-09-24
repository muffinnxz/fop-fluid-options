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
import { Button, IconButton, Tooltip } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

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
                optionData.receiver,
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
                contract.name(),
            ]).then((values) => {
                const optionData = {
                    address: address,
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
            let tx = await link.approve(
                router.query.optionAddress,
                optionData.underlyingAmount
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
    function getDate(x) {
        const myDate = new Date(x * 1000);
        return myDate;
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
            optionData.purchasingAsset,
            fDAIToken.result,
            signer
        );
        try {
            let tx = await fDAI.approve(
                router.query.optionAddress,
                optionData.purchasingAmount
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

    if (!optionData || !flowRateInfo) {
        return (
            <div className={styles.option_detail_page}>
                <div className={styles.option_detail_header}>
                    <Blocks
                        visible={true}
                        height="80"
                        width="80"
                        ariaLabel="blocks-loading"
                        wrapperStyle={{}}
                        wrapperclassName="blocks-wrapper"
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
                        value={
                            "https://fop-fluid-options.herokuapp.com/" +
                            router.asPath
                        }
                    />
                </div>
                <div style={{ fontWeight: "bold", marginBottom: "10px" }}>
                    {optionData.name}
                </div>
                <div>
                    address : {optionData.address}
                    <IconButton
                        aria-label="Check in etherscan"
                        onClick={() => {
                            window.open(
                                `https://goerli.etherscan.io/address/${optionData.address}`,
                                "_blank",
                                "noopener,noreferrer"
                            );
                        }}
                    >
                        <SearchIcon />
                    </IconButton>
                </div>
                <div>
                    owner : {optionData.receiver}
                    <IconButton
                        aria-label="Check in etherscan"
                        onClick={() => {
                            window.open(
                                `https://goerli.etherscan.io/address/${optionData.receiver}`,
                                "_blank",
                                "noopener,noreferrer"
                            );
                        }}
                    >
                        <SearchIcon />
                    </IconButton>
                </div>
            </div>
            <div
                className={styles.option_detail_card_list}
                style={{ marginTop: "25px" }}
            >
                <div className={styles.option_detail_card}>
                    <div className={styles.option_detail_card_title}>
                        Underlying Asset
                    </div>
                    <div className={styles.option_detail_card_value}>
                        {goerliTokenName[optionData.underlyingAsset]}
                    </div>
                </div>
                <div className={styles.option_detail_card}>
                    <div className={styles.option_detail_card_title}>
                        Strike Asset
                    </div>
                    <div className={styles.option_detail_card_value}>
                        {goerliTokenName[optionData.purchasingAsset]}
                    </div>
                </div>
                <div className={styles.option_detail_card}>
                    <div className={styles.option_detail_card_title}>
                        Purchasing Asset
                    </div>
                    <div className={styles.option_detail_card_value}>
                        {goerliTokenName[optionData.purchasingAsset]}
                    </div>
                </div>
                <div className={styles.option_detail_card}>
                    <div className={styles.option_detail_card_title}>
                        Premium ({goerliTokenName[optionData.flowAsset]} / day)
                    </div>
                    <Tooltip
                        title={(
                            (optionData.requiredFlowRate /
                                goerliTokenDecimal[optionData.flowAsset]) *
                            86400
                        ).toString()}
                        arrow
                    >
                        <div className={styles.option_detail_card_value}>
                            {(
                                (optionData.requiredFlowRate /
                                    goerliTokenDecimal[optionData.flowAsset]) *
                                86400
                            )
                                .toFixed(6)
                                .toString()}
                        </div>
                    </Tooltip>
                </div>
            </div>
            <div
                className={styles.option_detail_card_list}
                style={{ marginTop: "25px" }}
            >
                <div className={styles.option_detail_card}>
                    <div className={styles.option_detail_card_title}>
                        Collateral Amount
                    </div>
                    <Tooltip
                        title={(
                            optionData.underlyingAmount /
                            goerliTokenDecimal[optionData.underlyingAsset]
                        ).toString()}
                        arrow
                    >
                        <div className={styles.option_detail_card_value}>
                            {(
                                optionData.underlyingAmount /
                                goerliTokenDecimal[optionData.underlyingAsset]
                            )
                                .toFixed(6)
                                .toString()}
                        </div>
                    </Tooltip>
                </div>
                <div className={styles.option_detail_card}>
                    <div className={styles.option_detail_card_title}>
                        Strike Price
                    </div>
                    <Tooltip
                        title={(
                            optionData.purchasingAmount /
                            goerliTokenDecimal[optionData.purchasingAsset] /
                            (optionData.underlyingAmount /
                                goerliTokenDecimal[optionData.underlyingAsset])
                        ).toString()}
                        arrow
                    >
                        <div className={styles.option_detail_card_value}>
                            {(
                                optionData.purchasingAmount /
                                goerliTokenDecimal[optionData.purchasingAsset] /
                                (optionData.underlyingAmount /
                                    goerliTokenDecimal[
                                        optionData.underlyingAsset
                                    ])
                            )
                                .toFixed(6)
                                .toString()}
                        </div>
                    </Tooltip>
                </div>
                <div className={styles.option_detail_card}>
                    <div className={styles.option_detail_card_title}>
                        Purchasing Amount
                    </div>
                    <Tooltip
                        title={(
                            optionData.purchasingAmount /
                            goerliTokenDecimal[optionData.purchasingAsset]
                        ).toString()}
                        arrow
                    >
                        <div className={styles.option_detail_card_value}>
                            {(
                                optionData.purchasingAmount /
                                goerliTokenDecimal[optionData.purchasingAsset]
                            )
                                .toFixed(6)
                                .toString()}
                        </div>
                    </Tooltip>
                </div>
                <div className={styles.option_detail_card}>
                    <div className={styles.option_detail_card_title}>
                        Expiration
                    </div>
                    <div className={styles.option_detail_card_value}>
                        {
                            !optionData.optionReady && !optionData.optionActive
                                ? "Expired"
                                : getDate(optionData.expirationDate)
                                      .toLocaleString()
                                      .substring(0, 9)
                            // : timestampToDateTime(optionData.expirationDate)
                        }
                    </div>
                </div>
            </div>
            <div
                className={styles.option_detail_header}
                style={{ marginTop: "20px" }}
            >
                {isConnected ? (
                    isLoading ||
                    !underlyingAllowance ||
                    !flowRateInfo ? (
                        <Blocks
                            visible={true}
                            height="80"
                            width="80"
                            ariaLabel="blocks-loading"
                            wrapperStyle={{}}
                            wrapperclassName="blocks-wrapper"
                        />
                    ) : optionData.optionReady ? (
                        <div style={{ minWidth: "60%" }}>
                            {optionData.receiver === address ? (
                                underlyingAllowance >=
                                    optionData.underlyingAmount ||
                                optionData.optionActive ? (
                                    <div style={{ textAlign: "center" }}>
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
                                    <div style={{ textAlign: "center" }}>
                                        <Button
                                            variant="contained"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                approveUnderlyingAsset();
                                            }}
                                        >
                                            Approving Underlying Asset
                                        </Button>
                                    </div>
                                )
                            ) : optionData.optionActive ||
                              underlyingAllowance >=
                                  optionData.underlyingAmount ? (
                                <div>
                                    {flowRateInfo &&
                                        ethers.BigNumber.from(
                                            flowRateInfo.flowRate
                                        ) > 0 && (
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
                                                        justifyContent:
                                                            "space-between",
                                                    }}
                                                >
                                                    <div>
                                                        Total{" "}
                                                        {
                                                            goerliTokenName[
                                                                optionData
                                                                    .flowAsset
                                                            ]
                                                        }{" "}
                                                        flow:
                                                    </div>
                                                    <div>
                                                        {(
                                                            flowRateInfo.deposit /
                                                            goerliTokenDecimal[
                                                                optionData
                                                                    .flowAsset
                                                            ]
                                                        )
                                                            .toFixed(6)
                                                            .toString()}
                                                    </div>
                                                </div>
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        flexDirection: "row",
                                                        justifyContent:
                                                            "space-between",
                                                    }}
                                                >
                                                    <div>
                                                        Current{" "}
                                                        {
                                                            goerliTokenName[
                                                                optionData
                                                                    .flowAsset
                                                            ]
                                                        }{" "}
                                                        flow / day:
                                                    </div>
                                                    <div>
                                                        {(
                                                            (flowRateInfo.flowRate /
                                                                goerliTokenDecimal[
                                                                    optionData
                                                                        .flowAsset
                                                                ]) *
                                                            86400
                                                        )
                                                            .toFixed(6)
                                                            .toString()}
                                                    </div>
                                                </div>
                                                {/* <div
                                                    style={{
                                                        display: "flex",
                                                        flexDirection: "row",
                                                        justifyContent:
                                                            "space-between",
                                                    }}
                                                >
                                                    <div>
                                                        Owed{" "}
                                                        {
                                                            goerliTokenName[
                                                                optionData
                                                                    .flowAsset
                                                            ]
                                                        }{" "}
                                                        Flow:
                                                    </div>
                                                    <div>
                                                        {flowRateInfo.owedDeposit /
                                                            goerliTokenDecimal[
                                                                optionData
                                                                    .flowAsset
                                                            ]}
                                                    </div>
                                                </div> */}
                                            </div>
                                        )}

                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "row",
                                            justifyContent: "space-around",
                                        }}
                                    >
                                        <Button
                                            variant="contained"
                                            disabled={optionData.optionActive}
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
                                <div style={{ textAlign: "center" }}>
                                    {
                                        " Option owner haven't approve the underlying asset yet "
                                    }
                                </div>
                            )}
                        </div>
                    ) : (
                        <div>
                            Option is not ready, already closed, or expire!
                        </div>
                    )
                ) : (
                    <div>Please connect your wallet</div>
                )}
            </div>
        </div>
    );
}
