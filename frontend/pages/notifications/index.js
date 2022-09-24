import { Button } from "@nextui-org/react";
import * as EpnsAPI from "@epnsproject/sdk-restapi";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import { useEffect, useState } from "react";

/*
"0x8dddb1f327113a90d6819c3a9ca574e6a81caeee"
*/

export default function User() {
    const { address } = useAccount();
    const [subscriptions, setSubscriptions] = useState([]);
    const CAIP = "eip155:42:";
    const channelAddress = "0x8dddb1f327113a90d6819c3a9ca574e6a81caeee";

    useEffect(() => {
        if (address) {
            getSubscriptions();
        }
    }, [address]);

    async function getSubscriptions() {
        const subscriptions = await EpnsAPI.user.getSubscriptions({
            user: CAIP + address, // user address in CAIP
            env: "staging",
        });
        setSubscriptions(subscriptions.map((v) => v.channel));
    }

    async function subscribe() {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        await EpnsAPI.channels.subscribe({
            signer: signer,
            channelAddress: CAIP + channelAddress, // channel address in CAIP
            userAddress: CAIP + address, // user address in CAIP
            onSuccess: () => {
                console.log("opt in success");
            },
            onError: () => {
                console.error("opt in error");
            },
            env: "staging",
        });
    }

    async function unsubscribe() {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        await EpnsAPI.channels.unsubscribe({
            signer: signer,
            channelAddress: CAIP + channelAddress, // channel address in CAIP
            userAddress: CAIP + address, // user address in CAIP
            onSuccess: () => {
                console.log("opt out success");
            },
            onError: () => {
                console.error("opt out error");
            },
            env: "staging",
        });
    }

    async function testNotify() {
        const PK = process.env.REACT_APP_EPNS_OWNER;
        const Pkey = `0x${PK}`;
        const signer = new ethers.Wallet(Pkey);
        const apiResponse = await EpnsAPI.payloads.sendNotification({
            signer,
            type: 3, // target
            identityType: 2, // direct payload
            notification: {
                title: `[SDK-TEST] notification TITLE:`,
                body: `[sdk-test] notification BODY`,
            },
            payload: {
                title: `[sdk-test] payload title`,
                body: `sample msg body`,
                cta: "",
                img: "",
            },
            recipients: CAIP + address, // recipient address
            channel: CAIP + channelAddress, // your channel address
            env: "staging",
        });
        console.log(apiResponse);
    }

    return (
        <div>
            <h1 className="font-bold text-2xl mx-24 px-4 mt-6">
                Notifications
            </h1>
            <div>
                {console.log(
                    subscriptions,
                    channelAddress,
                    subscriptions.includes(channelAddress)
                )}
            </div>
            <div className="mx-24 px-4 mt-6">
                {subscriptions.includes(channelAddress) ? (
                    <Button
                        onPress={() => {
                            unsubscribe();
                        }}
                    >
                        Unsubscribe
                    </Button>
                ) : (
                    <Button
                        onPress={() => {
                            subscribe();
                        }}
                    >
                        Subscribe
                    </Button>
                )}
                <Button
                    className="mt-5"
                    onPress={() => {
                        testNotify();
                    }}
                >
                    Test Notify
                </Button>
            </div>
        </div>
    );
}
