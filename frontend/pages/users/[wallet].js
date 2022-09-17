import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useRouter } from "next/router";

export default function User() {
  const router = useRouter();
  const [userWalletAddress, setUserWalletAddress] = useState();

  useEffect(() => {
    setUserWalletAddress(router.query.wallet);
    !router.isReady ? console.log("loading") : console.log("ready");
  }, [router.isReady, router.query.wallet]);

  return (
    <div className=" h-screen">
      <h1>userWalletAddress:{userWalletAddress}</h1>
      <section>Call</section>
      <section>Put</section>
    </div>
  );
}
