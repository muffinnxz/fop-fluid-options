import styles from "../styles/Home.module.css";
import OptionFactory from "../../contracts/artifacts/contracts/OptionFactory.sol/OptionFactory.json";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Card from "./Card";

export default function MyCall() {
  const CallFactoryAddress = "0xca0BF23f1Ea4E08ea053691C0Dd0C066b0c31665";
  const [callOptions, setCallOptions] = useState([]);

  useEffect(() => {
    getAllCallOption();
  }, []);

  async function requestAccount() {
    await window.ethereum.request({ method: "eth_requestAccounts" });
  }

  async function getAllCallOption() {
    if (typeof window.ethereum !== "undefined") {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      const contract = new ethers.Contract(
        CallFactoryAddress,
        OptionFactory.abi,
        provider
      );
      try {
        contract.getCallOptionsByWallet(address).then((data) => {
          setCallOptions(data);
          console.log("All call options equal");
          console.log(data);
        });
      } catch (err) {
        console.log("Error: ", err);
      }
    }
  }
  return (
    <div>
      {" "}
      Call
      {callOptions.map((co, index) => {
        return (
          <div key={index}>
            <a href={`/call/${co}`}>
              {/* {index + 1} address: {co} */}
              <Card type="call" option={co} />
            </a>
          </div>
        );
      })}
    </div>
  );
}
