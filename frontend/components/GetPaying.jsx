import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { ConstantFlowAgreementV1 } from "@superfluid-finance/sdk-core";
import { Framework } from "@superfluid-finance/sdk-core";
import OptionFactory from "../../contracts/artifacts/contracts/OptionFactory.sol/OptionFactory.json";
import Card from "./Card";
import { paperClasses } from "@mui/material";

const config = {
  hostAddress: "0x22ff293e14F1EC3A09B137e9e06084AFd63adDF9",
  cfaV1Address: "0xEd6BcbF6907D4feEEe8a8875543249bEa9D308E8",
  // idaV1Address: "0xB0aABBA4B2783A72C52956CDEF62d438ecA2d7a1",
};

const fDAIx = "0xF2d68898557cCb2Cf4C10c3Ef2B034b2a69DAD00";
// const cfaV1 = new ConstantFlowAgreementV1({ options: config });

const CallFactoryAddress = "0xca0BF23f1Ea4E08ea053691C0Dd0C066b0c31665";
export default function GetPaying() {
  const [items, setItems] = useState([]);
  const [paying, setPaying] = useState([]);

  useEffect(() => {
    getAllCallOption();
  }, []);

  useEffect(() => {
    hello();
  }, [items]);

  async function getAllCallOption() {
    if (typeof window.ethereum !== "undefined") {
      const provider = ethers.getDefaultProvider("goerli");
      const contract = new ethers.Contract(
        CallFactoryAddress,
        OptionFactory.abi,
        provider
      );
      try {
        contract.getCallOptions().then(([...data]) => {
          console.log(data.reverse());
          //   let rev_data = data.reverse();
          setItems(data);
          console.log("All call options equal");
        });
      } catch (err) {
        console.log("Error: ", err);
      }
    }
  }

  async function hello() {
    setPaying([]);
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    const signer = provider.getSigner();

    const chainId = await window.ethereum.request({
      method: "eth_chainId",
    });
    const sf = await Framework.create({
      chainId: Number(chainId),
      provider: provider,
    });
    let signerAdd = await signer.getAddress();
    items.forEach(async (i) => {
      try {
        let flow = await sf.cfaV1.getFlow({
          superToken: fDAIx,
          sender: signerAdd,
          receiver: i,
          providerOrSigner: signer,
        });
        if (flow.deposit !== "0") {
          setPaying([...paying, i]);
        }
      } catch (e) {
        console.log(e);
      }
    });
  }

  return (
    <div>
      {paying.map((i) => {
        return <Card option={i}></Card>;
      })}
    </div>
  );
}
