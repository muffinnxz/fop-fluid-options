import styles from "../styles/Home.module.css";
import { ethers } from "ethers";
import OptionFactory from "../../contracts/artifacts/contracts/OptionFactory.sol/OptionFactory.json";
import { useState, useEffect } from "react";

export default function Home() {
  const OptionFactoryAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  const [callOptions, setCallOptions] = useState([]);

  useEffect(() => {
    getAllCallOption();
  }, []);

  async function getAllCallOption() {
    if (typeof window.ethereum !== "undefined") {
      const provider = ethers.getDefaultProvider("goerli");
      const contract = new ethers.Contract(
        OptionFactoryAddress,
        OptionFactory.abi,
        provider
      );
      try {
        let callContracts = await contract.getCallOptions();
        setCallOptions(callContracts);
        console.log("All call options equal" + callOptions);
      } catch (err) {
        console.log("Error: ", err);
      }
    }
  }

  // function getAllPutOption() {}

  return (
    <div className={styles.container}>
      <h1>All Option</h1>

      <section>Call</section>

      <section>Put</section>
    </div>
  );
}
