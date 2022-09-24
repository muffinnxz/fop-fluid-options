import { useEffect, useState } from "react";
import TradeablePutOption from "../../contracts/artifacts/contracts/TradeablePutOption.sol/TradeablePutOption.json";
import TradeableCallOption from "../../contracts/artifacts/contracts/TradeableCallOption.sol/TradeableCallOption.json";
import { ethers } from "ethers";
import h2d from "../utils/h2d";
import makeBlockie from "ethereum-blockies-base64";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { Blocks } from "react-loader-spinner";
import { Tooltip } from "@mui/material";

const Web3 = require("web3");

export default function Card({ type, option }) {
  const [name, setName] = useState(null);
  const [owner, setOwner] = useState(null);
  const [expiry, setExpiry] = useState(null);
  const [strike, setStrike] = useState(null);
  const [isActive, setIsActive] = useState(null);
  const [isReady, setIsReady] = useState(null);

  useEffect(() => {
    getAllInformation(option);
  }, [option]);

  function getDate(x) {
    const myDate = new Date(x * 1000);
    return myDate;
  }

  function getTime(val) {
    val = new Date(val);
    return val.getTime() / 1000.0;
  }

  const getCurrentTimeStamp = () => {
    let val = new Date();
    return val.getTime() / 1000.0;
  };

  const web3 = new Web3(Web3.givenProvider);

  async function getAllInformation(optionAddress) {
    setName(null);
    setOwner(null);
    setExpiry(null);
    setStrike(null);
    setIsActive(null);
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
          setExpiry(getDate(data).toLocaleString());
        });
        contract._strikePrice().then((data) => {
          let price = h2d(data._hex);
          console.log(formatUnits(price, 18));
          setStrike(formatUnits(price, 18)); // TODO: FIX TO IT's DECIMAL // FIX TO PUT
        });
        contract.optionActive().then((data) => setIsActive(data));
        contract.optionReady().then((data) => setIsReady(data));
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
      {(!strike ||
        !name ||
        !expiry ||
        !owner ||
        isActive === null ||
        isReady === null) && (
        <div className="col-span-4 m-auto -my-3 ">
          <Blocks
            visible={true}
            height="40"
            width="40"
            ariaLabel="blocks-loading"
            wrapperStyle={{}}
            wrapperclassName="blocks-wrapper"
          />
        </div>
      )}

      <div className="pl-8 col-span-2">{name}</div>

      <div className="-ml-16 flex flex-row justify-start gap-12">
        <Tooltip title={strike ? strike : ""} arrow>
          <h1 className=" w-20">{strike && strike.substring(0, 8)}</h1>
        </Tooltip>

        <h1 className="w-25 text-sm -py-1 text-center">
          {expiry &&
            ((!isReady && !isActive) || getTime(expiry) <= getCurrentTimeStamp()
              ? "Option has been Expired "
              : expiry)}
        </h1>

        {(strike || name || expiry || owner) && (
          <div
            className={`border px-3 h-5 rounded-xl mt-1 justify-self-center ${
              type == "call" ? "bg-green-200" : "bg-red-200"
            }
    ${type == "call" ? "text-green-800" : "text-red-800"}`}
          >
            <h1 className="-mt-1">{type == "call" ? "Call" : "Put"}</h1>
          </div>
        )}
      </div>

      <div className="flex flex-row justify-center gap-4">
        {owner && <img src={makeBlockie(String(owner))} className="w-8 h-8" />}
        <h1 className="w-32">{owner}</h1>
      </div>
    </footer>
  );
}
