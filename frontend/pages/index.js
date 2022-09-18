import styles from "../styles/Home.module.css";
import { ethers } from "ethers";
import OptionPutFactory from "../../contracts/artifacts/contracts/OptionPutFactory.sol/OptionPutFactory.json";
import { useState } from "react";
import Web3 from "web3";

import Call from "../components/Call";
import Card from "../components/Card";

export default function Home() {
  const CallFactoryAddress = "0xca0BF23f1Ea4E08ea053691C0Dd0C066b0c31665";
  const PutFactoryAddress = "0x264569c1325C26e41832dE6C8D978d59fCb05D60";
  const fDAIx = "0xF2d68898557cCb2Cf4C10c3Ef2B034b2a69DAD00";
  const dai = "0x88271d333C72e51516B67f5567c728E702b3eeE8";

  const [putOptions, setPutOptions] = useState([]);

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

  return (
    <div className={styles.container}>
      <h1>All Option</h1>

      <section>
        <Call />
        {/* <Card type="call" option="0xBD6D2350eB0e4D157eF5D22a71eD9F8fB3FfF28D" /> */}
      </section>
      <section>Put</section>
    </div>
  );
}
