import { useEffect, useState } from "react";
import TradeablePutOption from "../../contracts/artifacts/contracts/TradeablePutOption.sol/TradeablePutOption.json";
import TradeableCallOption from "../../contracts/artifacts/contracts/TradeableCallOption.sol/TradeableCallOption.json";
import { ethers } from "ethers";
import h2d from "../utils/h2d";
import makeBlockie from "ethereum-blockies-base64";
import { formatUnits, parseUnits } from "ethers/lib/utils";

const Web3 = require("web3");

export default function Card({ type, option }) {
  const [name, setName] = useState();
  const [owner, setOwner] = useState();
  const [expiry, setExpiry] = useState();
  const [strike, setStrike] = useState();

  useEffect(() => {
    getAllInformation(option);
  }, [option]);

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
          console.log(formatUnits(price, 18));
          setStrike(formatUnits(price, 18)); // TODO: FIX TO IT's DECIMAL // FIX TO PUT
        });
      } catch (err) {
        console.log("Error: ", err);
      }
    }
  }
  return (
    // ${type == "call" ? "bg-teal-50" : "bg-red-50"}
    <footer
      className={`px-10  mx-20  py-3 border-b  
      grid grid-cols-4 gap-4`}
    >
      <div className="pl-8 col-span-2">{name}</div>

      <div className="-ml-16 flex flex-row justify-start gap-12">
        <h1 className=" w-20">{strike}</h1>
        <h1 className="w-20">{expiry}</h1>

        <div
          className={`border px-3 h-5 rounded-xl mt-1 justify-self-center ${
            type == "call" ? "bg-green-200" : "bg-red-200"
          }
          ${type == "call" ? "text-green-800" : "text-red-800"}`}
        >
          <h1 className="-mt-1">{type == "call" ? "Call" : "Put"}</h1>
        </div>
      </div>

      <div className="flex flex-row justify-center gap-4">
        <img src={makeBlockie(String(owner))} className="w-8 h-8" />
        <h1 className="w-32">{owner}</h1>
      </div>
    </footer>
  );
}
