import OptionFactory from "../../contracts/artifacts/contracts/OptionFactory.sol/OptionFactory.json";
import OptionPutFactory from "../../contracts/artifacts/contracts/OptionPutFactory.sol/OptionPutFactory.json";
import { useState } from "react";
import { ethers } from "ethers";
import styles from "../styles/OptionDetail.module.css";

import { Input } from "@nextui-org/react";
import { Button } from "@nextui-org/react";
import { Card } from "@nextui-org/react";
import { Container } from "@nextui-org/react";
import DropDownList from "../components/DropDownList";
import { useAccount } from "wagmi";

const OptionType = {
    CALL: "call",
    PUT: "put",
};

async function requestAccount() {
    await window.ethereum.request({ method: "eth_requestAccounts" });
}

const underlyAssetOptions = [
    // {
    //     value: {
    //         address: "0x88271d333C72e51516B67f5567c728E702b3eeE8",
    //         decimal: 18,
    //     },
    //     label: "fDAI",
    //     pricefeed: {
    //         address: "0x0d79df66BE487753B02D015Fb622DED7f0E9798d",
    //         decimal: 8,
    //     },
    // },
    {
        value: {
            address: "0x326C977E6efc84E512bB9C30f76E30c160eD06FB",
            decimal: 18,
        },
        label: "LINK",
        pricefeed: {
            address: "0x48731cF7e84dc94C5f84577882c14Be11a5B7456",
            decimal: 8,
        },
    },
    // {
    //   value: {
    //     address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    //     decimal: 18,
    //   },
    //   label: "usdt",
    // },
];

const CallFactoryAddress = "0xca0BF23f1Ea4E08ea053691C0Dd0C066b0c31665";
const PutFactoryAddress = "0x264569c1325C26e41832dE6C8D978d59fCb05D60";
const fDAIx = "0xF2d68898557cCb2Cf4C10c3Ef2B034b2a69DAD00";
const dai = "0x88271d333C72e51516B67f5567c728E702b3eeE8";

export default function CreateOption() {
    const [optionType, setOptionType] = useState(OptionType.CALL);
    const [selectToken, setSelectToken] = useState();
    const { isConnected } = useAccount();
    const [underlyingAmount, setUnderlyingAmount] = useState();
    const [purchasingAmount, setPurchasingAmount] = useState();
    const [requiredFlowRate, setRequiredFlowRate] = useState();
    const [expiryDate, setExpiryDate] = useState();

    const handleFieldChange = (_token) => {
        setSelectToken(_token);
    };

    function getTime(val) {
        val = new Date(val);
        return val.getTime() / 1000.0;
    }

    const getCurrentTimeStamp = () => {
        let val = new Date();
        return val.getTime() / 1000.0;
    };

    const OptionTypeGroup = () => {
        return (
            <Button.Group css={{ m: 0 }}>
                <Button
                    onPress={() => setOptionType(OptionType.CALL)}
                    bordered={optionType != OptionType.CALL}
                >
                    CALL
                </Button>
                <Button
                    onPress={() => setOptionType(OptionType.PUT)}
                    bordered={optionType != OptionType.PUT}
                >
                    PUT
                </Button>
            </Button.Group>
        );
    };

    async function mintOption(e) {
        e.preventDefault();
        let type = optionType == "call" ? "CALL" : "PUT";
        let date = String(new Date(e.target[9].value));
        let format_date =
            date.substring(8, 10) +
            date.substring(4, 7) +
            date.substring(11, 15);
        let name =
            type +
            "-" +
            String(parseInt(e.target[5].value) / parseInt(e.target[2].value)) +
            "-" +
            "[" +
            selectToken.label +
            "/" +
            "fDAI" +
            "]" +
            "-" +
            "[" +
            e.target[2].value +
            "/" +
            e.target[5].value +
            "]" +
            "-" +
            "fDAIx" +
            "-" +
            format_date;
        console.log(name);
        console.log(e.target);
        if (typeof window.ethereum !== "undefined") {
            await requestAccount();
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(
                optionType == "call" ? CallFactoryAddress : PutFactoryAddress,
                optionType == "call" ? OptionFactory.abi : OptionPutFactory.abi,
                signer
            );
            console.log(
                ethers.utils.parseEther(e.target[2].value),
                e.target[2].value
            );
            console.log(
                ethers.utils.parseEther(e.target[5].value),
                e.target[5].value
            );

            try {
        let now = new Date().toJSON().slice(0, 10);
        if (e.target[9].value < now) {
          // check date should be in future
          throw "Date must be in the future";
        }
        if (optionType == "call" && e.target[5].value < e.target[2].value) {
          // check call & strike price more than underlying
          throw "strike price must be more than underlying";
        }
        let addr = await signer.getAddress();
        optionType == "call"
          ? await contract.mintCallOption(
              addr,
              name,
              fDAIx, //TODO: change if we have other option
              dai, ////TODO: change if we have other option
              String(selectToken.value.address),
              ethers.utils.parseEther(e.target[2].value)._hex, // TODO might change if decimal is not 18 but this case is link
              selectToken.value.decimal,
              String(selectToken.pricefeed.address),
              selectToken.pricefeed.decimal,
              e.target[7].value,
              getTime(e.target[9].value),
              ethers.utils.parseEther(e.target[5].value)._hex
              // web3.utils.toWei(e.target[2].value, "ether") // TODO might change if decimal is not 18 but this case is dai
            )
          : await contract.mintPutOption(
              addr,
              name,
              fDAIx,
              dai,
              String(selectToken.value.address),
              ethers.utils.parseEther(e.target[2].value)._hex,
              selectToken.value.decimal,
              String(selectToken.pricefeed.address),
              selectToken.pricefeed.decimal,
              e.target[7].value,
              getTime(e.target[9].value),
              ethers.utils.parseEther(e.target[5].value)._hex
                      );
                // const data = await contract.mintCallOption(
                //   addr,
                //   "test1",
                //   fDAIx,
                //   dai,
                //   "0x326C977E6efc84E512bB9C30f76E30c160eD06FB",
                //   web3.utils.toWei("1", "ether"),
                //   "18",
                //   "0x13012595e6fC822D40795949b8c7a7c4C9761E58",
                //   "18",
                //   "38580246913580",
                //   getTime(e.target[9].value),
                //   web3.utils.toWei("2", "ether")
                // );
                console.log("mint success");
            } catch (err) {
                console.log("Error: ", err);
            }
        }
    }

    return (
        <section className="flex flex-col justify-center items-center space-y-3  mx-20 mt-6">
            <div
                className={styles.option_detail_card_list}
                style={{ marginTop: "25px" }}
            >
                <div className={styles.option_detail_card}>
                    <div className={styles.option_detail_card_title}>
                        Strike Price (fDAI)
                    </div>
                    <div className={styles.option_detail_card_value}>
                        {!underlyingAmount || !purchasingAmount
                            ? "-"
                            : optionType === OptionType.CALL
                            ? (purchasingAmount / underlyingAmount).toFixed(6)
                            : (underlyingAmount / purchasingAmount).toFixed(6)}
                    </div>
                </div>
                <div
                    className={styles.option_detail_card}
                    style={{ width: "350px" }}
                >
                    <div className={styles.option_detail_card_title}>
                        Estimate Life-time Premium (fDAIx)
                    </div>
                    <div className={styles.option_detail_card_value}>
                        {!requiredFlowRate || !expiryDate
                            ? "-"
                            : (
                                  (requiredFlowRate / 86400) *
                                  (getTime(expiryDate) - getCurrentTimeStamp())
                              ).toFixed(8)}
                    </div>
                </div>
            </div>
            <Container>
                <Card css={{ padding: "$4 $4" }}>
                    <form
                        onSubmit={mintOption}
                        className="grid md:grid-cols-3 lg:grid-cols-3 space-x-2 space-y-3 items-center border-blue-200 border-solid border-2 p-2 rounded-xl"
                    >
                        <div className="flex justify-start ml-16 mt-3">
                            <OptionTypeGroup></OptionTypeGroup>
                        </div>
                        <Input
                            clearable
                            placeholder="Underlying Amount"
                            type="number"
                            min="0"
                            value={underlyingAmount}
                            onChange={(e) => {
                                e.preventDefault();
                                setUnderlyingAmount(parseFloat(e.target.value));
                            }}
                            step="any"
                            required
                        ></Input>
                        <DropDownList
                            onChangeF={handleFieldChange}
                            options={underlyAssetOptions}
                            placeholder="Underlying Asset"
                            required
                        />
                        <Input
                            clearable
                            placeholder={
                                optionType === OptionType.CALL
                                    ? "Purchasing Amount (fDai)"
                                    : "Collateral Amount (fDai)"
                            }
                            type="number"
                            min="0"
                            value={purchasingAmount}
                            onChange={(e) => {
                                e.preventDefault();
                                setPurchasingAmount(parseFloat(e.target.value));
                            }}
                            step="any"
                            required
                        ></Input>
                        <Input
                            clearable
                            placeholder="Premium (fDaix/Day)"
                            type="number"
                            min="0"
                            value={requiredFlowRate}
                            onChange={(e) => {
                                e.preventDefault();
                                setRequiredFlowRate(parseFloat(e.target.value));
                            }}
                            step="any"
                            required
                        ></Input>
                        <Input
                            clearable
                            placeholder="expiration"
                            type="date"
                            value={expiryDate}
                            onChange={(e) => {
                                e.preventDefault();
                                setExpiryDate(e.target.value);
                            }}
                            required
                        ></Input>
                        <div></div>
                        <Button type="submit" disabled={!isConnected}>Create Option</Button>
                    </form>
                </Card>
            </Container>
        </section>
    );
}
