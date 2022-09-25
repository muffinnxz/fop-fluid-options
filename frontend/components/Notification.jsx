import * as EpnsAPI from "@epnsproject/sdk-restapi";
import { NotificationItem, chainNameType } from "@epnsproject/sdk-uiweb";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

export default function Notification() {
    const [notifications, setNotifications] = useState([]);
    const { address } = useAccount();
    const CAIP = "eip155:1:";
    const channelAddress = "0x8dddb1f327113a90d6819c3a9ca574e6a81caeee";

    useEffect(() => {
        if (address) {
            getNotifications();
        }
    }, [address]);

    async function getNotifications() {
        const notifications = await EpnsAPI.user.getFeeds({
            user: CAIP + address, // user address in CAIP
            env: "staging",
        });
        setNotifications(notifications);
    }

    return (
        <div className="w-full">
            {notifications.map((oneNotification, i) => {
                const {
                    cta,
                    title,
                    message,
                    app,
                    icon,
                    image,
                    url,
                    blockchain,
                    notification,
                    theme
                } = oneNotification;

                console.log(oneNotification);

                return (
                    <NotificationItem
                        key={i} // any unique id
                        notificationTitle={notification.title}
                        notificationBody={notification.body}
                        cta={cta}
                        app={app}
                        icon={icon}
                        image={image}
                        url={url}
                        theme={theme}
                        chainName={blockchain}
                        // chainName={blockchain as chainNameType} // if using Typescript
                    />
                );
            })}
        </div>
    );
}
