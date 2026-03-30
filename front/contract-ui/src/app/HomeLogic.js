"use client";

import { useWallet } from "./context/WalletContext";

export default function useHome() {
    const { account, connectWallet } = useWallet();

    return {
        account,
        connectWallet,
    };
}
