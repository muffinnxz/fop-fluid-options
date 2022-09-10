import styles from "../styles/Home.module.css";
import { ethers } from "ethers";
import OptionFactory from "../../contracts/artifacts/contracts/OptionFactory.sol/OptionFactory.json";
import OptionPutFactory from "../../contracts/artifacts/contracts/OptionPutFactory.sol/OptionPutFactory.json";
import { useState, useEffect } from "react";
import ConnectWallet from "../components/ConnectButton";

export default function Home() {
  const CallFactoryAddress = "0x26A13d6216667B33D41Da85849D9aC91B5c2985b";
  const PutFactoryAddress = "0x78bDbe64882E16E98934d34c76D0a443f814081D";
  const host = "0x22ff293e14F1EC3A09B137e9e06084AFd63adDF9";
  const cfa = "0xEd6BcbF6907D4feEEe8a8875543249bEa9D308E8";
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
        let callContracts = await contract.getCallOptions();
        // setCallOptions(callContracts);
        console.log("All call options equal");
        console.log(callContracts);
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
      // const contract = new ethers.Contract(
      //   e.target[0].value == "call" ? CallFactoryAddress : PutFactoryAddress,
      //   e.target[0].value == "call" ? OptionFactory.abi : OptionPutFactory.abi,
      //   signer
      // );
      const contract = new ethers.Contract(
        CallFactoryAddress,
        OptionFactory.abi,
        signer
      );
      console.log(await signer.getAddress());
      console.log(await signer);
      try {
        // e.target[0].value == "call"
        //   ?
        let addr = await signer.getAddress();
        const data = await contract.mintCallOption(
          addr,
          "test1",
          "ts1",
          host,
          cfa,
          fDAIx,
          dai
        );
        // :
        // await contract.mintPutOption(
        //   await signer.getAddress(),
        //   e.target[1].value,
        //   e.target[2].value,
        //   host,
        //   cfa,
        //   fDAIx,
        //   dai
        // );
        console.log("mint success");
      } catch (err) {
        console.log("Error: ", err);
      }
    }
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
          <input placeholder="symbol" required></input>
          <button>submit</button>
        </form>
      </section>

      <section>Call</section>

      <section>Put</section>
    </div>
  );
}
