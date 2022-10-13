import ConnectWallet from "./ConnectButton";
import { useRouter } from "next/router";
import LoginButton from "./login-button";

export default function Navbar() {
  const router = useRouter();
  return (
    <nav className="m-0 py-2 pt-4 px-5 font-bold  bg-gray-300 flex flex-row justify-between shadow-lg border-b-2 border-slate-300">
      <div className="flex flex-row gap-x-16">
        <h1
          onClick={() => router.push(`/`)}
          className="ml-10 hover:text-white text-3xl font-medium cursor-pointer"
        >
          💦 Fluid Options
        </h1>

        <div className="flex flex-row gap-x-10 ">
          <button
            className="border bg-gray-100  -ml-4   font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"
            onClick={() => router.push(`/`)}
          >
            Marketplace
          </button>
        </div>
      </div>

      <div className="flex flex-row gap-6">
        <button
          type="button"
          className="border bg-gray-100    font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"
          onClick={() => router.push(`/my-option`)}
        >
          My Options
        </button>
        <button
          type="button"
          className="border bg-gray-100    font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"
          onClick={() => router.push(`/notifications`)}
        >
          Notifications
        </button>
        <LoginButton/>
      </div>
    </nav>
  );
}
