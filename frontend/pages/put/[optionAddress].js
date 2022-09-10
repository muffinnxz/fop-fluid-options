import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useRouter } from "next/router";

export default function User() {
  const router = useRouter();
  const [optionAddress, setOptionAddress] = useState();

  useEffect(() => {
    setOptionAddress(router.query.optionAddress);
    !router.isReady ? console.log("loading") : console.log("ready");
  }, [router.isReady]);

  return (
    <div className=" h-screen">
      <h1>optionAddress:{optionAddress}</h1>
    </div>
  );
}
