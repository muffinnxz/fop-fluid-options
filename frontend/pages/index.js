import styles from "../styles/Home.module.css";
import { ethers } from "ethers";
import OptionPutFactory from "../../contracts/artifacts/contracts/OptionPutFactory.sol/OptionPutFactory.json";
import { useState } from "react";
import Web3 from "web3";
import { toast } from "react-hot-toast";

import Call from "../components/Call";
import Card from "../components/Card";
import PaginatedItems from "../components/CallPagination";
import PaginatedCallItems from "../components/CallPagination";
import PaginatedPutItems from "../components/PutPagination";

export default function Home() {
  const CallFactoryAddress = "0xca0BF23f1Ea4E08ea053691C0Dd0C066b0c31665";
  const PutFactoryAddress = "0x264569c1325C26e41832dE6C8D978d59fCb05D60";
  const fDAIx = "0xF2d68898557cCb2Cf4C10c3Ef2B034b2a69DAD00";
  const dai = "0x88271d333C72e51516B67f5567c728E702b3eeE8";

  const [filterCall, setFilterCall] = useState(true);
  const [filterPut, setFilterPut] = useState(false);

  return (
    <div className={styles.container}>
      <h1 className="font-bold text-2xl  mx-24 px-4 mt-6">Marketplace</h1>
      <div className="ml-28 mt-2 gap-2 py-8 flex flex-row w-64">
        Filter by:
        <div className="border px-1  py-1 -mt-1 gap-1 rounded-md flex flex-row">
          <div className="flex  items-center ">
            <button
              className={`rounded-xl border ${
                filterCall ? "bg-teal-400 text-white" : ""
              }
              px-4 `}
              onClick={(e) => {
                setFilterCall(!filterCall);
                setFilterPut(!filterPut);
              }}
            >
              Call
            </button>
          </div>
          <div className="flex items-center">
            <button
              className={`rounded-xl border ${
                filterPut ? "bg-teal-400 text-white" : ""
              }
              px-4 `}
              onClick={(e) => {
                setFilterPut(!filterPut);
                setFilterCall(!filterCall);
              }}
            >
              Put
            </button>
          </div>
        </div>
      </div>
      <section>
        <div className="px-5 pt-4 -mt-4 mx-20  py-3 border-b   grid grid-cols-4 gap-4">
          <div className="pl-8 ml-6 col-span-2 flex">
            Name{" "}
            <button
              className="pl-1"
              onClick={() =>
                toast(
                  "Name format: 'type'-'strike_price'-[underlying_asset/purchasing_asset]-[underlying_amount/purchasing_amount]-streaming_token-expiration_date",
                  {
                    duration: 10000,
                  }
                )
              }
            >
              {" "}
              ℹ️{" "}
            </button>
          </div>

          {/* <div ></div> */}
          <div className="-ml-16 flex flex-row justify-start gap-12">
            <h1 className="-ml-2 w-20">Strike</h1>
            <h1 className="ml-7 w-25">Expiry</h1>

            <div className={`ml-12 px-1 rounded-md justify-self-center `}>
              Type
            </div>
          </div>

          <div className="flex flex-row justify-center ">
            <h1 className="-ml-12 w-32">Owner</h1>
          </div>
        </div>
        {filterCall ? <PaginatedCallItems itemsPerPage={6} /> : <div></div>}
        {filterPut ? <PaginatedPutItems itemsPerPage={6} /> : <div></div>}
      </section>
    </div>
  );
}
