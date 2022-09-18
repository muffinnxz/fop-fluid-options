import { useEffect, useState } from "react";
import TradeablePutOption from "../../contracts/artifacts/contracts/TradeablePutOption.sol/TradeablePutOption.json";
import TradeableCallOption from "../../contracts/artifacts/contracts/TradeableCallOption.sol/TradeableCallOption.json";
import { ethers } from "ethers";
import h2d from "../utils/h2d";
const Web3 = require("web3");

export default function Card({ type, option }) {
  const [name, setName] = useState();
  const [owner, setOwner] = useState();
  const [expiry, setExpiry] = useState();
  const [strike, setStrike] = useState();

  useEffect(() => {
    getAllInformation(option);
  }, []);

  function getDate(x) {
    const myDate = new Date(x * 1000);
    return myDate;
  }

  const web3 = new Web3(Web3.givenProvider);

  async function getAllInformation(optionAddress) {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(
        optionAddress,
        type == "call" ? TradeableCallOption.abi : TradeablePutOption.abi,
        provider
      );
      try {
        // let _name = await contract.name();
        // let _owner = await contract.owner();
        // let _expiry = await contract._expirationDate();
        contract.name().then((data) => {
          setName(data);
        });
        contract._receiver().then((data) => {
          setOwner(data.substring(0, 6) + "..." + data.substring(38));
        });
        contract._expirationDate().then((data) => {
          setExpiry(getDate(data).toLocaleString().substring(0, 9));
        });
        contract._strikePrice().then((data) => {
          let price = h2d(data._hex);
          setStrike(price / 10 ** 18);
        });
      } catch (err) {
        console.log("Error: ", err);
      }
    }
  }
  return (
    <footer className="px-8  ml-16 mr-64 py-3 border rounded-lg bg-teal-50 grid grid-cols-6 gap-4">
      <div className="px-14 col-span-2">{name}</div>
      <div>{strike}</div>

      <div>{expiry}</div>
      <div
        className={`border px-1 rounded-md justify-self-center ${
          type == "call" ? "bg-green-200" : "bg-red-200"
        }
          ${type == "call" ? "text-green-800" : "text-red-800"}`}
      >
        {type == "call" ? "Call" : "Put"}
      </div>
      <div>{owner}</div>
    </footer>
  );
}
