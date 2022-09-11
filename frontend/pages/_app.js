import { WagmiConfig } from "wagmi";
import { wagmiClient } from "../components/ConnectButton";
import "../styles/globals.css";

function MyApp({ Component, pageProps }) {
    return (
        <WagmiConfig client={wagmiClient}>
            {" "}
            <Component {...pageProps} />{" "}
        </WagmiConfig>
    );
}

export default MyApp;
