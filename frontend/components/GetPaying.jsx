import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { ConstantFlowAgreementV1 } from "@superfluid-finance/sdk-core";
import { Framework } from "@superfluid-finance/sdk-core";
import OptionFactory from "../../contracts/artifacts/contracts/OptionFactory.sol/OptionFactory.json";
import Card from "./Card";
import { paperClasses } from "@mui/material";

const config = {
  hostAddress: "0xEB796bdb90fFA0f28255275e16936D25d3418603",
  cfaV1Address: "0x49e565Ed1bdc17F3d220f72DF0857C26FA83F873",
  // idaV1Address: "0xB0aABBA4B2783A72C52956CDEF62d438ecA2d7a1",
};

const fDAIx = "0x5D8B4C2554aeB7e86F387B4d6c00Ac33499Ed01f";
// const cfaV1 = new ConstantFlowAgreementV1({ options: config });

const CallFactoryAddress = "0xb5fd8b23C8085d3d767d3817e89F111d320de151";
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
      const provider = new ethers.providers.Web3Provider(window.ethereum);
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
