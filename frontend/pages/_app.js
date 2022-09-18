import { WagmiConfig } from "wagmi";
import { wagmiClient } from "../components/ConnectButton";
import Navbar from "../components/Navbar";
import "../styles/globals.css";

function MyApp({ Component, pageProps }) {
  return (
    <WagmiConfig client={wagmiClient}>
      {" "}
      <Navbar />
      <Component {...pageProps} />{" "}
    </WagmiConfig>
  );
}

export default MyApp;
