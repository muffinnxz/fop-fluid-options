import styles from "../styles/Home.module.css";
import { ethers } from "ethers";
import OptionFactory from "../../contracts/artifacts/contracts/OptionFactory.sol/OptionFactory.json";
import OptionPutFactory from "../../contracts/artifacts/contracts/OptionPutFactory.sol/OptionPutFactory.json";
import { useState, useEffect } from "react";
import ConnectWallet from "../components/ConnectButton";
const Web3 = require("web3");

export default function Home() {
  const web3 = new Web3(
    new Web3.providers.HttpProvider(process.env.GOERLI_ALCHEMY_URL)
  );

  const CallFactoryAddress = "0xca0BF23f1Ea4E08ea053691C0Dd0C066b0c31665";
  const PutFactoryAddress = "0x264569c1325C26e41832dE6C8D978d59fCb05D60";
  const fDAIx = "0xF2d68898557cCb2Cf4C10c3Ef2B034b2a69DAD00";
  const dai = "0x88271d333C72e51516B67f5567c728E702b3eeE8";

  const [callOptions, setCallOptions] = useState([]);
  const [putOptions, setPutOptions] = useState([]);

  useEffect(() => {
    getAllCallOption();
    // getAllPutOption();
  }, []);

  async function requestAccount() {
    await window.ethereum.request({ method: "eth_requestAccounts" });
  }

  async function getAllCallOption() {
    if (typeof window.ethereum !== "undefined") {
      const provider = ethers.getDefaultProvider("goerli");
      const contract = new ethers.Contract(
        CallFactoryAddress,
        OptionFactory.abi,
        provider
      );
      try {
        contract.getCallOptions().then((data) => {
          setCallOptions(data);
          console.log("All call options equal");
          console.log(data);
        });
      } catch (err) {
        console.log("Error: ", err);
      }
    }
  }
  async function getAllPutOption() {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(
        PutFactoryAddress,
        OptionPutFactory.abi,
        provider
      );
      try {
        let putContracts = await contract.getPutOptions();
        setPutOptions(putContracts);
        console.log("All put options equal" + putOptions);
      } catch (err) {
        console.log("Error: ", err);
      }
    }
  }

  async function mintOption(e) {
    e.preventDefault();
    if (typeof window.ethereum !== "undefined") {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        e.target[0].value == "call" ? CallFactoryAddress : PutFactoryAddress,
        e.target[0].value == "call" ? OptionFactory.abi : OptionPutFactory.abi,
        signer
      );
      try {
        let addr = await signer.getAddress();
        e.target[0].value == "call"
          ? await contract.mintCallOption(
              addr,
              e.target[1].value,
              fDAIx,
              dai,
              e.target[3].value,
              e.target[2].value,
              e.target[5].value,
              e.target[6].value,
              e.target[7].value,
              e.target[8].value,
              getTime(e.target[9].value),
              e.target[4].value
            )
          : await contract.mintPutOption(
              addr,
              e.target[1].value,
              fDAIx,
              dai,
              e.target[3].value,
              e.target[2].value,
              e.target[5].value,
              e.target[6].value,
              e.target[7].value,
              e.target[8].value,
              getTime(e.target[9].value),
              e.target[4].value
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

  function getTime(val) {
    return Date.parse(val);
  }

  return (
    <div className={styles.container}>
      <h1>All Option</h1>
      <ConnectWallet />

      <section>
        Mint Option
        <form onSubmit={mintOption}>
          <input placeholder="call/put" required></input>
          <input placeholder="name" required></input>
          <input placeholder="underlyamount" required></input>
          <input placeholder="underlyasset" required></input>
          <input placeholder="strike price" required></input>
          <input placeholder="purchase decimal" required></input>
          <input placeholder="price feed" required></input>
          <input placeholder="price feed decimal" required></input>
          <input placeholder="flow rate per sec" required></input>
          <input placeholder="expiration" type="date" required></input>
          <button>submit</button>
        </form>
      </section>

      <section>Call</section>
      {callOptions.map((co, index) => {
        return (
          <div key={index}>
            <a href={`/call/${co}`}>
              {index + 1} address: {co}
            </a>
          </div>
        );
      })}

      <section>Put</section>
    </div>
  );
}
