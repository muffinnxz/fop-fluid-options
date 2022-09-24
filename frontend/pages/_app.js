import { WagmiConfig } from "wagmi";
import { wagmiClient } from "../components/ConnectButton";
import Navbar from "../components/Navbar";
import "../styles/globals.css";
import { Toaster } from "react-hot-toast";

function MyApp({ Component, pageProps }) {
  return (
    <WagmiConfig client={wagmiClient}>
      {" "}
      <Navbar />
      <Toaster />
      <Component {...pageProps} />{" "}
    </WagmiConfig>
  );
}

export default MyApp;
