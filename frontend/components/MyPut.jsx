import styles from "../styles/Home.module.css";
import OptionPutFactory from "../../contracts/artifacts/contracts/OptionPutFactory.sol/OptionPutFactory.json";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Card from "./Card";

export default function MyPut() {
  const PutFactoryAddress = "0x264569c1325C26e41832dE6C8D978d59fCb05D60";
  const [putOptions, setPutOptions] = useState([]);

  useEffect(() => {
    getAllPutOption();
  }, []);

  async function requestAccount() {
    await window.ethereum.request({ method: "eth_requestAccounts" });
  }

  async function getAllPutOption() {
    if (typeof window.ethereum !== "undefined") {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      const contract = new ethers.Contract(
        PutFactoryAddress,
        OptionPutFactory.abi,
        provider
      );
      try {
        contract.getPutOptionsByWallet(address).then((data) => {
          setPutOptions(data);
          console.log("All put options equal");
          console.log(data);
        });
      } catch (err) {
        console.log("Error: ", err);
      }
    }
  }
  return (
    <div>
      {putOptions.map((co, index) => {
        return (
          <div key={index}>
            <a href={`/put/${co}`}>
              {/* {index + 1} address: {co} */}
              <Card type="put" option={co} />
            </a>
          </div>
        );
      })}
    </div>
  );
}
